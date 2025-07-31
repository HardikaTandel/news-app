import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import { summarizeArticle, generateRecommendations, analyzeTrendingTopics } from '../services/aiService.js';
import NERService from '../services/nerServiceHF.js';

const router = express.Router();



// Fetch news with optional authentication
router.get('/fetch', async (req, res) => {
  try {
    const { region = 'in', category = 'general' } = req.query;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    const apiKey = process.env.GNEWS_API_KEY;
    const url = `https://gnews.io/api/v4/top-headlines?country=${region}&category=${category}&lang=en&token=${apiKey}`;
    const response = await axios.get(url);
    const articles = response.data.articles || [];
    
    if (!articles || articles.length === 0) {
      return res.status(404).json({ message: 'No news found' });
    }

    // Add unique IDs and metadata to articles
    const articlesWithMetadata = articles.map((article, index) => ({
      ...article,
      articleId: `${region}-${category}-${index}-${Date.now()}`,
      category,
      region,
      publishedAt: article.publishedAt || new Date().toISOString()
    }));

    // If user is authenticated, get recommendations only
    if (token) {
      try {
        // Decode the token to get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('readingHistory');
        const recommendations = await generateRecommendations(user?.readingHistory || [], articlesWithMetadata);
        
        return res.json({
          articles: articlesWithMetadata,
          recommendations
        });
      } catch (error) {
        console.error('Error processing authenticated request:', error);
        // Return articles without recommendations if there's an error
        return res.json({ articles: articlesWithMetadata });
      }
    }

    res.json({ articles: articlesWithMetadata });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Error fetching news' });
  }
});

// Get user bookmarks
router.get('/bookmarks', auth, async (req, res) => {
  try {
    console.log('Fetching bookmarks for user:', req.user._id);
    const user = await User.findById(req.user._id);
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('Bookmarks count:', user?.bookmarks?.length || 0);
    res.json({ bookmarks: user.bookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ message: 'Error fetching bookmarks' });
  }
});

// Toggle bookmark
router.post('/bookmark', auth, async (req, res) => {
  try {
    console.log('Bookmark request received');
    console.log('User ID:', req.user._id);
    console.log('Article data:', req.body.article);
    
    const { article } = req.body;
    const user = await User.findById(req.user._id);
    
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('Current bookmarks count:', user?.bookmarks?.length || 0);
    
    const isBookmarked = user.toggleBookmark(article);
    await user.save();
    
    console.log('Bookmark toggled, isBookmarked:', isBookmarked);
    console.log('New bookmarks count:', user.bookmarks.length);
    
    res.json({ 
      message: isBookmarked ? 'Article bookmarked' : 'Bookmark removed',
      isBookmarked 
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ message: 'Error toggling bookmark' });
  }
});

// Add to reading history
router.post('/read', auth, async (req, res) => {
  try {
    const { article } = req.body;
    const user = await User.findById(req.user._id);
    
    user.addToReadingHistory(article);
    await user.save();
    
    res.json({ message: 'Added to reading history' });
  } catch (error) {
    console.error('Error adding to reading history:', error);
    res.status(500).json({ message: 'Error adding to reading history' });
  }
});

// Get reading history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ readingHistory: user.readingHistory });
  } catch (error) {
    console.error('Error fetching reading history:', error);
    res.status(500).json({ message: 'Error fetching reading history' });
  }
});

// Get article summary
router.post('/summarize', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    
    const summary = await summarizeArticle(title, description);
    
    if (!summary) {
      return res.status(500).json({ message: 'Error generating summary' });
    }
    
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ message: 'Error generating summary' });
  }
});

// Get recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Fetch some recent news for recommendations
    const apiKey = process.env.GNEWS_API_KEY;
    const url = `https://gnews.io/api/v4/top-headlines?country=us&category=general&lang=en&token=${apiKey}`;
    
    const response = await axios.get(url);
    const articles = response.data.articles.map((article, index) => ({
      ...article,
      articleId: `rec-${index}-${Date.now()}`,
      category: 'general',
      region: 'us'
    }));
    
    const recommendations = await generateRecommendations(user.readingHistory, articles);
    
    res.json({ recommendations });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findById(req.user._id);
    
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    
    res.json({ 
      message: 'Preferences updated',
      preferences: user.preferences 
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Error updating preferences' });
  }
});

// Get trending entities from current news
router.get('/trending-entities', async (req, res) => {
  try {
    console.log('Trending entities request received');
    const { region = 'in', category = 'general' } = req.query;
    
    // Fetch current news
    const apiKey = process.env.GNEWS_API_KEY;
    const url = `https://gnews.io/api/v4/top-headlines?country=${region}&category=${category}&lang=en&token=${apiKey}`;
    
    console.log('Fetching news from:', url);
    const response = await axios.get(url);
    const articles = response.data.articles || [];
    console.log('Fetched', articles.length, 'articles');
    
    // Extract trending entities
    const trendingEntities = await NERService.getTrendingEntities(articles, 6);
    console.log('Extracted', trendingEntities.length, 'trending entities');
    
    res.json({ trendingEntities });
  } catch (error) {
    console.error('Error fetching trending entities:', error);
    // Return mock entities instead of error
    const mockEntities = [
      { text: 'India', label: 'GPE', count: 5 },
      { text: 'United States', label: 'GPE', count: 4 },
      { text: 'China', label: 'GPE', count: 3 },
      { text: 'Technology', label: 'ORG', count: 3 },
      { text: 'Economy', label: 'ORG', count: 2 }
    ];
    res.json({ trendingEntities: mockEntities });
  }
});

// Get entities from a specific article
router.post('/extract-entities', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    
    const text = `${title} ${description}`;
    const entities = await NERService.extractEntities(text);
    
    res.json({ entities });
  } catch (error) {
    console.error('Error extracting entities:', error);
    res.status(500).json({ message: 'Error extracting entities' });
  }
});



// Get related articles based on entities
router.post('/related-articles', async (req, res) => {
  try {
    const { targetArticle, region = 'in', category = 'general' } = req.body;
    
    if (!targetArticle) {
      return res.status(400).json({ message: 'Target article is required' });
    }
    
    // Fetch current news for comparison
    const apiKey = process.env.GNEWS_API_KEY;
    const url = `https://gnews.io/api/v4/top-headlines?country=${region}&category=${category}&lang=en&token=${apiKey}`;
    
    const response = await axios.get(url);
    const articles = response.data.articles || [];
    
    // Find related articles
    const relatedArticles = await NERService.findRelatedArticles(targetArticle, articles, 5);
    
    res.json({ relatedArticles });
  } catch (error) {
    console.error('Error finding related articles:', error);
    res.status(500).json({ message: 'Error finding related articles' });
  }
});

export default router; 
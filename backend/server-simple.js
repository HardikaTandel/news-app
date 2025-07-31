import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: './config.env' });

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Backend is running without database'
  });
});

// Simple news fetching endpoint
app.get('/api/news/fetch', async (req, res) => {
  try {
    const { region = 'in', category = 'general' } = req.query;
    
    const apiKey = process.env.GNEWS_API_KEY || 'c03ea62d3352cf0090728b8d6ce7e9ec';
    const url = `https://gnews.io/api/v4/top-headlines?country=${region}&category=${category}&lang=en&token=${apiKey}`;

    const response = await axios.get(url);
    
    if (!response.data.articles) {
      return res.status(404).json({ message: 'No news found' });
    }

    // Add unique IDs and metadata to articles
    const articles = response.data.articles.map((article, index) => ({
      ...article,
      articleId: `${region}-${category}-${index}-${Date.now()}`,
      category,
      region,
      publishedAt: article.publishedAt || new Date().toISOString()
    }));

    res.json({ articles });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Error fetching news' });
  }
});

// Mock authentication endpoints (for testing UI)
app.post('/api/auth/register', (req, res) => {
  res.status(200).json({
    message: 'Registration successful (mock)',
    token: 'mock-jwt-token',
    user: {
      id: 'mock-user-id',
      username: req.body.username,
      email: req.body.email,
      preferences: { theme: 'light' }
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.status(200).json({
    message: 'Login successful (mock)',
    token: 'mock-jwt-token',
    user: {
      id: 'mock-user-id',
      username: 'demo-user',
      email: req.body.email,
      preferences: { theme: 'light' }
    }
  });
});

app.get('/api/auth/profile', (req, res) => {
  res.status(200).json({
    user: {
      id: 'mock-user-id',
      username: 'demo-user',
      email: 'demo@example.com',
      preferences: { theme: 'light' },
      readingHistory: [],
      bookmarks: []
    }
  });
});

// Mock news endpoints
app.get('/api/news/bookmarks', (req, res) => {
  res.json({ bookmarks: [] });
});

app.post('/api/news/bookmark', (req, res) => {
  res.json({ 
    message: 'Bookmark toggled (mock)',
    isBookmarked: true 
  });
});

app.post('/api/news/read', (req, res) => {
  res.json({ message: 'Added to reading history (mock)' });
});

app.get('/api/news/history', (req, res) => {
  res.json({ readingHistory: [] });
});

app.post('/api/news/summarize', (req, res) => {
  res.json({ 
    summary: 'This is a mock AI summary for testing purposes. The actual AI feature requires OpenAI API key and database setup.' 
  });
});

app.get('/api/news/recommendations', (req, res) => {
  res.json({ recommendations: [] });
});

app.put('/api/news/preferences', (req, res) => {
  res.json({ 
    message: 'Preferences updated (mock)',
    preferences: req.body.preferences 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT} (without database)`);
  console.log(`📰 News API: http://localhost:${PORT}/api/news/fetch`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚠️  Using mock authentication - no real user data will be saved`);
}); 
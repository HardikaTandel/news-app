import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bookmark, BookmarkCheck, ExternalLink, Clock } from 'lucide-react';
import axios from 'axios';

const NewsCard = ({ news, onBookmarkToggle }) => {
  const [showDescription, setShowDescription] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();

  // Check if article is bookmarked on mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (isAuthenticated && news.articleId) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5000/api/news/bookmarks', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const bookmarks = response.data.bookmarks || [];
          const isBookmarked = bookmarks.some(bookmark => bookmark.articleId === news.articleId);
          setIsBookmarked(isBookmarked);
        } catch (error) {
          console.error('Error checking bookmark status:', error);
        }
      }
    };

    checkBookmarkStatus();
  }, [isAuthenticated, news.articleId]);

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      alert('Please login to bookmark articles');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/news/bookmark', {
        article: {
          articleId: news.articleId,
          title: news.title,
          description: news.description,
          url: news.url,
          image: news.image,
          category: news.category,
          region: news.region
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setIsBookmarked(response.data.isBookmarked);
      if (onBookmarkToggle) {
        onBookmarkToggle(news.articleId, response.data.isBookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleReadMore = async () => {
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/news/read', {
          article: {
            articleId: news.articleId,
            title: news.title,
            url: news.url
          }
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error adding to reading history:', error);
      }
    }
    window.open(news.url, '_blank');
  };



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02, boxShadow: "0px 8px 25px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.3 }}
      className={`news-card ${isDark ? 'dark' : ''}`}
    >
      {/* Header with bookmark and time */}
      <div className="card-header">
        <div className="time-info">
          <Clock size={14} />
          <span>{formatDate(news.publishedAt)}</span>
        </div>
        {isAuthenticated && (
          <motion.button
            onClick={handleBookmark}
            className="bookmark-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </motion.button>
        )}
      </div>

      {/* Title */}
      <h3 className="news-title">{news.title}</h3>

      {/* Image */}
      {news.image && (
        <motion.img
          src={news.image}
          alt="News"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
          className="news-image"
        />
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <motion.button
          onClick={toggleDescription}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.9 }}
          className="action-btn description-btn"
        >
          {showDescription ? "Hide Description" : "Show Description"}
        </motion.button>


      </div>

      {/* Description */}
      {showDescription && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="news-description"
        >
          {news.description}
        </motion.p>
      )}



      {/* Read More Link */}
      <motion.button
        onClick={handleReadMore}
        whileHover={{ scale: 1.05, color: "#0056b3" }}
        transition={{ duration: 0.2 }}
        className="read-more-btn"
      >
        <ExternalLink size={16} />
        Read Full Article
      </motion.button>
    </motion.div>
  );
};

export default NewsCard; 
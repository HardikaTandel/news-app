import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const TrendingEntities = ({ region, category }) => {
  const [trendingEntities, setTrendingEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [showRelated, setShowRelated] = useState(false);

  useEffect(() => {
    fetchTrendingEntities();
  }, [region, category]);

  const fetchTrendingEntities = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`http://localhost:5000/api/news/trending-entities?region=${region}&category=${category}`);
      
      if (response.data.trendingEntities) {
        setTrendingEntities(response.data.trendingEntities);
      }
    } catch (err) {
      console.error('Error fetching trending entities:', err);
      setError('Failed to load trending entities');
    } finally {
      setLoading(false);
    }
  };

  const handleEntityClick = async (entity) => {
    setSelectedEntity(entity);
    setShowRelated(true);
    setLoading(true);
    
    try {
      // Fetch current news articles
      const response = await axios.get(`http://localhost:5000/api/news/fetch?region=${region}&category=${category}`);
      const articles = response.data.articles || [];
      
      // Filter articles that mention this entity
      const related = articles.filter(article => 
        article.title.toLowerCase().includes(entity.text.toLowerCase()) ||
        article.description.toLowerCase().includes(entity.text.toLowerCase())
      );
      
      setRelatedArticles(related.slice(0, 6)); // Show top 6 related articles
    } catch (error) {
      console.error('Error fetching related articles:', error);
      setRelatedArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const closeRelatedArticles = () => {
    setShowRelated(false);
    setSelectedEntity(null);
    setRelatedArticles([]);
  };

  const getEntityIcon = (label) => {
    switch (label.toLowerCase()) {
      case 'person':
        return '👤';
      case 'organization':
        return '🏢';
      case 'location':
        return '📍';
      case 'date':
        return '📅';
      case 'money':
        return '💰';
      case 'percentage':
        return '📊';
      default:
        return '🏷️';
    }
  };

  const getEntityColor = (label) => {
    switch (label.toLowerCase()) {
      case 'person':
        return '#ff6b6b';
      case 'organization':
        return '#4ecdc4';
      case 'location':
        return '#45b7d1';
      case 'date':
        return '#96ceb4';
      case 'money':
        return '#feca57';
      case 'percentage':
        return '#ff9ff3';
      default:
        return '#c8d6e5';
    }
  };

  if (loading && !showRelated) {
    return (
      <div className="trending-entities">
        <div className="trending-header">
          <h3>🔍 Trending Entities</h3>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trending-entities">
        <div className="trending-header">
          <h3>🔍 Trending Entities</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!trendingEntities || trendingEntities.length === 0) {
    return null;
  }

  return (
    <div className="trending-entities">
      <div className="trending-header">
        <h3>🔍 Trending Entities</h3>
        <p>Click on entities to see related articles</p>
      </div>
      
      <div className="entities-grid">
        {trendingEntities.map((entity, index) => (
          <motion.div
            key={`${entity.text}-${index}`}
            className="entity-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              borderColor: getEntityColor(entity.label)
            }}
            onClick={() => handleEntityClick(entity)}
          >
            <div className="entity-icon" style={{ backgroundColor: getEntityColor(entity.label) }}>
              {getEntityIcon(entity.label)}
            </div>
            <div className="entity-content">
              <div className="entity-text">{entity.text}</div>
              <div className="entity-label">{entity.label}</div>
            </div>
            <div className="entity-count-btn">
              {entity.count || 1}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Related Articles Modal */}
      {showRelated && selectedEntity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="related-articles-modal"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                📰 Articles mentioning "{selectedEntity.text}"
              </h3>
              <button onClick={closeRelatedArticles} className="close-btn">×</button>
            </div>
            
            {loading ? (
              <div className="loading">Loading related articles...</div>
            ) : relatedArticles.length > 0 ? (
              <div className="related-articles-grid">
                {relatedArticles.map((article, index) => (
                  <motion.div
                    key={article.articleId || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="related-article-card"
                  >
                    <h4>{article.title}</h4>
                    <p>{article.description}</p>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-link">
                      Read Full Article →
                    </a>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="no-articles">
                <p>No articles found mentioning "{selectedEntity.text}"</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TrendingEntities; 
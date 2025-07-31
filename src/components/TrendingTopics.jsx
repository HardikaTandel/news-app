import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, Hash } from 'lucide-react';

const TrendingTopics = ({ trendingTopics = [] }) => {
  const { isDark } = useTheme();

  if (!trendingTopics || trendingTopics.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`trending-topics ${isDark ? 'dark' : ''}`}
    >
      <div className="trending-header">
        <TrendingUp size={20} />
        <h3>Trending Topics</h3>
      </div>
      
      <div className="topics-grid">
        {trendingTopics.slice(0, 8).map((topic, index) => (
          <motion.div
            key={topic.keyword}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="topic-item"
            whileHover={{ scale: 1.05 }}
          >
            <Hash size={14} />
            <span className="topic-keyword">{topic.keyword}</span>
            <span className="topic-count">{topic.count}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrendingTopics; 
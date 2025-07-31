import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Clock } from 'lucide-react';
import NewsCard from './NewsCard';

const Recommendations = ({ recommendations = [] }) => {
  const { isDark } = useTheme();

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`recommendations ${isDark ? 'dark' : ''}`}
    >
      <div className="recommendations-header">
        <Sparkles size={20} />
        <h3>Recommended for You</h3>
        <p>Based on your reading history</p>
      </div>
      
      <div className="recommendations-grid">
        {recommendations.slice(0, 3).map((news, index) => (
          <motion.div
            key={news.articleId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <NewsCard news={news} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Recommendations; 
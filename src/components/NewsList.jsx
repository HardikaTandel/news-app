import React from "react";
import { useTheme } from "../context/ThemeContext";
import NewsCard from "./NewsCard";

const NewsList = ({ newsData, loading, error }) => {
  const { isDark } = useTheme();

  if (loading) return <div className="loading">Loading news...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className={`news-list ${isDark ? 'dark' : ''}`}>
      {newsData.slice(0, 12).map((news, index) => (
        <NewsCard key={news.articleId || index} news={news} />
      ))}
    </div>
  );
};

export default NewsList;

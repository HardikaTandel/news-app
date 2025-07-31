import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Header from "./components/Header";
import RegionSelector from "./components/RegionSelector";
import GenreSelector from "./components/GenreSelector";
import NewsList from "./components/NewsList";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import AuthCallback from "./components/Auth/AuthCallback";
import Recommendations from "./components/Recommendations";
import TrendingEntities from "./components/TrendingEntities";
import NewsCard from "./components/NewsCard";
import "./App.css";

const AppContent = () => {
  const [newsData, setNewsData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("in");
  const [selectedGenre, setSelectedGenre] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'saved'

  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const fetchNews = async () => {
    setLoading(true);
    setError("");
    try {
      const url = `http://localhost:5000/api/news/fetch?region=${selectedRegion}&category=${selectedGenre}`;
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await axios.get(url, { headers });
      
      if (response.data.articles) {
        let mainArticles = response.data.articles;
        
        // If there are recommendations, filter out recommended articles from main news
        if (response.data.recommendations && response.data.recommendations.length > 0) {
          const recommendedIds = response.data.recommendations.map(rec => rec.articleId);
          mainArticles = response.data.articles.filter(article => 
            !recommendedIds.includes(article.articleId)
          );
          setRecommendations(response.data.recommendations);
        }
        
        setNewsData(mainArticles);
      } else {
        setError("No news found.");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Error fetching news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedArticles = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/news/bookmarks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSavedArticles(response.data.bookmarks || []);
    } catch (error) {
      console.error('Error fetching saved articles:', error);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedRegion, selectedGenre]);

  const toggleViewMode = () => {
    setViewMode(viewMode === 'all' ? 'saved' : 'all');
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedArticles();
    }
  }, [isAuthenticated]);

  // 🎤 Read Only Displayed Headlines
  const speakDisplayedHeadlines = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel(); // Stop speaking
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    // Read only first 12 displayed news headlines
    const displayedHeadlines = newsData.slice(0, 12).map((news) => news.title);
    let index = 0;

    const speakNext = () => {
      if (index < displayedHeadlines.length) {
        const speech = new SpeechSynthesisUtterance(displayedHeadlines[index]);
        speech.lang = "en-US";
        speech.rate = 1;

        speech.onend = () => {
          index++;
          speakNext();
        };

        window.speechSynthesis.speak(speech);
      } else {
        setIsSpeaking(false);
      }
    };

    speakNext();
  };

  return (
    <div className={`app ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <Header />

      {/* Auth Modal */}
      {showAuth && (
        <div className="auth-modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            {authMode === 'login' ? (
              <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Top Controls */}
        <div className="top-controls">
          <div className="left-controls">
            <RegionSelector
              selectedRegion={selectedRegion}
              onRegionChange={(e) => setSelectedRegion(e.target.value)}
            />
            
            <GenreSelector
              selectedGenre={selectedGenre}
              onGenreChange={(e) => setSelectedGenre(e.target.value)}
            />
          </div>

          <div className="right-controls">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="theme-toggle"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isDark ? '☀️' : '🌙'}
            </motion.button>

             {/* Speak Button - Only show when viewing all news */}
             {viewMode === 'all' && (
               <motion.button
                onClick={speakDisplayedHeadlines}
                className={`speak-btn ${isSpeaking ? 'speaking' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSpeaking ? "🛑 Stop" : "🔊 Read"}
              </motion.button>
             )}

            {/* Saved Articles Button */}
            {isAuthenticated && (
              <motion.button
                onClick={toggleViewMode}
                className={`saved-btn ${viewMode === 'saved' ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {viewMode === 'saved' ? ' All News' : ' Saved Articles'}
              </motion.button>
            )}

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="user-section">
                <span className="username">Welcome, {user?.username}!</span>
                <motion.button
                  onClick={logout}
                  className="logout-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => setShowAuth(true)}
                className="login-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            )}

           
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'all' ? (
          <>
            {/* Trending Entities */}
            <TrendingEntities region={selectedRegion} category={selectedGenre} />

            {/* Recommendations */}
            {isAuthenticated && recommendations.length > 0 && (
              <Recommendations recommendations={recommendations} />
            )}

            {/* News List */}
            <NewsList newsData={newsData} loading={loading} error={error} />
          </>
        ) : (
          <>
            {/* Saved Articles View */}
            <div className="saved-articles-view">
              <h2 className="section-title">📚 Your Saved Articles</h2>
              {savedArticles.length > 0 ? (
                <div className="news-grid">
                  {savedArticles.map((article, index) => (
                    <NewsCard 
                      key={article.articleId || index} 
                      news={article} 
                      isSavedView={true}
                      onBookmarkToggle={(articleId, isBookmarked) => {
                        if (!isBookmarked) {
                          setSavedArticles(prev => prev.filter(a => a.articleId !== articleId));
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No saved articles yet. Start bookmarking articles to see them here!</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="*" element={<AppContent />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;

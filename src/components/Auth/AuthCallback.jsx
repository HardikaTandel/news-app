import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/?error=oauth_failed');
      return;
    }

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        
        // Store token and user data
        localStorage.setItem('token', token);
        
        // Update auth context
        loginWithToken(token, userData);
        
        // Redirect to home page
        navigate('/');
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        navigate('/?error=oauth_failed');
      }
    } else {
      navigate('/?error=oauth_failed');
    }
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Completing Login</h2>
        <p style={{ margin: '0', color: '#666' }}>Please wait while we sign you in...</p>
      </motion.div>
    </div>
  );
};

export default AuthCallback; 
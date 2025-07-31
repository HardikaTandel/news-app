import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';

const router = express.Router();

// Function to configure Google OAuth Strategy
const configureGoogleOAuth = () => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('✅ Google OAuth credentials found. Initializing Google OAuth strategy...');
    
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth profile received:', {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value
        });
        
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          console.log('Existing Google user found:', user.username);
          return done(null, user);
        }
        
        // Create new user if doesn't exist
        user = new User({
          googleId: profile.id,
          username: profile.displayName || `user_${profile.id}`,
          email: profile.emails?.[0]?.value || `user_${profile.id}@google.com`,
          password: 'google-oauth-' + Math.random().toString(36).substr(2, 9) // Random password for Google users
        });
        
        await user.save();
        console.log('New Google user created:', user.username);
        return done(null, user);
      } catch (error) {
        console.error('Google OAuth strategy error:', error);
        return done(error, null);
      }
    }));
    
    console.log('✅ Google OAuth strategy initialized successfully');
    return true;
  } else {
    console.log('⚠️  Google OAuth credentials not found. Google login will be disabled.');
    console.log('   To enable Google login, add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to config.env');
    return false;
  }
};

// Configure Google OAuth Strategy - will be initialized later
let googleOAuthEnabled = false;

// Function to initialize Google OAuth (call this after server starts)
export const initializeGoogleOAuth = () => {
  googleOAuthEnabled = configureGoogleOAuth();
  return googleOAuthEnabled;
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Register user
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
        readingHistory: user.readingHistory,
        bookmarks: user.bookmarks
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth Routes (dynamic based on initialization)
router.get('/google', (req, res) => {
  console.log('🔍 Google OAuth route accessed, enabled:', googleOAuthEnabled);
  if (googleOAuthEnabled) {
    console.log('✅ Redirecting to Google OAuth...');
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
  } else {
    console.log('❌ Google OAuth not enabled');
    res.status(400).json({ 
      message: 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to config.env' 
    });
  }
});

router.get('/google/callback', (req, res) => {
  if (googleOAuthEnabled) {
    passport.authenticate('google', { failureRedirect: '/login' })(req, res, () => {
      try {
        console.log('✅ Google OAuth callback successful for user:', req.user.username);
        
        // Create JWT token
        const token = jwt.sign(
          { userId: req.user._id },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        res.redirect(`http://localhost:5173/auth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          preferences: req.user.preferences
        }))}`);
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect('http://localhost:5173/login?error=oauth_failed');
      }
    });
  } else {
    res.redirect('http://localhost:5173/login?error=oauth_not_configured');
  }
});

export default router; 
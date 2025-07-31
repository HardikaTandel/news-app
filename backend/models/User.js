import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password only required if not Google OAuth user
    },
    minlength: 6
  },
  preferences: {
    favoriteCategories: [{
      type: String,
      enum: ['general', 'business', 'sports', 'technology', 'entertainment', 'health']
    }],
    favoriteRegions: [{
      type: String,
      enum: ['in', 'us']
    }],
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  readingHistory: [{
    articleId: String,
    title: String,
    url: String,
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    articleId: String,
    title: String,
    description: String,
    url: String,
    image: String,
    category: String,
    region: String,
    bookmarkedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add to reading history
userSchema.methods.addToReadingHistory = function(article) {
  const existingIndex = this.readingHistory.findIndex(
    item => item.articleId === article.articleId
  );
  
  if (existingIndex > -1) {
    this.readingHistory.splice(existingIndex, 1);
  }
  
  this.readingHistory.unshift({
    articleId: article.articleId,
    title: article.title,
    url: article.url,
    readAt: new Date()
  });
  
  // Keep only last 50 articles in history
  if (this.readingHistory.length > 50) {
    this.readingHistory = this.readingHistory.slice(0, 50);
  }
};

// Method to toggle bookmark
userSchema.methods.toggleBookmark = function(article) {
  const existingIndex = this.bookmarks.findIndex(
    item => item.articleId === article.articleId
  );
  
  if (existingIndex > -1) {
    this.bookmarks.splice(existingIndex, 1);
    return false; // removed
  } else {
    this.bookmarks.unshift({
      articleId: article.articleId,
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.image,
      category: article.category,
      region: article.region,
      bookmarkedAt: new Date()
    });
    return true; // added
  }
};

export default mongoose.model('User', userSchema); 
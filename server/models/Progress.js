const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema({
  completed: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  lastPlayed: {
    type: Date,
    default: Date.now
  },
  accuracy: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0 // in minutes
  }
});

const badgeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['reading', 'writing', 'sight-words', 'comprehension', 'general'],
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
});

const achievementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    required: true
  }
});

const weeklyStatsSchema = new mongoose.Schema({
  week: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  accuracy: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  }
});

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [badgeSchema],
  achievements: [achievementSchema],
  streaks: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  gameProgress: {
    reading: gameProgressSchema,
    writing: gameProgressSchema,
    sightWords: gameProgressSchema,
    comprehension: gameProgressSchema
  },
  weeklyStats: [weeklyStatsSchema],
  totalGamesPlayed: {
    type: Number,
    default: 0
  },
  totalTimeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  averageAccuracy: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate level based on points
progressSchema.methods.calculateLevel = function() {
  const points = this.points;
  const level = Math.floor(points / 100) + 1;
  return Math.max(1, level);
};

// Update level if needed
progressSchema.methods.updateLevel = function() {
  const newLevel = this.calculateLevel();
  if (newLevel > this.level) {
    this.level = newLevel;
    return true; // Level up occurred
  }
  return false; // No level up
};

// Add points and update level
progressSchema.methods.addPoints = function(points, reason = '') {
  this.points += points;
  const leveledUp = this.updateLevel();
  
  // Update last activity for streak tracking
  this.streaks.lastActivity = new Date();
  
  return {
    newPoints: this.points,
    newLevel: this.level,
    leveledUp,
    reason
  };
};

// Update streak
progressSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = new Date(this.streaks.lastActivity);
  const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Consecutive day
    this.streaks.current += 1;
    if (this.streaks.current > this.streaks.longest) {
      this.streaks.longest = this.streaks.current;
    }
  } else if (daysDiff > 1) {
    // Streak broken
    this.streaks.current = 1;
  }
  
  this.streaks.lastActivity = now;
};

// Update game progress
progressSchema.methods.updateGameProgress = function(gameType, data) {
  if (!this.gameProgress[gameType]) {
    this.gameProgress[gameType] = {};
  }
  
  Object.assign(this.gameProgress[gameType], data);
  
  // Update totals
  this.totalGamesPlayed = Object.values(this.gameProgress).reduce((sum, game) => {
    return sum + (game.completed || 0);
  }, 0);
  
  this.totalTimeSpent = Object.values(this.gameProgress).reduce((sum, game) => {
    return sum + (game.timeSpent || 0);
  }, 0);
  
  // Calculate average accuracy
  const gamesWithAccuracy = Object.values(this.gameProgress).filter(game => game.accuracy > 0);
  if (gamesWithAccuracy.length > 0) {
    this.averageAccuracy = gamesWithAccuracy.reduce((sum, game) => sum + game.accuracy, 0) / gamesWithAccuracy.length;
  }
};

// Add weekly stats
progressSchema.methods.addWeeklyStats = function(stats) {
  const existingWeekIndex = this.weeklyStats.findIndex(stat => stat.week === stats.week);
  
  if (existingWeekIndex >= 0) {
    // Update existing week
    Object.assign(this.weeklyStats[existingWeekIndex], stats);
  } else {
    // Add new week
    this.weeklyStats.push(stats);
  }
  
  // Keep only last 12 weeks
  if (this.weeklyStats.length > 12) {
    this.weeklyStats = this.weeklyStats.slice(-12);
  }
};

// Unlock badge
progressSchema.methods.unlockBadge = function(badgeId, badgeData) {
  const existingBadge = this.badges.find(badge => badge.id === badgeId);
  if (!existingBadge) {
    this.badges.push({
      id: badgeId,
      ...badgeData,
      unlockedAt: new Date()
    });
    return true;
  }
  return false;
};

// Unlock achievement
progressSchema.methods.unlockAchievement = function(achievementId, achievementData) {
  const existingAchievement = this.achievements.find(achievement => achievement.id === achievementId);
  if (!existingAchievement) {
    this.achievements.push({
      id: achievementId,
      ...achievementData,
      unlockedAt: new Date()
    });
    return true;
  }
  return false;
};

// Get progress summary
progressSchema.methods.getProgressSummary = function() {
  return {
    points: this.points,
    level: this.level,
    badges: this.badges.length,
    achievements: this.achievements.length,
    currentStreak: this.streaks.current,
    longestStreak: this.streaks.longest,
    totalGamesPlayed: this.totalGamesPlayed,
    totalTimeSpent: this.totalTimeSpent,
    averageAccuracy: this.averageAccuracy
  };
};

// Indexes for better query performance
progressSchema.index({ userId: 1 });
progressSchema.index({ points: -1 });
progressSchema.index({ level: -1 });
progressSchema.index({ 'streaks.lastActivity': -1 });

module.exports = mongoose.model('Progress', progressSchema);
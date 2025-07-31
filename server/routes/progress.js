const express = require('express');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { auth, studentOnly } = require('../middleware/auth');

const router = express.Router();

// Get user progress
router.get('/', auth, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user.userId });
    
    if (!progress) {
      // Create new progress if none exists
      progress = new Progress({
        userId: req.user.userId
      });
      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      message: 'Failed to get progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new progress
router.post('/', auth, async (req, res) => {
  try {
    const existingProgress = await Progress.findOne({ userId: req.user.userId });
    
    if (existingProgress) {
      return res.status(400).json({
        message: 'Progress already exists for this user'
      });
    }

    const progress = new Progress({
      userId: req.user.userId,
      ...req.body
    });

    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    console.error('Create progress error:', error);
    res.status(500).json({
      message: 'Failed to create progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add points
router.post('/points', auth, async (req, res) => {
  try {
    const { points, reason } = req.body;
    
    if (!points || points <= 0) {
      return res.status(400).json({
        message: 'Points must be a positive number'
      });
    }

    let progress = await Progress.findOne({ userId: req.user.userId });
    
    if (!progress) {
      progress = new Progress({
        userId: req.user.userId
      });
    }

    const result = progress.addPoints(points, reason);
    progress.updateStreak();
    
    await progress.save();

    res.json({
      message: 'Points added successfully',
      points: result.newPoints,
      level: result.level,
      leveledUp: result.leveledUp,
      reason: result.reason
    });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({
      message: 'Failed to add points',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Unlock badge
router.post('/badges', auth, async (req, res) => {
  try {
    const { badgeId } = req.body;
    
    if (!badgeId) {
      return res.status(400).json({
        message: 'Badge ID is required'
      });
    }

    let progress = await Progress.findOne({ userId: req.user.userId });
    
    if (!progress) {
      progress = new Progress({
        userId: req.user.userId
      });
    }

    // Define available badges
    const availableBadges = {
      'first-game': {
        name: 'First Steps',
        description: 'Completed your first game',
        icon: '🎮',
        category: 'general',
        rarity: 'common'
      },
      'reading-master': {
        name: 'Reading Master',
        description: 'Completed 10 reading games',
        icon: '📚',
        category: 'reading',
        rarity: 'rare'
      },
      'writing-expert': {
        name: 'Writing Expert',
        description: 'Practiced all letters',
        icon: '✏️',
        category: 'writing',
        rarity: 'epic'
      },
      'sight-word-champion': {
        name: 'Sight Word Champion',
        description: 'Mastered 50 sight words',
        icon: '👁️',
        category: 'sight-words',
        rarity: 'legendary'
      },
      'comprehension-genius': {
        name: 'Comprehension Genius',
        description: 'Perfect score on comprehension',
        icon: '🧠',
        category: 'comprehension',
        rarity: 'epic'
      },
      'streak-master': {
        name: 'Streak Master',
        description: '7-day learning streak',
        icon: '🔥',
        category: 'general',
        rarity: 'rare'
      },
      'level-up': {
        name: 'Level Up!',
        description: 'Reached level 5',
        icon: '⭐',
        category: 'general',
        rarity: 'common'
      }
    };

    const badgeData = availableBadges[badgeId];
    if (!badgeData) {
      return res.status(400).json({
        message: 'Invalid badge ID'
      });
    }

    const unlocked = progress.unlockBadge(badgeId, badgeData);
    
    if (unlocked) {
      await progress.save();
      res.json({
        message: 'Badge unlocked successfully',
        badge: {
          id: badgeId,
          ...badgeData,
          unlockedAt: new Date()
        }
      });
    } else {
      res.json({
        message: 'Badge already unlocked',
        badge: progress.badges.find(b => b.id === badgeId)
      });
    }
  } catch (error) {
    console.error('Unlock badge error:', error);
    res.status(500).json({
      message: 'Failed to unlock badge',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Unlock achievement
router.post('/achievements', auth, async (req, res) => {
  try {
    const { achievementId } = req.body;
    
    if (!achievementId) {
      return res.status(400).json({
        message: 'Achievement ID is required'
      });
    }

    let progress = await Progress.findOne({ userId: req.user.userId });
    
    if (!progress) {
      progress = new Progress({
        userId: req.user.userId
      });
    }

    // Define available achievements
    const availableAchievements = {
      'welcome': {
        name: 'Welcome to Dax',
        description: 'Started your learning journey',
        points: 50,
        category: 'general'
      },
      'first-reading': {
        name: 'First Reader',
        description: 'Completed your first reading game',
        points: 25,
        category: 'reading'
      },
      'first-writing': {
        name: 'First Writer',
        description: 'Practiced your first letter',
        points: 25,
        category: 'writing'
      },
      'sight-word-starter': {
        name: 'Sight Word Starter',
        description: 'Learned your first sight word',
        points: 25,
        category: 'sight-words'
      },
      'comprehension-beginner': {
        name: 'Comprehension Beginner',
        description: 'Completed your first comprehension exercise',
        points: 25,
        category: 'comprehension'
      },
      'streak-3': {
        name: '3-Day Streak',
        description: 'Maintained a 3-day learning streak',
        points: 50,
        category: 'general'
      },
      'streak-7': {
        name: 'Week Warrior',
        description: 'Maintained a 7-day learning streak',
        points: 100,
        category: 'general'
      },
      'level-5': {
        name: 'Level 5 Achiever',
        description: 'Reached level 5',
        points: 75,
        category: 'general'
      },
      'perfect-score': {
        name: 'Perfect Score',
        description: 'Achieved 100% accuracy in a game',
        points: 100,
        category: 'general'
      }
    };

    const achievementData = availableAchievements[achievementId];
    if (!achievementData) {
      return res.status(400).json({
        message: 'Invalid achievement ID'
      });
    }

    const unlocked = progress.unlockAchievement(achievementId, achievementData);
    
    if (unlocked) {
      // Add points for achievement
      progress.addPoints(achievementData.points, `Achievement: ${achievementData.name}`);
      await progress.save();
      
      res.json({
        message: 'Achievement unlocked successfully',
        achievement: {
          id: achievementId,
          ...achievementData,
          unlockedAt: new Date()
        },
        pointsEarned: achievementData.points
      });
    } else {
      res.json({
        message: 'Achievement already unlocked',
        achievement: progress.achievements.find(a => a.id === achievementId)
      });
    }
  } catch (error) {
    console.error('Unlock achievement error:', error);
    res.status(500).json({
      message: 'Failed to unlock achievement',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update game progress
router.put('/game', auth, async (req, res) => {
  try {
    const { gameType, data } = req.body;
    
    if (!gameType || !data) {
      return res.status(400).json({
        message: 'Game type and data are required'
      });
    }

    const validGameTypes = ['reading', 'writing', 'sightWords', 'comprehension'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({
        message: 'Invalid game type'
      });
    }

    let progress = await Progress.findOne({ userId: req.user.userId });
    
    if (!progress) {
      progress = new Progress({
        userId: req.user.userId
      });
    }

    progress.updateGameProgress(gameType, data);
    progress.updateStreak();
    
    await progress.save();

    res.json({
      message: 'Game progress updated successfully',
      progress: progress.gameProgress[gameType]
    });
  } catch (error) {
    console.error('Update game progress error:', error);
    res.status(500).json({
      message: 'Failed to update game progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get progress summary
router.get('/summary', auth, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user.userId });
    
    if (!progress) {
      progress = new Progress({
        userId: req.user.userId
      });
      await progress.save();
    }

    const summary = progress.getProgressSummary();
    res.json(summary);
  } catch (error) {
    console.error('Get progress summary error:', error);
    res.status(500).json({
      message: 'Failed to get progress summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get leaderboard (top players)
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboard = await Progress.find()
      .populate('userId', 'username avatar role')
      .sort({ points: -1 })
      .limit(parseInt(limit))
      .select('points level badges achievements userId');

    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: entry.userId,
      points: entry.points,
      level: entry.level,
      badges: entry.badges.length,
      achievements: entry.achievements.length
    }));

    res.json(formattedLeaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      message: 'Failed to get leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get child progress (for parent accounts)
router.get('/child/:childId', auth, async (req, res) => {
  try {
    const { childId } = req.params;
    
    // Verify parent-child relationship
    const child = await User.findById(childId);
    if (!child || child.parentId?.toString() !== req.user.userId) {
      return res.status(403).json({
        message: 'Access denied. You can only view your child\'s progress.'
      });
    }

    const progress = await Progress.findOne({ userId: childId });
    
    if (!progress) {
      return res.status(404).json({
        message: 'Child progress not found'
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Get child progress error:', error);
    res.status(500).json({
      message: 'Failed to get child progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
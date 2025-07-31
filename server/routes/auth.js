const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, grade, parentId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role,
      grade,
      parentId
    });

    await user.save();

    // Create progress record for student users
    if (role === 'student') {
      const progress = new Progress({
        userId: user._id
      });
      await progress.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'dax-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'dax-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Validate token
router.get('/validate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'Invalid token'
      });
    }

    res.json(user.getPublicProfile());

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      message: 'Token validation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json(user.getPublicProfile());

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, avatar, preferences } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check if username or email is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          message: 'Username already taken'
        });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: 'Email already registered'
        });
      }
      user.email = email;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get children (for parent accounts)
router.get('/children', auth, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({
        message: 'Access denied. Parent account required.'
      });
    }

    const children = await User.find({ parentId: req.user.userId });
    const childrenProfiles = children.map(child => child.getPublicProfile());

    res.json(childrenProfiles);

  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({
      message: 'Failed to get children',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add child to parent account
router.post('/children', auth, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({
        message: 'Access denied. Parent account required.'
      });
    }

    const { childId } = req.body;
    const child = await User.findById(childId);

    if (!child) {
      return res.status(404).json({
        message: 'Child user not found'
      });
    }

    if (child.parentId && child.parentId.toString() !== req.user.userId) {
      return res.status(400).json({
        message: 'Child is already associated with another parent'
      });
    }

    child.parentId = req.user.userId;
    await child.save();

    // Update parent's children array
    const parent = await User.findById(req.user.userId);
    if (!parent.children.includes(childId)) {
      parent.children.push(childId);
      await parent.save();
    }

    res.json({
      message: 'Child added successfully',
      child: child.getPublicProfile()
    });

  } catch (error) {
    console.error('Add child error:', error);
    res.status(500).json({
      message: 'Failed to add child',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Demo account login
router.post('/demo', async (req, res) => {
  try {
    // Create or find demo user
    let demoUser = await User.findOne({ email: 'demo@dax.com' });
    
    if (!demoUser) {
      demoUser = new User({
        username: 'DemoStudent',
        email: 'demo@dax.com',
        password: 'demo123',
        role: 'student',
        grade: 2
      });
      await demoUser.save();

      // Create demo progress
      const progress = new Progress({
        userId: demoUser._id,
        points: 150,
        level: 2,
        badges: [
          {
            id: 'first-game',
            name: 'First Steps',
            description: 'Completed your first game',
            icon: '🎮',
            category: 'general',
            rarity: 'common'
          }
        ],
        achievements: [
          {
            id: 'welcome',
            name: 'Welcome to Dax',
            description: 'Started your learning journey',
            points: 50,
            category: 'general'
          }
        ],
        streaks: {
          current: 3,
          longest: 3,
          lastActivity: new Date()
        }
      });
      await progress.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: demoUser._id, role: demoUser.role },
      process.env.JWT_SECRET || 'dax-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Demo login successful',
      token,
      user: demoUser.getPublicProfile()
    });

  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({
      message: 'Demo login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
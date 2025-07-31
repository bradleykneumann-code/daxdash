const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // In a real implementation, you would fetch from database
    const chatHistory = [
      {
        id: '1',
        message: 'I want to practice reading',
        response: 'Great choice! Reading is super fun! 📚 Let\'s start with a fill-in-the-blank story.',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        type: 'text'
      },
      {
        id: '2',
        message: 'Help me with writing',
        response: 'Awesome! Let\'s practice writing letters! ✏️ Start with the letter \'A\'.',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        type: 'text'
      },
      {
        id: '3',
        message: 'How am I doing?',
        response: 'You\'re doing amazing! 🌟 You\'re at level 2 with 150 points!',
        timestamp: new Date(Date.now() - 10800000), // 3 hours ago
        type: 'text'
      }
    ];

    const paginatedHistory = chatHistory.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      history: paginatedHistory,
      total: chatHistory.length,
      hasMore: parseInt(offset) + parseInt(limit) < chatHistory.length
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      message: 'Failed to get chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Save chat message
router.post('/message', auth, async (req, res) => {
  try {
    const { message, response, type = 'text' } = req.body;
    
    if (!message || !response) {
      return res.status(400).json({
        message: 'Message and response are required'
      });
    }

    // In a real implementation, you would save to database
    const chatMessage = {
      id: Date.now().toString(),
      userId: req.user.userId,
      message,
      response,
      type,
      timestamp: new Date()
    };

    res.status(201).json({
      message: 'Chat message saved successfully',
      chatMessage
    });
  } catch (error) {
    console.error('Save chat message error:', error);
    res.status(500).json({
      message: 'Failed to save chat message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get chat analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // In a real implementation, you would calculate from database
    const analytics = {
      totalMessages: 45,
      averageResponseTime: 2.3, // seconds
      mostCommonTopics: [
        { topic: 'reading', count: 15 },
        { topic: 'writing', count: 12 },
        { topic: 'progress', count: 8 },
        { topic: 'help', count: 6 }
      ],
      userSatisfaction: 4.8, // out of 5
      activeDays: 5,
      longestStreak: 7
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      message: 'Failed to get analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get DaxBot settings
router.get('/settings', auth, async (req, res) => {
  try {
    const settings = {
      voiceEnabled: true,
      autoSpeak: true,
      responseSpeed: 'normal', // slow, normal, fast
      difficulty: 'adaptive', // easy, medium, hard, adaptive
      language: 'en',
      theme: 'friendly' // friendly, professional, playful
    };

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      message: 'Failed to get settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update DaxBot settings
router.put('/settings', auth, async (req, res) => {
  try {
    const { voiceEnabled, autoSpeak, responseSpeed, difficulty, language, theme } = req.body;
    
    // In a real implementation, you would save to database
    const settings = {
      voiceEnabled: voiceEnabled !== undefined ? voiceEnabled : true,
      autoSpeak: autoSpeak !== undefined ? autoSpeak : true,
      responseSpeed: responseSpeed || 'normal',
      difficulty: difficulty || 'adaptive',
      language: language || 'en',
      theme: theme || 'friendly'
    };

    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      message: 'Failed to update settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get DaxBot personality
router.get('/personality', auth, async (req, res) => {
  try {
    const personality = {
      name: 'DaxBot',
      description: 'Your friendly AI learning assistant',
      traits: [
        'Encouraging',
        'Patient',
        'Fun-loving',
        'Educational',
        'Supportive'
      ],
      catchphrases: [
        'Hey champ!',
        'You\'re doing great!',
        'Let\'s learn together!',
        'Practice makes perfect!',
        'You\'ve got this!'
      ],
      voice: {
        rate: 0.8,
        pitch: 1.2,
        volume: 0.8
      }
    };

    res.json(personality);
  } catch (error) {
    console.error('Get personality error:', error);
    res.status(500).json({
      message: 'Failed to get personality',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get learning recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    // In a real implementation, you would analyze user progress
    const recommendations = [
      {
        type: 'game',
        title: 'Practice Sight Words',
        description: 'You haven\'t practiced sight words in a while. Let\'s review some common words!',
        priority: 'high',
        estimatedTime: 10 // minutes
      },
      {
        type: 'activity',
        title: 'Reading Comprehension',
        description: 'Try a new reading passage to improve your understanding skills.',
        priority: 'medium',
        estimatedTime: 15
      },
      {
        type: 'practice',
        title: 'Letter Formation',
        description: 'Practice writing the letter \'B\' to improve your handwriting.',
        priority: 'low',
        estimatedTime: 5
      }
    ];

    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      message: 'Failed to get recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Send feedback about DaxBot
router.post('/feedback', auth, async (req, res) => {
  try {
    const { rating, message, category } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5'
      });
    }

    // In a real implementation, you would save to database
    const feedback = {
      id: Date.now().toString(),
      userId: req.user.userId,
      rating,
      message: message || '',
      category: category || 'general',
      timestamp: new Date()
    };

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      message: 'Failed to submit feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get DaxBot status
router.get('/status', auth, async (req, res) => {
  try {
    const status = {
      online: true,
      responseTime: 1.2, // seconds
      lastMaintenance: new Date(Date.now() - 86400000), // 24 hours ago
      version: '1.0.0',
      features: [
        'Voice chat',
        'Text chat',
        'Game hints',
        'Progress tracking',
        'Personalized responses'
      ]
    };

    res.json(status);
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      message: 'Failed to get status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
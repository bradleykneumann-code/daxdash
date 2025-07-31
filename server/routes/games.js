const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Sample game data
const gameData = {
  reading: {
    stories: [
      {
        id: 'story-1',
        title: 'The Cat and the Hat',
        content: 'The cat sat on the ___ and looked at the rat.',
        blanks: [
          { id: 'blank-1', word: 'hat', position: 4, hints: ['It rhymes with cat', 'You wear it on your head'] }
        ],
        difficulty: 'easy',
        category: 'animals'
      },
      {
        id: 'story-2',
        title: 'My Pet Dog',
        content: 'I have a pet ___ that likes to play in the park.',
        blanks: [
          { id: 'blank-1', word: 'dog', position: 4, hints: ['A furry animal', 'Man\'s best friend'] }
        ],
        difficulty: 'easy',
        category: 'pets'
      }
    ],
    vocabulary: [
      { word: 'cat', definition: 'A furry animal that says meow', example: 'The cat is sleeping.', difficulty: 1 },
      { word: 'hat', definition: 'Something you wear on your head', example: 'I wear a hat in winter.', difficulty: 1 },
      { word: 'rat', definition: 'A small animal with a long tail', example: 'The rat ran fast.', difficulty: 1 }
    ]
  },
  writing: {
    letters: [
      {
        id: 'letter-a',
        letter: 'A',
        formation: ['Start at top', 'Go down', 'Go across'],
        difficulty: 1,
        category: 'uppercase'
      },
      {
        id: 'letter-b',
        letter: 'B',
        formation: ['Start at top', 'Go down', 'Go across top', 'Go across middle'],
        difficulty: 2,
        category: 'uppercase'
      }
    ]
  },
  sightWords: {
    words: [
      { id: 'word-the', word: 'the', difficulty: 1, category: 'common', example: 'The cat is here.', mastered: false },
      { id: 'word-and', word: 'and', difficulty: 1, category: 'common', example: 'Cat and dog.', mastered: false },
      { id: 'word-is', word: 'is', difficulty: 1, category: 'common', example: 'The cat is big.', mastered: false }
    ]
  },
  comprehension: {
    passages: [
      {
        id: 'passage-1',
        title: 'The Little Red Hen',
        content: 'The little red hen found some wheat. She asked her friends to help plant it. "Not I," said the cat. "Not I," said the dog. So the little red hen planted the wheat herself.',
        questions: [
          {
            id: 'q1',
            question: 'What did the little red hen find?',
            options: ['A cat', 'Some wheat', 'A dog', 'A friend'],
            correctAnswer: 1,
            explanation: 'The story says "The little red hen found some wheat."',
            type: 'multiple-choice'
          },
          {
            id: 'q2',
            question: 'Who helped the little red hen plant the wheat?',
            options: ['The cat', 'The dog', 'Her friends', 'No one'],
            correctAnswer: 3,
            explanation: 'The cat and dog said "Not I," so no one helped her.',
            type: 'multiple-choice'
          }
        ],
        difficulty: 'easy',
        category: 'fables'
      }
    ]
  }
};

// Get game data
router.get('/:gameType/data', auth, async (req, res) => {
  try {
    const { gameType } = req.params;
    
    if (!gameData[gameType]) {
      return res.status(404).json({
        message: 'Game type not found'
      });
    }

    res.json(gameData[gameType]);
  } catch (error) {
    console.error('Get game data error:', error);
    res.status(500).json({
      message: 'Failed to get game data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Save game result
router.post('/:gameType/result', auth, async (req, res) => {
  try {
    const { gameType } = req.params;
    const { score, accuracy, timeSpent, mistakes, hintsUsed } = req.body;
    
    // Calculate points based on performance
    let points = Math.floor(score * 10); // Base points
    let achievements = [];
    
    // Bonus points for accuracy
    if (accuracy >= 90) {
      points += 50;
      achievements.push('perfect-score');
    } else if (accuracy >= 80) {
      points += 25;
    }
    
    // Bonus points for speed (if applicable)
    if (timeSpent && timeSpent < 300) { // Less than 5 minutes
      points += 20;
    }
    
    // Penalty for hints
    if (hintsUsed > 0) {
      points = Math.max(0, points - (hintsUsed * 5));
    }
    
    // Penalty for mistakes
    if (mistakes > 0) {
      points = Math.max(0, points - (mistakes * 2));
    }
    
    // Ensure minimum points
    points = Math.max(10, points);
    
    // Check for achievements
    if (score === 100) {
      achievements.push('perfect-score');
    }
    
    if (mistakes === 0) {
      achievements.push('no-mistakes');
    }
    
    if (hintsUsed === 0) {
      achievements.push('no-hints');
    }
    
    res.json({
      message: 'Game result saved successfully',
      points,
      achievements,
      performance: {
        score,
        accuracy,
        timeSpent,
        mistakes,
        hintsUsed
      }
    });
    
  } catch (error) {
    console.error('Save game result error:', error);
    res.status(500).json({
      message: 'Failed to save game result',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get game statistics
router.get('/:gameType/stats', auth, async (req, res) => {
  try {
    const { gameType } = req.params;
    
    // In a real implementation, you would fetch stats from the database
    const stats = {
      totalGames: 15,
      averageScore: 85,
      bestScore: 100,
      totalTime: 1200, // in minutes
      accuracy: 88,
      lastPlayed: new Date()
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({
      message: 'Failed to get game statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get game leaderboard
router.get('/:gameType/leaderboard', async (req, res) => {
  try {
    const { gameType } = req.params;
    const { limit = 10 } = req.query;
    
    // In a real implementation, you would fetch from database
    const leaderboard = [
      { rank: 1, username: 'Emma', score: 100, time: 120 },
      { rank: 2, username: 'Liam', score: 95, time: 150 },
      { rank: 3, username: 'Sophia', score: 90, time: 180 }
    ];
    
    res.json(leaderboard.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      message: 'Failed to get leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get game hints
router.get('/:gameType/hints', auth, async (req, res) => {
  try {
    const { gameType } = req.params;
    const { level = 1 } = req.query;
    
    const hints = {
      reading: [
        "Look at the picture for clues!",
        "Read the sentence again slowly",
        "Think about what makes sense",
        "Sound out the word letter by letter"
      ],
      writing: [
        "Start at the top and go down",
        "Make sure your letters sit on the line",
        "Take your time, don't rush",
        "Practice makes perfect!"
      ],
      'sight-words': [
        "Look at the whole word, not just letters",
        "Say the word out loud",
        "Think about words you already know",
        "Don't sound it out, just know it!"
      ],
      comprehension: [
        "Read the story carefully first",
        "Look for key details in the text",
        "Think about what the story is about",
        "Go back and check the story if you're not sure"
      ]
    };
    
    const gameHints = hints[gameType] || hints.reading;
    const hint = gameHints[Math.floor(Math.random() * gameHints.length)];
    
    res.json({ hint });
  } catch (error) {
    console.error('Get hints error:', error);
    res.status(500).json({
      message: 'Failed to get hints',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
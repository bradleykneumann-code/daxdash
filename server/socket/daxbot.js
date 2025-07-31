const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Progress = require('../models/Progress');

const handleSocketConnection = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dax-secret-key');
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected to DaxBot`);

    // Handle chat messages
    socket.on('chat_message', async (data) => {
      try {
        const { message, type = 'text' } = data;
        
        // Get user progress for context
        const progress = await Progress.findOne({ userId: socket.userId });
        const user = await User.findById(socket.userId);
        
        // Generate DaxBot response
        const response = await generateDaxBotResponse(message, progress, user);
        
        // Send response back to client
        socket.emit('daxbot_response', {
          message: response.message,
          type: response.type,
          context: response.context
        });

        // Log chat for analytics
        console.log(`DaxBot chat: User ${socket.userId} - "${message}" -> "${response.message}"`);

      } catch (error) {
        console.error('Chat message error:', error);
        socket.emit('daxbot_response', {
          message: "I'm having trouble understanding right now. Can you try asking again?",
          type: 'text'
        });
      }
    });

    // Handle voice messages
    socket.on('voice_message', async (data) => {
      try {
        const { audio } = data;
        
        // In a real implementation, you would process the audio here
        // For now, we'll simulate voice processing
        const transcribedMessage = "I want to practice reading"; // Simulated transcription
        
        // Generate response
        const response = await generateDaxBotResponse(transcribedMessage, null, null);
        
        socket.emit('daxbot_response', {
          message: response.message,
          type: 'voice',
          context: response.context
        });

      } catch (error) {
        console.error('Voice message error:', error);
        socket.emit('daxbot_response', {
          message: "I couldn't hear you clearly. Can you try speaking again?",
          type: 'voice'
        });
      }
    });

    // Handle game hints
    socket.on('request_hint', async (data) => {
      try {
        const { gameType, currentLevel } = data;
        const hint = generateGameHint(gameType, currentLevel);
        
        socket.emit('game_hint', hint);
      } catch (error) {
        console.error('Hint request error:', error);
      }
    });

    // Handle encouragement
    socket.on('request_encouragement', async () => {
      try {
        const encouragement = generateEncouragement();
        socket.emit('encouragement', encouragement);
      } catch (error) {
        console.error('Encouragement request error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from DaxBot`);
    });
  });
};

// Generate DaxBot response based on user message and context
const generateDaxBotResponse = async (message, progress, user) => {
  const lowerMessage = message.toLowerCase();
  
  // Reading-related queries
  if (lowerMessage.includes('reading') || lowerMessage.includes('read') || lowerMessage.includes('story')) {
    return {
      message: "Great choice! Reading is super fun! 📚 Let's start with a fill-in-the-blank story. I'll give you a sentence with a missing word, and you have to figure out what goes there. Ready to begin?",
      type: 'text',
      context: { currentGame: 'reading', difficulty: 'easy' }
    };
  }

  // Writing-related queries
  if (lowerMessage.includes('writing') || lowerMessage.includes('write') || lowerMessage.includes('letter')) {
    return {
      message: "Awesome! Let's practice writing letters! ✏️ I'll show you how to form each letter step by step. Start with the letter 'A' - remember: start at the top, go down, then across!",
      type: 'text',
      context: { currentGame: 'writing', currentLesson: 'letter A' }
    };
  }

  // Sight words queries
  if (lowerMessage.includes('sight') || lowerMessage.includes('word') || lowerMessage.includes('flashcard')) {
    return {
      message: "Perfect! Sight words are words you need to know by heart! 👁️ Let's practice with flashcards. I'll show you a word, and you tell me what it says. Ready?",
      type: 'text',
      context: { currentGame: 'sight-words', gameMode: 'flashcards' }
    };
  }

  // Comprehension queries
  if (lowerMessage.includes('comprehension') || lowerMessage.includes('understand') || lowerMessage.includes('question')) {
    return {
      message: "Excellent! Comprehension means understanding what you read! 🧠 I'll give you a short story and ask you questions about it. This helps you think about what you're reading!",
      type: 'text',
      context: { currentGame: 'comprehension', difficulty: 'easy' }
    };
  }

  // Help requests
  if (lowerMessage.includes('help') || lowerMessage.includes('stuck') || lowerMessage.includes('difficult')) {
    return {
      message: "Don't worry! I'm here to help! 💡 Take a deep breath and try again. Remember, making mistakes is how we learn. What specific part are you having trouble with?",
      type: 'encouragement'
    };
  }

  // Progress queries
  if (lowerMessage.includes('progress') || lowerMessage.includes('how am i doing') || lowerMessage.includes('level')) {
    if (progress) {
      const levelQuips = [
        "You're doing amazing! 🌟",
        "Keep up the great work! 🚀",
        "You're learning so much! 📚",
        "I'm so proud of you! 👏"
      ];
      const quip = levelQuips[Math.floor(Math.random() * levelQuips.length)];
      
      return {
        message: `${quip} You're at level ${progress.level} with ${progress.points} points! You've earned ${progress.badges.length} badges and ${progress.achievements.length} achievements. Keep going!`,
        type: 'text'
      };
    } else {
      return {
        message: "You're just getting started! Let's play some games to see your progress grow! 🎮",
        type: 'text'
      };
    }
  }

  // Greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      message: "Hey champ! 👋 I'm DaxBot, your learning buddy! I'm here to help you with reading, writing, sight words, and comprehension. What would you like to practice today?",
      type: 'text'
    };
  }

  // Default response
  return {
    message: "That's interesting! 🤔 I'm here to help you learn reading, writing, sight words, and comprehension. What would you like to practice? You can say things like 'I want to practice reading' or 'Help me with writing'!",
    type: 'text'
  };
};

// Generate game-specific hints
const generateGameHint = (gameType, currentLevel) => {
  const hints = {
    reading: [
      "Look at the picture for clues! 🖼️",
      "Read the sentence again slowly 📖",
      "Think about what makes sense in the story 🧠",
      "Sound out the word letter by letter 🔤"
    ],
    writing: [
      "Start at the top and go down ✏️",
      "Make sure your letters sit on the line 📝",
      "Take your time, don't rush ⏰",
      "Practice makes perfect! 💪"
    ],
    'sight-words': [
      "Look at the whole word, not just letters 👁️",
      "Say the word out loud 🔊",
      "Think about words you already know 🧠",
      "Don't sound it out, just know it! 💡"
    ],
    comprehension: [
      "Read the story carefully first 📚",
      "Look for key details in the text 🔍",
      "Think about what the story is about 🧠",
      "Go back and check the story if you're not sure 📖"
    ]
  };

  const gameHints = hints[gameType] || hints.reading;
  return gameHints[Math.floor(Math.random() * gameHints.length)];
};

// Generate encouragement messages
const generateEncouragement = () => {
  const encouragements = [
    "You're doing fantastic! Keep going! 🌟",
    "Every mistake is a chance to learn! 💪",
    "You're getting better every day! 📈",
    "I believe in you! You can do this! 🚀",
    "Take a break if you need to, then try again! ☕",
    "You're so smart! Keep thinking! 🧠",
    "Learning is fun with you! 🎉",
    "You're making great progress! 📚",
    "Don't give up, you're almost there! 🎯",
    "You're a learning superstar! ⭐"
  ];

  return encouragements[Math.floor(Math.random() * encouragements.length)];
};

module.exports = {
  handleSocketConnection
};
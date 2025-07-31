# 🎯 Dax: Where Learning Sticks Like Glue – Not ADHD

![Dax Logo](https://img.shields.io/badge/Dax-Learning%20App-blue?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)

A fully functional, gamified web application for Grade 2 learning designed specifically for children with ADHD. Dax makes learning engaging, accessible, and fun through interactive games, AI assistance, and progress tracking.

## ✨ Features

### 🎮 **Core Learning Games**
- **📚 Reading Games**: Fill-in-the-blank stories with instant feedback
- **✏️ Writing Practice**: Interactive letter-drawing canvas with stroke analysis  
- **👀 Sight Words**: Flashcards, beat-the-clock rounds, and matching games
- **🧠 Comprehension**: Illustrated multiple-choice and drag-and-drop puzzles

### 🤖 **DaxBot AI Assistant**
- Interactive chat interface with voice support
- Personalized learning recommendations
- Real-time help and encouragement
- Speech recognition for accessibility

### 📊 **Progress Tracking**
- Points, badges, and level progression
- Streak tracking and achievements
- Visual progress charts and analytics
- Parent/teacher dashboard access

### 🎨 **ADHD-Optimized Design**
- Carefully chosen color palettes and gradients
- Focus-friendly animations and transitions
- Clean, distraction-free interface
- Accessibility features built-in

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Docker & Docker Compose (recommended)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd dax-learning-app

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

### Option 2: Manual Setup

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (make sure it's running)
mongod

# Start the application
npm run dev
```

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Real-time**: Socket.io
- **Authentication**: JWT with bcrypt
- **Deployment**: Docker + Nginx

### **Project Structure**
```
dax-learning-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Application pages
│   │   └── ...
│   ├── Dockerfile
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── socket/            # Socket.io handlers
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Token validation
- `POST /api/auth/logout` - User logout

### Games
- `GET /api/games/reading` - Reading game content
- `GET /api/games/writing` - Writing exercises
- `GET /api/games/sight-words` - Sight word lists
- `GET /api/games/comprehension` - Comprehension questions

### Progress
- `GET /api/progress` - User progress data
- `POST /api/progress/update` - Update user progress
- `GET /api/progress/leaderboard` - Leaderboard data

### DaxBot
- `GET /api/daxbot/history` - Chat history
- `POST /api/daxbot/message` - Send/save message

## 🎮 Demo Flow

1. **Visit Homepage**: Beautiful Dax branding and feature overview
2. **Register**: Create account (try "Emma", age 7)
3. **Login**: Access personalized dashboard
4. **Play Games**: Choose from 6 different game types
5. **Chat with DaxBot**: Use the floating chat button
6. **Track Progress**: Earn points, badges, and level up

## 🛠️ Development

### Scripts
```bash
# Development
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only

# Production
npm run build        # Build frontend for production
npm start           # Start production server

# Testing
npm test            # Run tests
npm run test:e2e    # Run end-to-end tests
npm run lint        # Lint code
```

### Environment Variables
See `.env.example` for all available configuration options.

Key variables:
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: JWT signing secret (64+ characters)
- `OPENAI_API_KEY`: For DaxBot AI features
- `CLIENT_URL`: Frontend URL for CORS

## 🔧 Configuration

### ADHD-Optimized Settings
The application includes special considerations for ADHD learners:

- **Color Psychology**: Calming blues and energizing greens
- **Animation Timing**: 2-3 second intervals to maintain attention
- **Font Choices**: Kid-friendly fonts (Comic Sans MS, Fredoka One)
- **Focus Management**: Clear visual hierarchy and minimal distractions

### Accessibility Features
- Keyboard navigation support
- Screen reader compatibility
- Voice recognition and text-to-speech
- High contrast mode available

## 🚀 Deployment

### Production Checklist
- [ ] Update JWT_SECRET to a secure 64+ character string
- [ ] Configure MongoDB connection string
- [ ] Set up SSL certificates
- [ ] Configure email service for notifications
- [ ] Set up monitoring and logging
- [ ] Enable rate limiting and security headers

### Nginx Configuration
The included nginx configuration provides:
- Reverse proxy to backend API
- Static file serving for frontend
- SSL termination
- Security headers
- Gzip compression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Designed with input from ADHD specialists and educators
- Built with accessibility and inclusion at the forefront
- Inspired by the belief that every child can learn when given the right tools

---

**Dax**: Where learning sticks like glue – not ADHD! 🎯✨

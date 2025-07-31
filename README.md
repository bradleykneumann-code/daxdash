# 🎯 Dax: Where Learning Sticks Like Glue – Not ADHD

A fully functional, gamified web application designed specifically for Grade 2 students with ADHD. Built with modern web technologies and optimized for engagement, accessibility, and learning retention.

## 🚀 Live Demo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Demo Account**: Try registering as "Emma" (age 7) to experience the full student journey

## ✨ Features

### 🎮 Core Learning Games
- **Reading Games**: Fill-in-the-blank stories with instant feedback
- **Writing Practice**: Interactive letter-drawing canvas with stroke analysis
- **Sight Words**: Flashcards, beat-the-clock rounds, and matching games
- **Comprehension**: Illustrated multiple-choice and drag-and-drop puzzles
- **DaxBot AI**: Voice-ready chat assistant with context-aware help
- **Progress Tracking**: Points, badges, streaks, and level progression

### 🧠 ADHD-Optimized Design
- **Color Psychology**: Carefully chosen gradients and animations
- **Focus Management**: Clean, distraction-free interface
- **Accessibility**: Screen reader support and keyboard navigation
- **Engagement**: Fun, encouraging language and emoji usage
- **Celebrations**: Smooth transitions and achievement animations

### 🔐 Authentication & Security
- **JWT Authentication**: Secure login/registration system
- **Role-Based Access**: Student, parent, and teacher accounts
- **Password Security**: bcrypt hashing and validation
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Secure cross-origin requests

### 📊 Real-Time Features
- **Socket.io Integration**: Live chat and progress updates
- **Voice Recognition**: Web Speech API for hands-free interaction
- **Text-to-Speech**: Audio feedback for accessibility
- **Live Progress**: Real-time score and badge updates

## 🏗️ Architecture

### Frontend (React 19 + TypeScript)
```
client/src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── pages/             # Main application pages
├── hooks/             # Custom React hooks
└── utils/             # Helper functions
```

### Backend (Node.js + Express + MongoDB)
```
server/
├── routes/            # API endpoints
├── models/            # MongoDB schemas
├── middleware/        # Express middleware
├── socket/            # Socket.io handlers
└── utils/             # Helper functions
```

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.io Client** for real-time features
- **Chart.js** for progress visualization
- **React Hook Form** for form handling
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Socket.io** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing
- **Helmet** for security headers
- **Rate Limiting** for API protection

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **Jest** for testing
- **Cypress** for E2E testing
- **Nodemon** for development

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd dax-app
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

3. **Environment Setup**
```bash
# Create .env file in root directory
cp .env.example .env

# Edit .env with your configuration
MONGODB_URI=mongodb://localhost:27017/dax-learning
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

4. **Start the application**
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎯 Demo Walkthrough

### 1. Homepage Experience
- Beautiful landing page with Dax branding
- Feature showcase with animated cards
- Testimonials from parents and teachers
- Clear call-to-action for registration

### 2. Student Registration
- Age-appropriate registration form
- Parent/teacher account options
- Avatar selection and customization
- Welcome onboarding flow

### 3. Dashboard Experience
- Personalized welcome message
- Progress overview with charts
- Quick action buttons for games
- Achievement badges and streaks
- Weekly statistics visualization

### 4. Game Selection
- 6 different game categories
- Difficulty levels and descriptions
- Progress tracking per game
- Points and time estimates

### 5. DaxBot AI Assistant
- Floating chat interface
- Voice recognition support
- Context-aware responses
- Learning progress integration
- Settings for voice and accessibility

## 🎮 Game Types

### Reading Games
- **Fill-in-the-Blank Stories**: Interactive narratives with word completion
- **Word Matching**: Vocabulary building with visual aids
- **Instant Feedback**: Real-time scoring and encouragement

### Writing Practice
- **Letter Tracing**: Canvas-based handwriting practice
- **Stroke Analysis**: AI-powered writing assessment
- **Progress Tracking**: Improvement over time

### Sight Words
- **Flashcards**: Visual and audio reinforcement
- **Beat-the-Clock**: Timed challenges for engagement
- **Matching Games**: Interactive word recognition

### Comprehension
- **Multiple Choice**: Illustrated story comprehension
- **Drag-and-Drop**: Interactive puzzle solving
- **Visual Aids**: Pictures and animations for context

## 📊 Progress Tracking

### Points System
- **Base Points**: Earned for completing games
- **Bonus Points**: Time bonuses and perfect scores
- **Streak Multipliers**: Daily login rewards
- **Achievement Points**: Special milestone rewards

### Badges & Achievements
- **Level Badges**: Progress through learning levels
- **Skill Badges**: Mastery in specific areas
- **Streak Badges**: Consistency rewards
- **Special Badges**: Unique accomplishments

### Analytics Dashboard
- **Weekly Progress**: Visual charts and trends
- **Game Statistics**: Performance by category
- **Time Tracking**: Learning session duration
- **Improvement Metrics**: Growth over time

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Progress Tracking
- `GET /api/progress/user/:id` - Get user progress
- `POST /api/progress/update` - Update progress
- `GET /api/progress/leaderboard` - Leaderboard data

### Games
- `GET /api/games/reading` - Reading game content
- `GET /api/games/writing` - Writing game content
- `POST /api/games/score` - Submit game scores

### DaxBot
- `POST /api/daxbot/chat` - Chat with AI assistant
- `GET /api/daxbot/context` - Get learning context

## 🎨 Design Philosophy

### ADHD Optimization
- **Color Psychology**: Blue and green tones for focus
- **Minimal Distractions**: Clean, uncluttered interface
- **Clear Hierarchy**: Obvious navigation and actions
- **Positive Reinforcement**: Encouraging language and celebrations
- **Accessibility**: Screen reader and keyboard support

### Engagement Features
- **Animations**: Smooth transitions and micro-interactions
- **Sound Effects**: Audio feedback for actions
- **Celebrations**: Confetti and achievement animations
- **Progress Visualization**: Clear visual feedback
- **Gamification**: Points, badges, and levels

## 🚀 Deployment

### Production Setup
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables
```bash
NODE_ENV=production
MONGODB_URI=mongodb://your-mongodb-uri
JWT_SECRET=your-secure-jwt-secret
CLIENT_URL=https://your-domain.com
PORT=5000
```

### Docker Deployment (Coming Soon)
- Multi-service Docker Compose setup
- Nginx reverse proxy
- MongoDB container
- Health checks and monitoring

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Code Quality
```bash
npm run lint
npm run lint:fix
```

## 📈 Performance

### Frontend Optimization
- **Code Splitting**: Lazy-loaded components
- **Image Optimization**: WebP format and lazy loading
- **Bundle Analysis**: Optimized package sizes
- **Caching**: Service worker for offline support

### Backend Optimization
- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Redis for session management
- **Compression**: Gzip response compression
- **Rate Limiting**: API abuse protection

## 🔒 Security

### Authentication
- **JWT Tokens**: Secure session management
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Sanitized user inputs
- **CORS Protection**: Configured cross-origin policies

### Data Protection
- **HTTPS Only**: Secure communication
- **Helmet Headers**: Security headers
- **Rate Limiting**: API abuse prevention
- **Input Sanitization**: XSS protection

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting
- **Conventional Commits**: Standard commit messages

## 📝 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **ADHD Research**: Based on educational psychology research
- **Open Source**: Built with amazing open-source libraries
- **Community**: Feedback from parents and educators
- **Accessibility**: WCAG 2.1 compliance guidelines

---

**Dax: Where learning sticks like glue – not ADHD.** 🎯

*Built with ❤️ for children with ADHD and their families.*

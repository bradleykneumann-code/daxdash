# 🚀 Dax Quick Start Guide

Get Dax running in under 5 minutes! This guide will help you get the learning platform up and running quickly.

## ⚡ Super Quick Start (Docker)

If you have Docker installed, you can start everything with one command:

```bash
# Clone the repository
git clone <repository-url>
cd dax-app

# Start everything with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB Admin: http://localhost:8081
```

## 🛠️ Manual Quick Start

### 1. Prerequisites
- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn

### 2. Setup Environment
```bash
# Clone and navigate
git clone <repository-url>
cd dax-app

# Copy environment file
cp .env.example .env

# Install dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 3. Start Development
```bash
# Start MongoDB (if not running)
docker run -d --name dax-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=daxadmin \
  -e MONGO_INITDB_ROOT_PASSWORD=daxpassword123 \
  mongo:6.0

# Start the application
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎯 Demo Walkthrough

### 1. Register a Student Account
- Visit http://localhost:3000
- Click "Get Started" or "Register"
- Choose "Student" account type
- Fill in details (try: Name: "Emma", Age: 7)
- Complete registration

### 2. Explore the Dashboard
- See personalized welcome message
- View progress charts and statistics
- Check out achievement badges
- Explore quick action buttons

### 3. Try the Games
- Click "Play Games" to see all 6 game categories
- Start with "Reading Games" for a gentle introduction
- Try "DaxBot" for AI-powered assistance
- Earn points and see progress tracking

### 4. Experience DaxBot
- Click the floating chat button
- Ask questions like "Help me with reading"
- Try voice input (if supported by browser)
- See contextual responses based on your progress

## 🐳 Production Deployment

For production deployment with Docker:

```bash
# Use the deployment script
./deploy.sh prod

# Or manually
docker-compose up -d

# View logs
./deploy.sh logs all

# Stop services
./deploy.sh stop
```

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5000

# Kill the process or change ports in .env
```

**MongoDB connection failed:**
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
docker restart dax-mongodb
```

**Dependencies not installed:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules client/node_modules server/node_modules
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### Development vs Production

**Development Mode:**
- Hot reloading enabled
- Detailed error messages
- Unminified code
- Local MongoDB instance

**Production Mode:**
- Optimized builds
- HTTPS enabled
- Rate limiting active
- Security headers enabled

## 📊 Monitoring

### Check Application Status
```bash
# View all container status
docker ps

# Check application logs
./deploy.sh logs all

# Monitor specific service
./deploy.sh logs backend
```

### Database Management
```bash
# Create backup
./deploy.sh backup

# Restore from backup
./deploy.sh restore backup_file.gz

# Access MongoDB admin
# Visit: http://localhost:8081
# Username: admin
# Password: admin123
```

## 🎮 Game Features to Try

### Reading Games
- Fill-in-the-blank stories with instant feedback
- Word matching with visual aids
- Progressive difficulty levels

### Writing Practice
- Interactive letter tracing canvas
- Stroke analysis and feedback
- Progress tracking over time

### Sight Words
- Flashcard mode with audio
- Beat-the-clock challenges
- Matching games for reinforcement

### Comprehension
- Illustrated multiple-choice questions
- Drag-and-drop puzzle solving
- Visual story comprehension

### DaxBot AI
- Context-aware chat assistance
- Voice recognition support
- Learning progress integration
- Personalized help and encouragement

## 🏆 Achievement System

### Points & Badges
- Earn points for completing games
- Unlock badges for milestones
- Build streaks for daily engagement
- Level up through consistent practice

### Progress Tracking
- Weekly statistics and charts
- Game-specific progress tracking
- Time spent learning metrics
- Improvement over time visualization

## 🔐 Security Features

### Authentication
- JWT-based secure login
- Password hashing with bcrypt
- Role-based access control
- Session management

### Data Protection
- HTTPS encryption
- Rate limiting protection
- Input validation and sanitization
- CORS configuration

## 📱 Accessibility

### ADHD Optimization
- Clean, distraction-free interface
- Color psychology for focus
- Clear navigation hierarchy
- Positive reinforcement design

### Universal Access
- Screen reader support
- Keyboard navigation
- High contrast options
- Voice interaction support

## 🚀 Next Steps

1. **Customize Content**: Add your own stories and games
2. **Configure AI**: Set up OpenAI API for DaxBot
3. **Deploy to Production**: Use cloud hosting services
4. **Add Analytics**: Integrate learning analytics
5. **Expand Features**: Add more game types and content

---

**Ready to make learning stick like glue? Start exploring Dax today!** 🎯

*For detailed documentation, see the main README.md file.*
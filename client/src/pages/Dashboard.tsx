import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { 
  BookOpen, 
  PenTool, 
  Eye, 
  Brain, 
  MessageCircle, 
  Trophy, 
  Star,
  TrendingUp,
  Clock,
  Target,
  Award,
  Calendar,
  BarChart3,
  Play,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { progress, getLevelInfo, getWeeklyStats } = useProgress();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState<any>(null);

  const levelInfo = getLevelInfo();
  const weeklyStats = getWeeklyStats();

  useEffect(() => {
    if (progress) {
      setCurrentStreak(progress.streaks.current);
      
      // Prepare weekly data for charts
      const labels = weeklyStats.map(stat => stat.week);
      const pointsData = weeklyStats.map(stat => stat.points);
      const gamesData = weeklyStats.map(stat => stat.gamesPlayed);
      
      setWeeklyData({
        labels,
        datasets: [
          {
            label: 'Points Earned',
            data: pointsData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
          },
          {
            label: 'Games Played',
            data: gamesData,
            borderColor: 'rgb(147, 51, 234)',
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
            tension: 0.4,
          },
        ],
      });
    }
  }, [progress, weeklyStats]);

  const quickActions = [
    {
      title: 'Reading Games',
      description: 'Fill-in-the-blank stories and word matching',
      icon: BookOpen,
      color: 'from-blue-400 to-blue-600',
      href: '/reading',
      progress: progress?.gameProgress.reading.completed || 0,
      total: progress?.gameProgress.reading.total || 0
    },
    {
      title: 'Writing Practice',
      description: 'Interactive letter-drawing canvas',
      icon: PenTool,
      color: 'from-green-400 to-green-600',
      href: '/writing',
      progress: progress?.gameProgress.writing.completed || 0,
      total: progress?.gameProgress.writing.total || 0
    },
    {
      title: 'Sight Words',
      description: 'Flashcards and beat-the-clock games',
      icon: Eye,
      color: 'from-purple-400 to-purple-600',
      href: '/sight-words',
      progress: progress?.gameProgress.sightWords.completed || 0,
      total: progress?.gameProgress.sightWords.total || 0
    },
    {
      title: 'Comprehension',
      description: 'Multiple-choice and drag-drop puzzles',
      icon: Brain,
      color: 'from-orange-400 to-orange-600',
      href: '/comprehension',
      progress: progress?.gameProgress.comprehension.completed || 0,
      total: progress?.gameProgress.comprehension.total || 0
    }
  ];

  const recentBadges = progress?.badges.slice(-3) || [];
  const recentAchievements = progress?.achievements.slice(-3) || [];

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getLevelQuip = (level: number) => {
    const quips = [
      "You're just getting started! 🌱",
      "You're a letter-formation legend! ✨",
      "Reading champion in the making! 📚",
      "Sight word superstar! ⭐",
      "Comprehension master! 🧠",
      "You're unstoppable! 🚀",
      "Learning legend! 👑",
      "Grade 2 genius! 🎓",
      "Dax superstar! 🌟",
      "Ultimate learner! 🏆"
    ];
    return quips[Math.min(level - 1, quips.length - 1)];
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-fun text-primary-700 mb-4">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-xl text-gray-600 font-comic">
          Ready to continue your learning adventure?
        </p>
      </motion.div>

      {/* Level and Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Level Card */}
        <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <Trophy size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-fun text-primary-700">Level {levelInfo.current}</h3>
              <p className="text-sm text-gray-600 font-comic">{getLevelQuip(levelInfo.current)}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm font-comic mb-2">
              <span>Progress to Level {levelInfo.next}</span>
              <span>{Math.round(levelInfo.progress)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${levelInfo.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Points Card */}
        <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Star size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-fun text-yellow-700">{progress?.points || 0} Points</h3>
              <p className="text-sm text-gray-600 font-comic">Keep earning to level up!</p>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="card bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <TrendingUp size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-fun text-red-700">{currentStreak} Day Streak</h3>
              <p className="text-sm text-gray-600 font-comic">Don't break the chain! 🔥</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-3xl font-fun text-primary-700 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const progressPercentage = getProgressPercentage(action.progress, action.total);
            
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link to={action.href} className="block">
                  <div className="game-card h-full">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-lg font-fun text-gray-800 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600 font-comic mb-4">{action.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-comic mb-1">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="progress-bar h-2">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <Play size={16} className="text-primary-500 mr-2" />
                      <span className="text-sm font-comic text-primary-600">Start Learning</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Charts Section */}
      {weeklyData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="card">
            <h3 className="text-xl font-fun text-primary-700 mb-4 flex items-center">
              <BarChart3 size={20} className="mr-2" />
              Weekly Progress
            </h3>
            <Line 
              data={weeklyData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>

          <div className="card">
            <h3 className="text-xl font-fun text-primary-700 mb-4 flex items-center">
              <Target size={20} className="mr-2" />
              Learning Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                <span className="font-comic text-gray-700">Total Games Played</span>
                <span className="font-fun text-primary-700">
                  {weeklyStats.reduce((sum, stat) => sum + stat.gamesPlayed, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
                <span className="font-comic text-gray-700">Average Accuracy</span>
                <span className="font-fun text-secondary-700">
                  {Math.round(weeklyStats.reduce((sum, stat) => sum + stat.accuracy, 0) / Math.max(weeklyStats.length, 1))}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg">
                <span className="font-comic text-gray-700">Time Spent Learning</span>
                <span className="font-fun text-success-700">
                  {Math.round(weeklyStats.reduce((sum, stat) => sum + stat.timeSpent, 0) / 60)} min
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Badges */}
        <div className="card">
          <h3 className="text-xl font-fun text-primary-700 mb-4 flex items-center">
            <Award size={20} className="mr-2" />
            Recent Badges
          </h3>
          {recentBadges.length > 0 ? (
            <div className="space-y-3">
              {recentBadges.map((badge) => (
                <div key={badge.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-fun text-lg">{badge.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-fun text-gray-800">{badge.name}</h4>
                    <p className="text-sm font-comic text-gray-600">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 font-comic text-center py-8">
              No badges yet. Keep learning to earn your first badge! 🏆
            </p>
          )}
        </div>

        {/* Recent Achievements */}
        <div className="card">
          <h3 className="text-xl font-fun text-primary-700 mb-4 flex items-center">
            <Trophy size={20} className="mr-2" />
            Recent Achievements
          </h3>
          {recentAchievements.length > 0 ? (
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <Star size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-fun text-gray-800">{achievement.name}</h4>
                    <p className="text-sm font-comic text-gray-600">+{achievement.points} points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 font-comic text-center py-8">
              No achievements yet. Complete games to unlock achievements! 🎯
            </p>
          )}
        </div>
      </motion.div>

      {/* DaxBot Quick Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="card bg-gradient-to-br from-primary-100 to-secondary-100 border-primary-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <MessageCircle size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-fun text-primary-700">Need Help?</h3>
              <p className="text-gray-600 font-comic">Chat with DaxBot for personalized assistance!</p>
            </div>
          </div>
          <Link
            to="/daxbot"
            className="btn-primary flex items-center space-x-2"
          >
            <span>Chat with DaxBot</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-10 animate-float pointer-events-none">
        <div className="w-4 h-4 bg-yellow-400 rounded-full sparkle"></div>
      </div>
      <div className="fixed top-40 right-20 animate-float pointer-events-none" style={{ animationDelay: '1s' }}>
        <div className="w-3 h-3 bg-pink-400 rounded-full sparkle"></div>
      </div>
      <div className="fixed bottom-20 left-1/4 animate-float pointer-events-none" style={{ animationDelay: '2s' }}>
        <div className="w-5 h-5 bg-blue-400 rounded-full sparkle"></div>
      </div>
    </div>
  );
};

export default Dashboard;
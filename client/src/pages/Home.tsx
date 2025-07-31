import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  PenTool, 
  Eye, 
  Brain, 
  MessageCircle, 
  Trophy, 
  Star,
  ArrowRight,
  Play,
  Users,
  Award
} from 'lucide-react';

const Home: React.FC = () => {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const features = [
    {
      icon: BookOpen,
      title: 'Reading Games',
      description: 'Fill-in-the-blank stories and word matching with instant feedback',
      color: 'from-blue-400 to-blue-600',
      href: '/reading'
    },
    {
      icon: PenTool,
      title: 'Writing Practice',
      description: 'Interactive letter-drawing canvas with stroke analysis',
      color: 'from-green-400 to-green-600',
      href: '/writing'
    },
    {
      icon: Eye,
      title: 'Sight Words',
      description: 'Flashcards, beat-the-clock rounds, and matching games',
      color: 'from-purple-400 to-purple-600',
      href: '/sight-words'
    },
    {
      icon: Brain,
      title: 'Comprehension',
      description: 'Illustrated multiple-choice and drag-and-drop puzzles',
      color: 'from-orange-400 to-orange-600',
      href: '/comprehension'
    },
    {
      icon: MessageCircle,
      title: 'DaxBot AI Helper',
      description: 'Voice-ready chat with context-aware assistance',
      color: 'from-pink-400 to-pink-600',
      href: '/daxbot'
    },
    {
      icon: Trophy,
      title: 'Rewards & Progress',
      description: 'Points, badges, and unlockable avatars',
      color: 'from-yellow-400 to-yellow-600',
      href: '/dashboard'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Parent',
      content: 'My son with ADHD loves Dax! The games keep him engaged and he\'s actually excited to practice reading.',
      avatar: '👩‍👦'
    },
    {
      name: 'Mr. Johnson',
      role: 'Grade 2 Teacher',
      content: 'Dax has transformed how I teach. The AI helper provides personalized support and the progress tracking is invaluable.',
      avatar: '👨‍🏫'
    },
    {
      name: 'Emma L.',
      role: 'Student',
      content: 'I love earning badges and talking to DaxBot! Learning is so much fun now!',
      avatar: '👧'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-7xl font-fun text-primary-700 mb-6">
                Welcome to <span className="text-secondary-600">Dax</span>
              </h1>
              <p className="text-2xl md:text-3xl font-kid text-gray-600 mb-8">
                Where learning sticks like glue – not ADHD
              </p>
              <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto font-comic">
                A fully gamified learning app designed specifically for Grade 2 students with ADHD. 
                Master reading, writing, sight words, and comprehension through engaging games and AI-powered support.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="btn-primary text-xl px-8 py-4 flex items-center justify-center space-x-2"
              >
                <Play size={24} />
                <span>Start Learning Free</span>
                <ArrowRight size={24} />
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-xl px-8 py-4 flex items-center justify-center space-x-2"
              >
                <Users size={24} />
                <span>Sign In</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-4 h-4 bg-yellow-400 rounded-full sparkle"></div>
        </div>
        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-3 h-3 bg-pink-400 rounded-full sparkle"></div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-5 h-5 bg-blue-400 rounded-full sparkle"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-fun text-primary-700 mb-6">
              Learning Made Fun
            </h2>
            <p className="text-xl text-gray-600 font-comic max-w-3xl mx-auto">
              Six engaging learning modules designed specifically for kids with ADHD
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  onHoverStart={() => setIsHovered(feature.title)}
                  onHoverEnd={() => setIsHovered(null)}
                >
                  <Link to={feature.href} className="block">
                    <div className="game-card h-full">
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center mb-6 mx-auto`}>
                        <Icon size={32} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-fun text-gray-800 mb-4">{feature.title}</h3>
                      <p className="text-gray-600 font-comic mb-6">{feature.description}</p>
                      <div className="flex items-center justify-center">
                        <ArrowRight 
                          size={20} 
                          className={`text-primary-500 transition-transform duration-200 ${
                            isHovered === feature.title ? 'translate-x-2' : ''
                          }`} 
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DaxBot Preview */}
      <section className="py-20 bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-fun text-primary-700 mb-6">
                Meet DaxBot
              </h2>
              <p className="text-xl text-gray-600 font-comic mb-6">
                Your AI learning companion who knows exactly what you're working on and provides personalized help!
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
                    <Star size={16} className="text-white" />
                  </div>
                  <span className="font-comic text-gray-700">Voice-ready chat with speech recognition</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
                    <Star size={16} className="text-white" />
                  </div>
                  <span className="font-comic text-gray-700">Context-aware assistance and hints</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
                    <Star size={16} className="text-white" />
                  </div>
                  <span className="font-comic text-gray-700">Adaptive difficulty based on progress</span>
                </div>
              </div>
              <Link
                to="/daxbot"
                className="btn-primary mt-8 inline-flex items-center space-x-2"
              >
                <MessageCircle size={20} />
                <span>Chat with DaxBot</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-secondary-200"
            >
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-fun text-lg">D</span>
                  </div>
                  <div>
                    <h3 className="font-fun text-lg text-gray-800">DaxBot</h3>
                    <p className="text-sm text-gray-500 font-comic">AI Learning Assistant</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="font-comic text-gray-700">"Hey champ! Ready to turn wobbly letters into perfect lines?"</p>
                  </div>
                  <div className="bg-primary-100 rounded-lg p-3 ml-8">
                    <p className="font-comic text-gray-700">"I want to practice writing!"</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="font-comic text-gray-700">"Great choice! Let's start with the letter 'A'. Remember: start at the top, go down, then across!"</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-fun text-primary-700 mb-6">
              What Parents & Teachers Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="card text-center"
              >
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-gray-600 font-comic mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <h4 className="font-fun text-lg text-gray-800">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-fun text-white mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-white/90 font-comic mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already making learning fun with Dax!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 font-bold py-4 px-8 rounded-full text-xl hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Award size={24} />
                <span>Start Free Trial</span>
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white font-bold py-4 px-8 rounded-full text-xl hover:bg-white hover:text-primary-600 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
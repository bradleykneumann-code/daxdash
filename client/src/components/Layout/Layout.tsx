import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import { 
  Home, 
  BookOpen, 
  PenTool, 
  Eye, 
  Brain, 
  MessageCircle, 
  User, 
  Trophy,
  Menu,
  X,
  LogOut,
  Settings,
  Users
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { progress } = useProgress();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Reading', href: '/reading', icon: BookOpen },
    { name: 'Writing', href: '/writing', icon: PenTool },
    { name: 'Sight Words', href: '/sight-words', icon: Eye },
    { name: 'Comprehension', href: '/comprehension', icon: Brain },
    { name: 'DaxBot', href: '/daxbot', icon: MessageCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-fun text-xl">D</span>
                </div>
                <div>
                  <h1 className="text-2xl font-fun text-primary-700">Dax</h1>
                  <p className="text-xs text-gray-500 font-comic">where learning sticks like glue</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-comic transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700 shadow-md'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Points Display */}
              {progress && (
                <div className="hidden sm:flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-full">
                  <Trophy size={16} className="text-yellow-600" />
                  <span className="font-fun text-yellow-700">{progress.points} pts</span>
                </div>
              )}

              {/* User Avatar */}
              <div className="relative">
                <button
                  onClick={toggleMobileMenu}
                  className="flex items-center space-x-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-fun text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block font-comic text-gray-700">{user.username}</span>
                  {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
                </button>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-primary-200 z-50">
                    <div className="py-2">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="font-fun text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {progress && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Trophy size={14} className="text-yellow-600" />
                            <span className="text-sm font-fun text-yellow-700">
                              Level {progress.level} • {progress.points} points
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Mobile Navigation */}
                      <div className="md:hidden">
                        {navigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center space-x-3 px-4 py-3 text-left hover:bg-primary-50 transition-colors duration-200 ${
                                isActive(item.href) ? 'bg-primary-100 text-primary-700' : 'text-gray-700'
                              }`}
                            >
                              <Icon size={20} />
                              <span className="font-comic">{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Additional Menu Items */}
                      <div className="border-t border-gray-200 pt-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary-50 transition-colors duration-200"
                        >
                          <User size={20} />
                          <span className="font-comic">Profile</span>
                        </Link>
                        
                        {user.role === 'parent' && (
                          <Link
                            to="/parent-dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary-50 transition-colors duration-200"
                          >
                            <Users size={20} />
                            <span className="font-comic">Parent Dashboard</span>
                          </Link>
                        )}
                        
                        {user.role === 'teacher' && (
                          <Link
                            to="/worksheet-builder"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary-50 transition-colors duration-200"
                          >
                            <Settings size={20} />
                            <span className="font-comic">Worksheet Builder</span>
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                        >
                          <LogOut size={20} />
                          <span className="font-comic">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-primary-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 font-comic">
              © 2024 Dax Learning. Made with ❤️ for kids with ADHD.
            </p>
            <p className="text-xs text-gray-400 mt-1 font-comic">
              "Dax: where learning sticks like glue – not ADHD."
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
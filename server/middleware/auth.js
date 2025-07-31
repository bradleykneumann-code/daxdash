const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dax-secret-key');
    
    // Check if user exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'Invalid token. User not found or inactive.'
      });
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      message: 'Authentication failed.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dax-secret-key');
    
    // Check if user exists and is active
    const user = await User.findById(decoded.userId);
    if (user && user.isActive) {
      req.user = {
        userId: decoded.userId,
        role: decoded.role
      };
    }

    next();
  } catch (error) {
    // Don't fail for optional auth, just continue without user
    next();
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. ${roles.join(' or ')} role required.`
      });
    }

    next();
  };
};

// Student-only authorization
const studentOnly = authorize('student');

// Parent-only authorization
const parentOnly = authorize('parent');

// Teacher-only authorization
const teacherOnly = authorize('teacher');

// Parent or teacher authorization
const parentOrTeacher = authorize('parent', 'teacher');

module.exports = {
  auth,
  optionalAuth,
  authorize,
  studentOnly,
  parentOnly,
  teacherOnly,
  parentOrTeacher
};
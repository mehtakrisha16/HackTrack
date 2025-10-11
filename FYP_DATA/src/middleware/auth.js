const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (if using cookie-based auth)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - No token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hacktrack-india-secret');

      // REAL DATABASE - Only actual users from MongoDB
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized - User not found'
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (error) {
      // Handle malformed tokens gracefully - don't spam console
      if (error.name === 'JsonWebTokenError' && error.message === 'jwt malformed') {
        return res.status(401).json({
          success: false,
          message: 'Please clear your browser cache and login again',
          code: 'MALFORMED_TOKEN'
        });
      }
      
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Invalid token'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Optional authentication - user may or may not be logged in
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token, continue without authentication
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hacktrack-india-secret');

      // Find user by ID from token - REAL DATABASE
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = user;
      } else {
        req.user = null;
      }

    } catch (error) {
      // Invalid token, but continue without authentication
      req.user = null;
    }

    next();

  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Authorize specific roles (for future admin functionality)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role || 'user')) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role || 'user'}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if user owns resource (for profile updates, etc.)
const checkOwnership = (resourceField = 'user') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
        });
      }

      // For user profile routes, check if the ID matches
      if (req.params.id && req.params.id !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource'
        });
      }

      next();

    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error in authorization check'
      });
    }
  };
};

// Rate limiting for authentication attempts
const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth routes
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  checkOwnership,
  authRateLimit
};
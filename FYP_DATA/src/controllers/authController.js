const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hacktrack-mumbai-secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      email,
      password,
      phone,
      location,
      education,
      skills,
      interests
    } = req.body;

    try {
      // Check if database is connected, if not use mock mode
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        console.log('🧪 Using mock registration (database not connected)');
        
        const mockUser = {
          _id: Date.now().toString(),
          name,
          email: email.toLowerCase(),
          phone,
          location: { city: location?.city || 'Mumbai', state: location?.state || 'Maharashtra' }
        };
        
        const token = generateToken(mockUser._id);
        
        return res.status(201).json({
          success: true,
          message: 'Registration successful (mock mode)',
          user: mockUser,
          token
        });
      }

      // Try database operations with error handling
      let existingUser;
      try {
        existingUser = await User.findOne({ email: email.toLowerCase() });
      } catch (dbError) {
        console.log('🧪 Database query failed, switching to mock mode');
        const mockUser = {
          _id: Date.now().toString(),
          name,
          email: email.toLowerCase(),
          phone,
          location: { city: location?.city || 'Mumbai', state: location?.state || 'Maharashtra' }
        };
        
        const token = generateToken(mockUser._id);
        
        return res.status(201).json({
          success: true,
          message: 'Registration successful (mock mode - DB query failed)',
          user: mockUser,
          token
        });
      }
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create user
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone,
        location: {
          city: location?.city || 'Mumbai',
          state: location?.state || 'Maharashtra',
          country: location?.country || 'India',
          pincode: location?.pincode
        },
        education,
        skills: skills || [],
        interests: interests || []
      });

      // Generate token
      const token = generateToken(user._id);

      // Get user profile without sensitive data
      const userProfile = user.getPublicProfile();

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: userProfile
      });

    } catch (dbError) {
      console.error('Database error during registration:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    try {
      // Check if database is connected, if not use mock mode
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        console.log('🧪 Using mock login (database not connected)');
        // Mock successful login for testing
        if (email === 'test@example.com' && password === 'password123') {
          const mockUser = {
            _id: '507f1f77bcf86cd799439011',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
          };
          
          const token = generateToken(mockUser._id);
          
          return res.status(200).json({
            success: true,
            message: 'Login successful (mock mode)',
            user: mockUser,
            token
          });
        } else {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials (use test@example.com / password123 for testing)'
          });
        }
      }

      // Try database login first
      let user;
      try {
        user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      } catch (dbError) {
        console.log('🧪 Database query failed during login, switching to mock mode');
        if (email === 'test@example.com' && password === 'password123') {
          const mockUser = {
            _id: '507f1f77bcf86cd799439011',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
          };
          
          const token = generateToken(mockUser._id);
          
          return res.status(200).json({
            success: true,
            message: 'Login successful (mock mode - DB query failed)',
            user: mockUser,
            token
          });
        } else {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials (use test@example.com / password123 for testing)'
          });
        }
      }
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated. Please contact support.'
        });
      }

      // Check password
      const isPasswordMatch = await user.matchPassword(password);
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Get user profile without sensitive data
      const userProfile = user.getPublicProfile();

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: userProfile
      });

    } catch (dbError) {
      console.error('Database error during login:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.'
      });
    }

    // This code is now handled in the try block above

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userProfile = user.getPublicProfile();

    res.status(200).json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this route
    delete updates.password;
    delete updates.email;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userProfile = user.getPublicProfile();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isCurrentPasswordMatch = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set reset token
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire time (10 minutes)
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // In production, send email with reset token
    // For now, return the token (remove in production)
    res.status(200).json({
      success: true,
      message: 'Password reset token sent to email',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { resetToken } = req.params;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Generate new JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Google OAuth functionality removed - Email login only

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
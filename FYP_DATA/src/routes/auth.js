const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
  ,createDebugUser
} = require('../controllers/authController');
const {
  sendOTP,
  verifyOTP,
  resendOTP
} = require('../controllers/otpController');
const { protect, authRateLimit } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth routes
const strictAuthLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again later.'
  }
});

const forgotPasswordLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 forgot password requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts from this IP, please try again later.'
  }
});

// Validation rules for registration
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  
  body('location.pincode')
    .optional()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please provide a valid Indian pincode'),
  
  body('education.university')
    .optional()
    .isIn([
      'IIT Bombay', 'VJTI Mumbai', 'Mumbai University', 'SPIT Mumbai',
      'KJ Somaiya', 'Thadomal Shahani', 'Jai Hind College', 
      'St. Xavier\'s College', 'Other'
    ])
    .withMessage('Please select a valid university'),
  
  body('education.year')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array')
];

// Validation rules for login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for password change
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', strictAuthLimit, registerValidation, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', strictAuthLimit, loginValidation, login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, changePasswordValidation, changePassword);

// @route   POST /api/auth/forgot-password
// @desc    Forgot password - send reset token
// @access  Public
router.post('/forgot-password', forgotPasswordLimit, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
], forgotPassword);

// @route   PUT /api/auth/reset-password/:resetToken
// @desc    Reset password using token
// @access  Public
router.put('/reset-password/:resetToken', [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], resetPassword);

// @route   GET /api/auth/logout
// @desc    Logout user (clear cookie)
// @access  Private
router.get('/logout', protect, logout);

// @route   GET /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Private
router.get('/verify-token', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user.getPublicProfile()
  });
});

// OTP Authentication Routes
// @route   POST /api/auth/send-otp
// @desc    Send OTP to mobile number
// @access  Public
router.post('/send-otp', strictAuthLimit, [
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian mobile number')
], sendOTP);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login/register user
// @access  Public
router.post('/verify-otp', strictAuthLimit, [
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian mobile number'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
], verifyOTP);

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to mobile number
// @access  Public
router.post('/resend-otp', strictAuthLimit, [
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian mobile number')
], resendOTP);

// Debug: create a real user in DB for demo/unblock (requires DEBUG_CREATE_TOKEN header)
router.post('/debug-create-user', strictAuthLimit, createDebugUser);

module.exports = router;
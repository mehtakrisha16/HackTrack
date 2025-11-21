const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory OTP storage (use Redis in production)
const otpStorage = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Mock SMS service (replace with real SMS provider like Twilio)
const sendSMS = async (phone, otp) => {
  console.log(`📱 SMS sent to ${phone}: Your HackTrack OTP is ${otp}`);
  // In development, just log the OTP
  // In production, integrate with Twilio, AWS SNS, or other SMS service
  return { success: true, message: `OTP sent to ${phone}` };
};

// @desc    Send OTP to mobile number
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  try {
    // Support encrypted payloads
    let body = req.body;
    if (body && body.encrypted && body.payload) {
      const { decryptPayload } = require('../utils/encryption');
      const passphrase = process.env.ENCRYPTION_PASSPHRASE || process.env.REACT_APP_ENCRYPTION_PASSPHRASE;
      if (!passphrase) return res.status(400).json({ success: false, message: 'Server encryption not configured' });
      const decrypted = decryptPayload(body.payload, passphrase);
      if (!decrypted) return res.status(400).json({ success: false, message: 'Failed to decrypt payload' });
      try { body = JSON.parse(decrypted); } catch (err) { return res.status(400).json({ success: false, message: 'Invalid decrypted payload' }); }
    }

    const { phone } = body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Validate Indian phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP in memory (use Redis in production)
    otpStorage.set(phone, {
      otp: otp,
      expiryTime: expiryTime,
      attempts: 0
    });

    // Send SMS
    const smsResult = await sendSMS(phone, otp);

    if (smsResult.success) {
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        phone: phone,
        expiryTime: expiryTime
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending OTP'
    });
  }
};

// @desc    Verify OTP and login/register user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    // Support encrypted payloads
    let body = req.body;
    if (body && body.encrypted && body.payload) {
      const { decryptPayload } = require('../utils/encryption');
      const passphrase = process.env.ENCRYPTION_PASSPHRASE || process.env.REACT_APP_ENCRYPTION_PASSPHRASE;
      if (!passphrase) return res.status(400).json({ success: false, message: 'Server encryption not configured' });
      const decrypted = decryptPayload(body.payload, passphrase);
      if (!decrypted) return res.status(400).json({ success: false, message: 'Failed to decrypt payload' });
      try { body = JSON.parse(decrypted); } catch (err) { return res.status(400).json({ success: false, message: 'Invalid decrypted payload' }); }
    }

    const { phone, otp, name, email } = body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Check if OTP exists
    const storedOtpData = otpStorage.get(phone);
    if (!storedOtpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.'
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedOtpData.expiryTime) {
      otpStorage.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Check attempts limit
    if (storedOtpData.attempts >= 3) {
      otpStorage.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      storedOtpData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
        attemptsLeft: 3 - storedOtpData.attempts
      });
    }

    // OTP is valid, clear it
    otpStorage.delete(phone);

    // Check if user exists
    let user = await User.findOne({ phone: phone });

    if (user) {
      // Existing user - login
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        user: user.getPublicProfile(),
        isNewUser: false
      });

    } else {
      // New user - register
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required for new user registration'
        });
      }

      // Create new user
      user = new User({
        name: name,
        phone: phone,
        email: email || null,
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India'
        },
        authMethod: 'otp',
        isPhoneVerified: true,
        profileCompleted: false,
        joinedDate: new Date()
      });

      await user.save();

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        token: token,
        user: user.getPublicProfile(),
        isNewUser: true
      });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying OTP'
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Check if previous OTP request was recent (prevent spam)
    const existingOtp = otpStorage.get(phone);
    if (existingOtp && (Date.now() - (existingOtp.expiryTime - 5 * 60 * 1000)) < 60 * 1000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 60 seconds before requesting a new OTP'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStorage.set(phone, {
      otp: otp,
      expiryTime: expiryTime,
      attempts: 0
    });

    // Send SMS
    const smsResult = await sendSMS(phone, otp);

    if (smsResult.success) {
      res.status(200).json({
        success: true,
        message: 'OTP resent successfully',
        phone: phone,
        expiryTime: expiryTime
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP'
      });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resending OTP'
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP
};
const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/profile/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check privacy settings
    if (!user.preferences.privacy.profileVisible && (!req.user || req.user._id.toString() !== user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    const profile = user.getPublicProfile();

    // Remove sensitive information based on privacy settings
    if (!user.preferences.privacy.contactVisible && (!req.user || req.user._id.toString() !== user._id.toString())) {
      delete profile.email;
      delete profile.phone;
    }

    if (!user.preferences.privacy.achievementsVisible && (!req.user || req.user._id.toString() !== user._id.toString())) {
      delete profile.achievements;
    }

    res.status(200).json({
      success: true,
      user: profile
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users by various criteria
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const {
      name,
      city,
      university,
      skills,
      interests,
      year,
      limit = 20,
      page = 1
    } = req.query;

    // Build search query
    let query = { isActive: true, 'preferences.privacy.profileVisible': true };

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    if (university) {
      query['education.university'] = university;
    }

    if (year) {
      query['education.year'] = parseInt(year);
    }

    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.skills = { $in: skillsArray };
    }

    if (interests) {
      const interestsArray = Array.isArray(interests) ? interests : [interests];
      query.interests = { $in: interestsArray };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search
    const users = await User.find(query)
      .select('name location education skills interests stats avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/mumbai-stats
// @desc    Get Mumbai-specific user statistics
// @access  Public
router.get('/mumbai-stats', async (req, res) => {
  try {
    // Total users in Mumbai
    const totalMumbaiUsers = await User.countDocuments({
      'location.city': { $regex: 'Mumbai', $options: 'i' },
      isActive: true
    });

    // Users by university
    const universityStats = await User.aggregate([
      {
        $match: {
          'location.city': { $regex: 'Mumbai', $options: 'i' },
          isActive: true,
          'education.university': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$education.university',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Popular skills in Mumbai
    const skillStats = await User.aggregate([
      {
        $match: {
          'location.city': { $regex: 'Mumbai', $options: 'i' },
          isActive: true
        }
      },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Total achievements
    const totalAchievements = await User.aggregate([
      {
        $match: {
          'location.city': { $regex: 'Mumbai', $options: 'i' },
          isActive: true
        }
      },
      {
        $project: {
          achievementCount: { $size: '$achievements' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$achievementCount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: totalMumbaiUsers,
        universities: universityStats,
        popularSkills: skillStats,
        totalAchievements: totalAchievements[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Mumbai stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get Mumbai user leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'hackathons', limit = 10 } = req.query;

    let sortField;
    switch (type) {
      case 'hackathons':
        sortField = 'stats.hackathonsWon';
        break;
      case 'events':
        sortField = 'stats.eventsAttended';
        break;
      case 'internships':
        sortField = 'stats.internshipsCompleted';
        break;
      case 'projects':
        sortField = 'stats.projectsCompleted';
        break;
      default:
        sortField = 'stats.hackathonsWon';
    }

    const leaderboard = await User.find({
      'location.city': { $regex: 'Mumbai', $options: 'i' },
      isActive: true,
      'preferences.privacy.profileVisible': true,
      [sortField]: { $gt: 0 }
    })
    .select('name location education stats avatar')
    .sort({ [sortField]: -1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      type,
      leaderboard
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
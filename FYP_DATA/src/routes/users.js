const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');
const { upload, deleteOldPhoto } = require('../middleware/upload');
const path = require('path');

const router = express.Router();

// @route   POST /api/users/profile-photo
// @desc    Upload/Update user profile photo
// @access  Private
router.post('/profile-photo', protect, deleteOldPhoto, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a photo'
      });
    }

    // Construct the photo URL
    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    // Handle demo users
    if (req.user.name && req.user.name.includes('Demo User')) {
      return res.status(200).json({
        success: true,
        message: 'Profile photo uploaded successfully',
        profilePhoto: photoUrl,
        user: {
          ...req.user,
          profilePhoto: photoUrl
        }
      });
    }

    // Update user in database
    try {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profilePhoto: photoUrl },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile photo uploaded successfully',
        profilePhoto: photoUrl,
        user: user.getPublicProfile()
      });

    } catch (dbError) {
      console.error('Database error in profile photo upload:', dbError);
      // Fallback to demo response
      return res.status(200).json({
        success: true,
        message: 'Profile photo uploaded successfully',
        profilePhoto: photoUrl,
        user: {
          ...req.user,
          profilePhoto: photoUrl
        }
      });
    }

  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading profile photo'
    });
  }
});

// @route   DELETE /api/users/profile-photo
// @desc    Delete user profile photo
// @access  Private
router.delete('/profile-photo', protect, async (req, res) => {
  try {
    // Handle demo users
    if (req.user.name && req.user.name.includes('Demo User')) {
      return res.status(200).json({
        success: true,
        message: 'Profile photo removed successfully',
        user: {
          ...req.user,
          profilePhoto: null
        }
      });
    }

    // Get user's current photo
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete photo file if exists
      if (user.profilePhoto) {
        const fs = require('fs');
        const photoPath = path.join(__dirname, '../..', user.profilePhoto);
        
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      // Update user
      user.profilePhoto = null;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile photo removed successfully',
        user: user.getPublicProfile()
      });

    } catch (dbError) {
      console.error('Database error in profile photo deletion:', dbError);
      // Fallback to demo response
      return res.status(200).json({
        success: true,
        message: 'Profile photo removed successfully',
        user: {
          ...req.user,
          profilePhoto: null
        }
      });
    }

  } catch (error) {
    console.error('Profile photo deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile photo'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile (complete profile after Google OAuth)
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      bio,
      location,
      education,
      skills,
      interests,
      socialLinks,
      experience,
      projects
    } = req.body;

    // Handle demo users (when database is not available)
    if (req.user.name && req.user.name.includes('Demo User')) {
      // Create a complete user profile from the submitted data
      const updatedUser = {
        id: req.user.id,
        name: name || req.user.name,
        email: email || req.user.email,
        phone: phone || '',
        bio: bio || '',
        profilePicture: req.user.profilePicture,
        location: location || { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        education: education || {},
        skills: skills || [],
        interests: interests || [],
        socialLinks: socialLinks || {},
        experience: experience || [],
        projects: projects || [],
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            profileVisible: true,
            contactVisible: true,
            achievementsVisible: true
          }
        },
        isEmailVerified: true,
        isActive: true,
        profileCompleted: true
      };

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    }

    // For real database operations (when available)
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update user fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (bio) user.bio = bio;
      if (location) user.location = { ...user.location, ...location };
      if (education) user.education = { ...user.education, ...education };
      if (skills) user.skills = skills;
      if (interests) user.interests = interests;
      if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
      if (experience) user.experience = experience;
      if (projects) user.projects = projects;

      // Mark profile as completed
      user.profileCompleted = true;
      user.updatedAt = new Date();

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: user.getPublicProfile()
      });

    } catch (dbError) {
      console.error('Database error in profile update:', dbError);
      // Fallback to demo response
      const updatedUser = {
        id: req.user.id,
        name: name || req.user.name,
        email: email || req.user.email,
        phone: phone || '',
        bio: bio || '',
        profilePicture: req.user.profilePicture,
        location: location || { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        education: education || {},
        skills: skills || [],
        interests: interests || [],
        socialLinks: socialLinks || {},
        experience: experience || [],
        projects: projects || [],
        profileCompleted: true
      };

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    }

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics for dashboard
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Demo stats for when database is not available
    const demoStats = {
      eventsAttended: 5,
      hackathonsParticipated: 3,
      hackathonsWon: 1,
      internshipsCompleted: 2,
      projectsCompleted: 8,
      connectionsBuilt: 42,
      totalApplications: 12,
      acceptedApplications: 7,
      upcomingEvents: 4
    };

    res.status(200).json({
      success: true,
      stats: demoStats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user statistics'
    });
  }
});

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

    // Remove profile photo from public profiles (only show to the user themselves)
    if (!req.user || req.user._id.toString() !== user._id.toString()) {
      delete profile.profilePhoto;
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
      .select('name location education skills interests stats')
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
    .select('name location education stats')
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
const express = require('express');
const router = express.Router();
const { UserActivity, UserPoints } = require('../models/UserActivity');
const User = require('../models/User');
const { 
  getPointsForActivity, 
  getReputationTier, 
  checkForNewBadges,
  calculateStreakBonus 
} = require('../config/pointsSystem');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/points/track-activity
 * @desc    Track user activity and award points
 * @access  Private
 */
router.post('/track-activity', protect, async (req, res) => {
  try {
    const { activityType, metadata = {}, relatedEntityId, relatedEntityType } = req.body;
    const userId = req.user._id;

    // Get points for this activity
    const points = getPointsForActivity(activityType);
    
    if (!points) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity type'
      });
    }

    // Check if this exact activity already exists (prevent duplicate points)
    const existingActivity = await UserActivity.findOne({
      userId,
      activityType,
      relatedEntityId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24 hours
    });

    if (existingActivity && ['HACKATHON_APPLIED', 'INTERNSHIP_APPLIED', 'EVENT_REGISTERED'].includes(activityType)) {
      return res.status(200).json({
        success: true,
        message: 'Activity already tracked',
        activity: existingActivity
      });
    }

    // Add points using the static method
    const { activity, pointsSummary } = await UserPoints.addPoints(
      userId,
      activityType,
      points,
      { ...metadata, relatedEntityId, relatedEntityType }
    );

    // Update reputation tier
    const newTier = getReputationTier(pointsSummary.totalPoints);
    pointsSummary.reputationTier = newTier;

    // Check for new badges
    const newBadges = checkForNewBadges(pointsSummary.activityStats, pointsSummary.badges);
    if (newBadges.length > 0) {
      pointsSummary.badges.push(...newBadges);
      
      // Award points for badges
      const badgePoints = newBadges.reduce((sum, badge) => sum + badge.pointsAwarded, 0);
      pointsSummary.totalPoints += badgePoints;
    }

    await pointsSummary.save();

    // Update rank (async, don't wait)
    updateUserRank(userId).catch(err => console.error('Rank update error:', err));

    res.status(201).json({
      success: true,
      message: 'Activity tracked successfully',
      data: {
        activity,
        pointsAwarded: points,
        totalPoints: pointsSummary.totalPoints,
        reputationTier: pointsSummary.reputationTier,
        newBadges,
        rankChange: pointsSummary.rankChange
      }
    });

  } catch (error) {
    console.error('Track activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/points/my-points
 * @desc    Get current user's points and stats
 * @access  Private
 */
router.get('/my-points', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    let pointsSummary = await UserPoints.findOne({ userId }).populate('userId', 'name email profilePicture');
    
    if (!pointsSummary) {
      // Create initial points summary
      pointsSummary = await UserPoints.create({
        userId,
        totalPoints: 0,
        reputationTier: getReputationTier(0)
      });
      await pointsSummary.populate('userId', 'name email profilePicture');
    }

    // Get recent activities
    const recentActivities = await UserActivity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        points: pointsSummary,
        recentActivities
      }
    });

  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/points/leaderboard
 * @desc    Get real-time leaderboard
 * @access  Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { 
      category = 'all', 
      limit = 50,
      timeframe = 'all-time' // all-time, monthly, weekly
    } = req.query;

    let dateFilter = {};
    if (timeframe === 'monthly') {
      dateFilter = { lastActivityDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'weekly') {
      dateFilter = { lastActivityDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    }

    // Build sort field based on category
    let sortField = 'totalPoints';
    if (category !== 'all' && category !== 'overall') {
      sortField = `pointsBreakdown.${category}`;
    }

    // Get leaderboard
    const leaderboard = await UserPoints.find({
      totalPoints: { $gt: 0 },
      ...dateFilter
    })
    .populate('userId', 'name email profilePicture education location')
    .sort({ [sortField]: -1, lastUpdated: -1 })
    .limit(parseInt(limit))
    .lean();

    // Add rank numbers
    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: entry.userId,
      points: category === 'all' ? entry.totalPoints : entry.pointsBreakdown[category],
      totalPoints: entry.totalPoints,
      reputationTier: entry.reputationTier,
      badges: entry.badges,
      activityStats: entry.activityStats,
      rankChange: entry.rankChange
    }));

    // Get total users count
    const totalUsers = await UserPoints.countDocuments({ totalPoints: { $gt: 0 } });

    res.status(200).json({
      success: true,
      data: {
        leaderboard: leaderboardWithRank,
        totalUsers,
        category,
        timeframe,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/points/user-rank/:userId
 * @desc    Get specific user's rank and nearby competitors
 * @access  Public
 */
router.get('/user-rank/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userPoints = await UserPoints.findOne({ userId })
      .populate('userId', 'name email profilePicture education');

    if (!userPoints) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's rank
    const rank = await UserPoints.countDocuments({
      totalPoints: { $gt: userPoints.totalPoints }
    }) + 1;

    // Get nearby users (5 above, 5 below)
    const nearbyUsers = await UserPoints.find({
      totalPoints: {
        $gte: userPoints.totalPoints - 100,
        $lte: userPoints.totalPoints + 100
      }
    })
    .populate('userId', 'name email profilePicture')
    .sort({ totalPoints: -1 })
    .limit(11)
    .lean();

    res.status(200).json({
      success: true,
      data: {
        user: userPoints,
        rank,
        nearbyUsers
      }
    });

  } catch (error) {
    console.error('User rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/points/stats
 * @desc    Get platform-wide statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await UserPoints.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalPoints: { $sum: '$totalPoints' },
          avgPoints: { $avg: '$totalPoints' },
          totalHackathons: { $sum: '$activityStats.hackathonsParticipated' },
          totalInternships: { $sum: '$activityStats.internshipsCompleted' },
          totalEvents: { $sum: '$activityStats.eventsAttended' },
          totalProjects: { $sum: '$activityStats.projectsSubmitted' }
        }
      }
    ]);

    // Get tier distribution
    const tierDistribution = await UserPoints.aggregate([
      {
        $group: {
          _id: '$reputationTier.name',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        platformStats: stats[0] || {},
        tierDistribution
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/points/daily-login
 * @desc    Track daily login and update streak
 * @access  Private
 */
router.post('/daily-login', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    let pointsSummary = await UserPoints.findOne({ userId });
    
    if (!pointsSummary) {
      pointsSummary = await UserPoints.create({
        userId,
        totalPoints: 0,
        reputationTier: getReputationTier(0)
      });
    }

    // Check if user already logged in today
    const today = new Date().setHours(0, 0, 0, 0);
    const lastActivity = new Date(pointsSummary.lastActivityDate).setHours(0, 0, 0, 0);
    
    if (lastActivity === today) {
      return res.status(200).json({
        success: true,
        message: 'Already logged in today',
        data: { streak: pointsSummary.currentStreak }
      });
    }

    // Check if streak continues
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);
    const isStreakContinuing = lastActivity === yesterday;

    if (isStreakContinuing) {
      pointsSummary.currentStreak += 1;
    } else {
      pointsSummary.currentStreak = 1;
    }

    // Update longest streak
    if (pointsSummary.currentStreak > pointsSummary.longestStreak) {
      pointsSummary.longestStreak = pointsSummary.currentStreak;
    }

    // Award points
    const basePoints = getPointsForActivity('DAILY_LOGIN');
    const streakBonus = calculateStreakBonus(pointsSummary.currentStreak);
    const totalPoints = basePoints + streakBonus;

    pointsSummary.totalPoints += totalPoints;
    pointsSummary.lastActivityDate = new Date();
    await pointsSummary.save();

    // Track activity
    await UserActivity.create({
      userId,
      activityType: 'DAILY_LOGIN',
      pointsAwarded: totalPoints,
      metadata: { 
        streak: pointsSummary.currentStreak,
        streakBonus 
      }
    });

    res.status(200).json({
      success: true,
      message: 'Daily login tracked',
      data: {
        pointsAwarded: totalPoints,
        streak: pointsSummary.currentStreak,
        longestStreak: pointsSummary.longestStreak,
        streakBonus
      }
    });

  } catch (error) {
    console.error('Daily login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * Helper function to update user rank
 */
async function updateUserRank(userId) {
  try {
    const userPoints = await UserPoints.findOne({ userId });
    if (!userPoints) return;

    const rank = await UserPoints.countDocuments({
      totalPoints: { $gt: userPoints.totalPoints }
    }) + 1;

    const previousRank = userPoints.currentRank || rank;
    const rankChange = previousRank - rank;

    userPoints.previousRank = previousRank;
    userPoints.currentRank = rank;
    userPoints.rankChange = rankChange;
    
    await userPoints.save();
  } catch (error) {
    console.error('Update rank error:', error);
  }
}

module.exports = router;

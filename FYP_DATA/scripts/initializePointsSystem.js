/**
 * Initialize Points System
 * Run this script once to set up the points system for existing users
 */

const mongoose = require('mongoose');
const User = require('../src/models/User');
const { UserPoints } = require('../src/models/UserActivity');
const { getReputationTier } = require('../src/config/pointsSystem');
require('dotenv').config();

async function initializePointsSystem() {
  try {
    console.log('🚀 Starting points system initialization...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({ isActive: true });
    console.log(`📊 Found ${users.length} active users`);

    let initialized = 0;
    let skipped = 0;

    for (const user of users) {
      // Check if user already has points record
      const existingPoints = await UserPoints.findOne({ userId: user._id });
      
      if (existingPoints) {
        console.log(`⏭️  Skipping ${user.name} - already has points record`);
        skipped++;
        continue;
      }

      // Calculate initial points based on existing stats
      let totalPoints = 0;
      const activityStats = {
        hackathonsParticipated: user.stats?.hackathonsParticipated || 0,
        hackathonsWon: user.stats?.hackathonsWon || 0,
        internshipsCompleted: user.stats?.internshipsCompleted || 0,
        eventsAttended: user.stats?.eventsAttended || 0,
        projectsSubmitted: 0,
        badgesEarned: 0
      };

      // Award points for existing activities
      totalPoints += activityStats.hackathonsParticipated * 50; // Participated
      totalPoints += activityStats.hackathonsWon * 200;         // Won
      totalPoints += activityStats.internshipsCompleted * 250;  // Completed
      totalPoints += activityStats.eventsAttended * 30;         // Attended

      // Award profile completion bonus
      if (user.profileCompleted) {
        totalPoints += 100;
      }

      // Get reputation tier
      const reputationTier = getReputationTier(totalPoints);

      // Create points record
      await UserPoints.create({
        userId: user._id,
        totalPoints,
        pointsBreakdown: {
          hackathons: (activityStats.hackathonsParticipated * 50) + (activityStats.hackathonsWon * 200),
          internships: activityStats.internshipsCompleted * 250,
          events: activityStats.eventsAttended * 30,
          profile: user.profileCompleted ? 100 : 0,
          social: 0,
          engagement: 0,
          projects: 0
        },
        activityStats,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
        reputationTier,
        lastActivityDate: user.lastLogin || new Date()
      });

      console.log(`✅ Initialized ${user.name} with ${totalPoints} points (${reputationTier.name})`);
      initialized++;
    }

    // Update ranks for all users
    console.log('🔢 Calculating initial ranks...');
    const allPoints = await UserPoints.find({}).sort({ totalPoints: -1 });
    
    for (let i = 0; i < allPoints.length; i++) {
      allPoints[i].currentRank = i + 1;
      allPoints[i].previousRank = i + 1;
      allPoints[i].rankChange = 0;
      await allPoints[i].save();
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Initialized: ${initialized} users`);
    console.log(`⏭️  Skipped: ${skipped} users (already had records)`);
    console.log(`🏆 Total users in leaderboard: ${allPoints.length}`);
    console.log('\n🎉 Points system initialization complete!');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error initializing points system:', error);
    process.exit(1);
  }
}

// Run the initialization
initializePointsSystem();

const mongoose = require('mongoose');

/**
 * User Activity Model - Tracks all user actions for real-time points calculation
 * This model stores every action a user takes on the platform
 */
const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Activity details
  activityType: {
    type: String,
    required: true,
    enum: [
      // Application activities
      'HACKATHON_APPLIED',
      'HACKATHON_PARTICIPATED',
      'HACKATHON_WON',
      'INTERNSHIP_APPLIED',
      'INTERNSHIP_ACCEPTED',
      'INTERNSHIP_COMPLETED',
      'EVENT_REGISTERED',
      'EVENT_ATTENDED',
      
      // Profile activities
      'PROFILE_COMPLETED',
      'PROFILE_UPDATED',
      'SKILL_ADDED',
      'SKILL_VERIFIED',
      'ACHIEVEMENT_ADDED',
      
      // Social activities
      'PROFILE_VIEWED',
      'CONNECTION_MADE',
      
      // Platform engagement
      'DAILY_LOGIN',
      'LOGIN_STREAK',
      'BADGE_EARNED',
      
      // Content activities
      'PROJECT_SUBMITTED',
      'PROJECT_VERIFIED',
      'CERTIFICATION_ADDED'
    ]
  },

  // Points awarded for this activity
  pointsAwarded: {
    type: Number,
    required: true,
    default: 0
  },

  // Activity metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Reference to related entity (hackathon, internship, etc.)
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedEntityType: {
    type: String,
    enum: ['Hackathon', 'Internship', 'Event', 'Application', null]
  },

  // Activity status
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'verified'
  },

  // For verification purposes
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date

}, {
  timestamps: true
});

// Compound index for efficient queries
userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ userId: 1, activityType: 1 });
userActivitySchema.index({ status: 1 });

/**
 * User Points Summary Model - Aggregated points for fast leaderboard queries
 */
const userPointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // Total points
  totalPoints: {
    type: Number,
    default: 0,
    index: true
  },

  // Points breakdown by category
  pointsBreakdown: {
    hackathons: { type: Number, default: 0 },
    internships: { type: Number, default: 0 },
    events: { type: Number, default: 0 },
    profile: { type: Number, default: 0 },
    social: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    projects: { type: Number, default: 0 }
  },

  // Rank tracking
  currentRank: {
    type: Number,
    default: null
  },
  previousRank: {
    type: Number,
    default: null
  },
  rankChange: {
    type: Number,
    default: 0
  },

  // Activity statistics
  activityStats: {
    hackathonsParticipated: { type: Number, default: 0 },
    hackathonsWon: { type: Number, default: 0 },
    internshipsCompleted: { type: Number, default: 0 },
    eventsAttended: { type: Number, default: 0 },
    projectsSubmitted: { type: Number, default: 0 },
    badgesEarned: { type: Number, default: 0 }
  },

  // Streak tracking
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },

  // Badges and achievements
  badges: [{
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now },
    description: String
  }],

  // Reputation tier
  reputationTier: {
    name: { type: String, default: 'Newcomer' },
    icon: { type: String, default: '🌱' },
    color: { type: String, default: '#6b7280' },
    minScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 99 }
  },

  // Last update timestamp
  lastUpdated: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

// Index for leaderboard queries (sorted by total points)
userPointsSchema.index({ totalPoints: -1, lastUpdated: -1 });
userPointsSchema.index({ 'userId': 1, 'totalPoints': -1 });

// Static method to update user points
userPointsSchema.statics.addPoints = async function(userId, activityType, points, metadata = {}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create activity record
    const activity = await UserActivity.create([{
      userId,
      activityType,
      pointsAwarded: points,
      metadata,
      status: 'verified'
    }], { session });

    // Update or create points summary
    const pointsSummary = await this.findOneAndUpdate(
      { userId },
      {
        $inc: {
          totalPoints: points,
          [`pointsBreakdown.${getCategoryForActivity(activityType)}`]: points
        },
        $set: {
          lastUpdated: new Date(),
          lastActivityDate: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        session
      }
    );

    await session.commitTransaction();
    return { activity: activity[0], pointsSummary };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Helper function to map activity type to category
function getCategoryForActivity(activityType) {
  const categoryMap = {
    'HACKATHON_APPLIED': 'hackathons',
    'HACKATHON_PARTICIPATED': 'hackathons',
    'HACKATHON_WON': 'hackathons',
    'INTERNSHIP_APPLIED': 'internships',
    'INTERNSHIP_ACCEPTED': 'internships',
    'INTERNSHIP_COMPLETED': 'internships',
    'EVENT_REGISTERED': 'events',
    'EVENT_ATTENDED': 'events',
    'PROFILE_COMPLETED': 'profile',
    'PROFILE_UPDATED': 'profile',
    'SKILL_ADDED': 'profile',
    'SKILL_VERIFIED': 'profile',
    'ACHIEVEMENT_ADDED': 'profile',
    'PROFILE_VIEWED': 'social',
    'CONNECTION_MADE': 'social',
    'DAILY_LOGIN': 'engagement',
    'LOGIN_STREAK': 'engagement',
    'BADGE_EARNED': 'engagement',
    'PROJECT_SUBMITTED': 'projects',
    'PROJECT_VERIFIED': 'projects',
    'CERTIFICATION_ADDED': 'profile'
  };
  return categoryMap[activityType] || 'engagement';
}

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
const UserPoints = mongoose.model('UserPoints', userPointsSchema);

module.exports = { UserActivity, UserPoints };

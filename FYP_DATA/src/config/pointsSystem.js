/**
 * Points System Configuration
 * Defines point values for different activities
 */

const POINTS_CONFIG = {
  // Hackathon activities (High value - competitive achievements)
  HACKATHON_APPLIED: 10,
  HACKATHON_PARTICIPATED: 50,
  HACKATHON_WON: 200,
  
  // Internship activities (High value - professional growth)
  INTERNSHIP_APPLIED: 15,
  INTERNSHIP_ACCEPTED: 100,
  INTERNSHIP_COMPLETED: 250,
  
  // Event activities (Medium value - learning & networking)
  EVENT_REGISTERED: 5,
  EVENT_ATTENDED: 30,
  
  // Profile activities (Medium value - completeness matters)
  PROFILE_COMPLETED: 100,
  PROFILE_UPDATED: 10,
  SKILL_ADDED: 5,
  SKILL_VERIFIED: 25,
  ACHIEVEMENT_ADDED: 20,
  
  // Social activities (Low value - engagement)
  PROFILE_VIEWED: 1,
  CONNECTION_MADE: 8,
  
  // Platform engagement (Low-medium value - consistency)
  DAILY_LOGIN: 5,
  LOGIN_STREAK: 10, // Bonus for consecutive days
  BADGE_EARNED: 50,
  
  // Project activities (High value - tangible output)
  PROJECT_SUBMITTED: 40,
  PROJECT_VERIFIED: 100,
  CERTIFICATION_ADDED: 30
};

/**
 * Reputation Tiers
 * Based on total points accumulated
 */
const REPUTATION_TIERS = [
  { 
    name: 'Newcomer', 
    minScore: 0, 
    maxScore: 99, 
    color: '#6b7280', 
    icon: '🌱',
    description: 'Just getting started'
  },
  { 
    name: 'Explorer', 
    minScore: 100, 
    maxScore: 249, 
    color: '#059669', 
    icon: '🔍',
    description: 'Actively exploring opportunities'
  },
  { 
    name: 'Contributor', 
    minScore: 250, 
    maxScore: 499, 
    color: '#0284c7', 
    icon: '💡',
    description: 'Making meaningful contributions'
  },
  { 
    name: 'Achiever', 
    minScore: 500, 
    maxScore: 999, 
    color: '#7c3aed', 
    icon: '🏆',
    description: 'Consistent high performer'
  },
  { 
    name: 'Expert', 
    minScore: 1000, 
    maxScore: 1999, 
    color: '#dc2626', 
    icon: '⭐',
    description: 'Platform expert & mentor'
  },
  { 
    name: 'Legend', 
    minScore: 2000, 
    maxScore: Infinity, 
    color: '#ea580c', 
    icon: '👑',
    description: 'Community legend'
  }
];

/**
 * Badge Definitions
 * Special achievements users can unlock
 */
const BADGES = {
  // Streak badges
  WEEK_WARRIOR: {
    name: 'Week Warrior',
    icon: '🔥',
    description: '7-day login streak',
    points: 50,
    condition: (stats) => stats.currentStreak >= 7
  },
  MONTH_MASTER: {
    name: 'Month Master',
    icon: '⚡',
    description: '30-day login streak',
    points: 200,
    condition: (stats) => stats.currentStreak >= 30
  },
  
  // Hackathon badges
  HACKATHON_HUNTER: {
    name: 'Hackathon Hunter',
    icon: '🎯',
    description: 'Participated in 5 hackathons',
    points: 100,
    condition: (stats) => stats.hackathonsParticipated >= 5
  },
  HACKATHON_CHAMPION: {
    name: 'Hackathon Champion',
    icon: '🏆',
    description: 'Won 3 hackathons',
    points: 300,
    condition: (stats) => stats.hackathonsWon >= 3
  },
  
  // Internship badges
  INTERN_PRO: {
    name: 'Intern Pro',
    icon: '💼',
    description: 'Completed 2 internships',
    points: 200,
    condition: (stats) => stats.internshipsCompleted >= 2
  },
  
  // Event badges
  EVENT_ENTHUSIAST: {
    name: 'Event Enthusiast',
    icon: '🎪',
    description: 'Attended 10 events',
    points: 100,
    condition: (stats) => stats.eventsAttended >= 10
  },
  
  // Profile badges
  PROFILE_PERFECTIONIST: {
    name: 'Profile Perfectionist',
    icon: '✨',
    description: '100% profile completion',
    points: 100,
    condition: (stats) => stats.profileCompletion >= 100
  },
  
  // Project badges
  PROJECT_BUILDER: {
    name: 'Project Builder',
    icon: '🛠️',
    description: 'Submitted 5 projects',
    points: 150,
    condition: (stats) => stats.projectsSubmitted >= 5
  }
};

/**
 * Get points for an activity
 */
function getPointsForActivity(activityType) {
  return POINTS_CONFIG[activityType] || 0;
}

/**
 * Get reputation tier based on total points
 */
function getReputationTier(totalPoints) {
  for (let i = REPUTATION_TIERS.length - 1; i >= 0; i--) {
    const tier = REPUTATION_TIERS[i];
    if (totalPoints >= tier.minScore && totalPoints <= tier.maxScore) {
      return tier;
    }
  }
  return REPUTATION_TIERS[0]; // Default to Newcomer
}

/**
 * Check if user has earned any new badges
 */
function checkForNewBadges(stats, existingBadges = []) {
  const newBadges = [];
  const existingBadgeNames = existingBadges.map(b => b.name);
  
  for (const [key, badge] of Object.entries(BADGES)) {
    if (!existingBadgeNames.includes(badge.name) && badge.condition(stats)) {
      newBadges.push({
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        pointsAwarded: badge.points,
        earnedAt: new Date()
      });
    }
  }
  
  return newBadges;
}

/**
 * Calculate streak bonus
 */
function calculateStreakBonus(currentStreak) {
  if (currentStreak >= 30) return 50;
  if (currentStreak >= 14) return 25;
  if (currentStreak >= 7) return 10;
  return 0;
}

module.exports = {
  POINTS_CONFIG,
  REPUTATION_TIERS,
  BADGES,
  getPointsForActivity,
  getReputationTier,
  checkForNewBadges,
  calculateStreakBonus
};

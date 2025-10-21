// Reputation Score System
// Calculates user reputation based on various activities and achievements

class ReputationSystem {
  constructor() {
    this.scoreWeights = {
      // Event participation
      hackathonParticipation: 25,
      internshipApplication: 15,
      eventAttendance: 10,
      
      // Achievement unlocks
      badgeUnlocked: 20,
      streakMaintained: 5,
      profileCompletion: 30,
      
      // Social activities
      profileViews: 1,
      applicationSubmitted: 12,
      skillVerification: 18,
      
      // Platform engagement
      loginStreak: 3,
      dataUpdate: 8,
      platformUsage: 2
    };

    this.reputationTiers = [
      { name: 'Newcomer', minScore: 0, maxScore: 99, color: '#6b7280', icon: '🌱' },
      { name: 'Explorer', minScore: 100, maxScore: 249, color: '#059669', icon: '🔍' },
      { name: 'Contributor', minScore: 250, maxScore: 499, color: '#0284c7', icon: '💡' },
      { name: 'Achiever', minScore: 500, maxScore: 999, color: '#7c3aed', icon: '🏆' },
      { name: 'Expert', minScore: 1000, maxScore: 1999, color: '#dc2626', icon: '⭐' },
      { name: 'Legend', minScore: 2000, maxScore: Infinity, color: '#ea580c', icon: '👑' }
    ];
  }

  // Calculate total reputation score
  calculateReputationScore(userActivity) {
    let totalScore = 0;
    
    // Event participation scores
    totalScore += (userActivity.hackathonsParticipated || 0) * this.scoreWeights.hackathonParticipation;
    totalScore += (userActivity.internshipsApplied || 0) * this.scoreWeights.internshipApplication;
    totalScore += (userActivity.eventsAttended || 0) * this.scoreWeights.eventAttendance;
    
    // Achievement scores
    totalScore += (userActivity.badgesUnlocked || 0) * this.scoreWeights.badgeUnlocked;
    totalScore += (userActivity.currentStreak || 0) * this.scoreWeights.streakMaintained;
    
    // Profile completion bonus
    const profileCompleteness = this.calculateProfileCompleteness(userActivity.profile || {});
    totalScore += Math.floor(profileCompleteness * this.scoreWeights.profileCompletion / 100);
    
    // Social activity scores
    totalScore += (userActivity.profileViews || 0) * this.scoreWeights.profileViews;
    totalScore += (userActivity.applicationsSubmitted || 0) * this.scoreWeights.applicationSubmitted;
    totalScore += (userActivity.skillsVerified || 0) * this.scoreWeights.skillVerification;
    
    // Platform engagement
    totalScore += (userActivity.loginStreak || 0) * this.scoreWeights.loginStreak;
    totalScore += (userActivity.dataUpdates || 0) * this.scoreWeights.dataUpdate;
    totalScore += Math.floor((userActivity.platformUsageDays || 0) * this.scoreWeights.platformUsage);
    
    return Math.max(0, Math.floor(totalScore));
  }

  // Calculate profile completion percentage
  calculateProfileCompleteness(profile) {
    const requiredFields = [
      'name', 'email', 'college', 'year', 'branch', 
      'skills', 'bio', 'phone', 'linkedIn', 'github'
    ];
    
    let completed = 0;
    requiredFields.forEach(field => {
      if (profile[field] && profile[field].toString().trim() !== '') {
        completed++;
      }
    });
    
    // Bonus for profile picture
    if (profile.profilePicture) completed += 0.5;
    
    return Math.min(100, Math.floor((completed / requiredFields.length) * 100));
  }

  // Get reputation tier based on score
  getReputationTier(score) {
    return this.reputationTiers.find(tier => 
      score >= tier.minScore && score <= tier.maxScore
    ) || this.reputationTiers[0];
  }

  // Get next tier information
  getNextTier(currentScore) {
    const currentTier = this.getReputationTier(currentScore);
    const currentIndex = this.reputationTiers.indexOf(currentTier);
    
    if (currentIndex < this.reputationTiers.length - 1) {
      const nextTier = this.reputationTiers[currentIndex + 1];
      const pointsNeeded = nextTier.minScore - currentScore;
      return { nextTier, pointsNeeded };
    }
    
    return null; // Already at highest tier
  }

  // Get reputation breakdown for display
  getReputationBreakdown(userActivity) {
    const breakdown = [];
    
    // Event participation
    if (userActivity.hackathonsParticipated > 0) {
      breakdown.push({
        category: 'Hackathon Participation',
        points: userActivity.hackathonsParticipated * this.scoreWeights.hackathonParticipation,
        description: `${userActivity.hackathonsParticipated} hackathons participated`
      });
    }
    
    if (userActivity.internshipsApplied > 0) {
      breakdown.push({
        category: 'Internship Applications',
        points: userActivity.internshipsApplied * this.scoreWeights.internshipApplication,
        description: `${userActivity.internshipsApplied} internships applied`
      });
    }
    
    if (userActivity.eventsAttended > 0) {
      breakdown.push({
        category: 'Event Attendance',
        points: userActivity.eventsAttended * this.scoreWeights.eventAttendance,
        description: `${userActivity.eventsAttended} events attended`
      });
    }
    
    // Achievements
    if (userActivity.badgesUnlocked > 0) {
      breakdown.push({
        category: 'Achievement Badges',
        points: userActivity.badgesUnlocked * this.scoreWeights.badgeUnlocked,
        description: `${userActivity.badgesUnlocked} badges unlocked`
      });
    }
    
    if (userActivity.currentStreak > 0) {
      breakdown.push({
        category: 'Activity Streak',
        points: userActivity.currentStreak * this.scoreWeights.streakMaintained,
        description: `${userActivity.currentStreak} day streak maintained`
      });
    }
    
    // Profile completion
    const profileCompleteness = this.calculateProfileCompleteness(userActivity.profile || {});
    if (profileCompleteness > 0) {
      breakdown.push({
        category: 'Profile Completion',
        points: Math.floor(profileCompleteness * this.scoreWeights.profileCompletion / 100),
        description: `${profileCompleteness}% profile completed`
      });
    }
    
    return breakdown.sort((a, b) => b.points - a.points);
  }

  // Generate reputation insights and suggestions
  getReputationInsights(userActivity) {
    const insights = [];
    const currentScore = this.calculateReputationScore(userActivity);
    const nextTierInfo = this.getNextTier(currentScore);
    
    if (nextTierInfo) {
      insights.push({
        type: 'next-tier',
        message: `You're ${nextTierInfo.pointsNeeded} points away from becoming a ${nextTierInfo.nextTier.name}!`,
        priority: 'high'
      });
    }
    
    // Profile completion suggestions
    const profileCompleteness = this.calculateProfileCompleteness(userActivity.profile || {});
    if (profileCompleteness < 80) {
      insights.push({
        type: 'profile-completion',
        message: `Complete your profile to gain up to ${this.scoreWeights.profileCompletion} reputation points`,
        priority: 'medium'
      });
    }
    
    // Activity suggestions
    if ((userActivity.hackathonsParticipated || 0) === 0) {
      insights.push({
        type: 'hackathon-participation',
        message: `Participate in a hackathon to earn ${this.scoreWeights.hackathonParticipation} reputation points`,
        priority: 'medium'
      });
    }
    
    if ((userActivity.currentStreak || 0) < 7) {
      insights.push({
        type: 'activity-streak',
        message: 'Maintain a 7-day activity streak for bonus reputation points',
        priority: 'low'
      });
    }
    
    return insights;
  }
}

export default ReputationSystem;
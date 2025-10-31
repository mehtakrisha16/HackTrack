import axios from 'axios';

const API_URL = 'http://localhost:5000/api/points';

/**
 * Points Service - Handles all points and leaderboard operations
 */
class PointsService {
  
  /**
   * Track user activity and award points
   */
  static async trackActivity(activityType, metadata = {}, relatedEntityId = null, relatedEntityType = null) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No auth token found - activity not tracked');
        return null;
      }

      const response = await axios.post(
        `${API_URL}/track-activity`,
        {
          activityType,
          metadata,
          relatedEntityId,
          relatedEntityType
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Track activity error:', error);
      return null;
    }
  }

  /**
   * Track hackathon application
   */
  static async trackHackathonApplication(hackathonId, hackathonName) {
    return this.trackActivity(
      'HACKATHON_APPLIED',
      { hackathonName },
      hackathonId,
      'Hackathon'
    );
  }

  /**
   * Track internship application
   */
  static async trackInternshipApplication(internshipId, internshipTitle) {
    return this.trackActivity(
      'INTERNSHIP_APPLIED',
      { internshipTitle },
      internshipId,
      'Internship'
    );
  }

  /**
   * Track event registration
   */
  static async trackEventRegistration(eventId, eventName) {
    return this.trackActivity(
      'EVENT_REGISTERED',
      { eventName },
      eventId,
      'Event'
    );
  }

  /**
   * Track event attendance
   */
  static async trackEventAttendance(eventId, eventName) {
    return this.trackActivity(
      'EVENT_ATTENDED',
      { eventName },
      eventId,
      'Event'
    );
  }

  /**
   * Track profile completion
   */
  static async trackProfileCompletion() {
    return this.trackActivity('PROFILE_COMPLETED', { completedAt: new Date() });
  }

  /**
   * Track skill addition
   */
  static async trackSkillAdded(skillName) {
    return this.trackActivity('SKILL_ADDED', { skill: skillName });
  }

  /**
   * Track daily login
   */
  static async trackDailyLogin() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await axios.post(
        `${API_URL}/daily-login`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Daily login error:', error);
      return null;
    }
  }

  /**
   * Get current user's points
   */
  static async getMyPoints() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await axios.get(`${API_URL}/my-points`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get points error:', error);
      return null;
    }
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(category = 'all', timeframe = 'all-time', limit = 50) {
    try {
      const response = await axios.get(`${API_URL}/leaderboard`, {
        params: { category, timeframe, limit }
      });

      return response.data;
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return null;
    }
  }

  /**
   * Get user rank
   */
  static async getUserRank(userId) {
    try {
      const response = await axios.get(`${API_URL}/user-rank/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user rank error:', error);
      return null;
    }
  }

  /**
   * Get platform stats
   */
  static async getPlatformStats() {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Get stats error:', error);
      return null;
    }
  }
}

/**
 * Activity Tracker Hook
 * Automatically tracks user activities
 */
export const useActivityTracker = () => {
  const trackHackathonApply = (hackathonId, hackathonName) => {
    PointsService.trackHackathonApplication(hackathonId, hackathonName)
      .then(result => {
        if (result?.success && result?.data?.newBadges?.length > 0) {
          console.log('🎉 New badges earned!', result.data.newBadges);
          // You can show a toast notification here
        }
      });
  };

  const trackInternshipApply = (internshipId, internshipTitle) => {
    PointsService.trackInternshipApplication(internshipId, internshipTitle);
  };

  const trackEventRegister = (eventId, eventName) => {
    PointsService.trackEventRegistration(eventId, eventName);
  };

  return {
    trackHackathonApply,
    trackInternshipApply,
    trackEventRegister
  };
};

export default PointsService;

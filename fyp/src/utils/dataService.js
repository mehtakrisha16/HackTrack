// Enhanced Data Service for Live Data Integration
import apiCall from './api';

class DataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Live Data Fetching Methods
  async fetchEvents(filters = {}) {
    const cacheKey = `events_${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const data = await apiCall(`/api/events?${queryParams}`);
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async fetchHackathons(filters = {}) {
    const cacheKey = `hackathons_${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams({
        ...filters,
        type: 'hackathon'
      }).toString();
      const data = await apiCall(`/api/events?${queryParams}`);
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      throw error;
    }
  }

  async fetchInternships(filters = {}) {
    const cacheKey = `internships_${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams({
        ...filters,
        type: 'internship'
      }).toString();
      const data = await apiCall(`/api/events?${queryParams}`);
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching internships:', error);
      throw error;
    }
  }

  async fetchCollegeEvents(filters = {}) {
    const cacheKey = `college_events_${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams({
        ...filters,
        type: 'event'
      }).toString();
      const data = await apiCall(`/api/events?${queryParams}`);
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching college events:', error);
      throw error;
    }
  }

  // Application Management
  async submitApplication(applicationData) {
    try {
      const token = localStorage.getItem('token');
      const data = await apiCall('/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(applicationData)
      });
      
      // Clear relevant cache
      this.clearCache('applications');
      return data;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  async getApplications() {
    const cacheKey = 'user_applications';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const token = localStorage.getItem('token');
      const data = await apiCall('/api/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  // Recommendation System
  async getRecommendations() {
    const cacheKey = 'user_recommendations';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const token = localStorage.getItem('token');
      const data = await apiCall('/api/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  // User Profile Management
  async updateUserProfile(profileData) {
    try {
      const token = localStorage.getItem('token');
      const data = await apiCall('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      // Clear profile cache
      this.clearCache('profile');
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Saved Events Management
  async saveEvent(eventId) {
    try {
      const token = localStorage.getItem('token');
      const data = await apiCall('/api/events/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId })
      });
      
      this.clearCache('saved_events');
      return data;
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
    }
  }

  async unsaveEvent(eventId) {
    try {
      const token = localStorage.getItem('token');
      const data = await apiCall(`/api/events/save/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      this.clearCache('saved_events');
      return data;
    } catch (error) {
      console.error('Error unsaving event:', error);
      throw error;
    }
  }

  async getSavedEvents() {
    const cacheKey = 'saved_events';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const token = localStorage.getItem('token');
      const data = await apiCall('/api/events/saved', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching saved events:', error);
      // Return empty array instead of throwing to prevent crashes
      return { savedEvents: [], count: 0 };
    }
  }

  // Search functionality
  async searchEvents(query, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        ...filters
      }).toString();
      const data = await apiCall(`/api/events/search?${queryParams}`);
      return data;
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  }

  // Statistics and Analytics
  async getUserStats() {
    const cacheKey = 'user_stats';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const token = localStorage.getItem('token');
      const data = await apiCall('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Live Updates
  async getFeaturedEvents() {
    const cacheKey = 'featured_events';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const data = await apiCall('/api/events/featured');
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching featured events:', error);
      throw error;
    }
  }

  // Utility methods
  clearCache(pattern) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Real-time data integration with external APIs
  async integrateExternalData() {
    try {
      // This would integrate with external APIs like:
      // - DevPost for hackathons
      // - AngelList for internships
      // - University APIs for events
      const data = await apiCall('/api/external/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      this.clearCache(); // Clear all cache after sync
      return data;
    } catch (error) {
      console.error('Error integrating external data:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const dataService = new DataService();
export default dataService;
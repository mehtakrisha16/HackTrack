import api from '../utils/api';

/**
 * Application Service
 * Handles all application-related API calls
 */

const applicationService = {
  /**
   * Submit a new application
   * @param {Object} applicationData - Application details
   * @returns {Promise} Application data
   */
  async createApplication(applicationData) {
    try {
      const response = await api.post('/applications', applicationData);
      return response.data;
    } catch (error) {
      console.error('Create application error:', error);
      throw error;
    }
  },

  /**
   * Get all user applications
   * @param {Object} params - Query parameters (type, status, limit, page)
   * @returns {Promise} Applications list with stats
   */
  async getUserApplications(params = {}) {
    try {
      const response = await api.get('/applications', { params });
      return response.data;
    } catch (error) {
      console.error('Get applications error:', error);
      throw error;
    }
  },

  /**
   * Check if user has applied to a specific opportunity
   * @param {String} opportunityId - ID of the opportunity
   * @returns {Promise} { hasApplied, application }
   */
  async checkApplication(opportunityId) {
    try {
      const response = await api.get(`/applications/check/${opportunityId}`);
      return response.data;
    } catch (error) {
      console.error('Check application error:', error);
      throw error;
    }
  },

  /**
   * Get single application details
   * @param {String} id - Application ID
   * @returns {Promise} Application data
   */
  async getApplicationById(id) {
    try {
      const response = await api.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get application error:', error);
      throw error;
    }
  },

  /**
   * Update application status
   * @param {String} id - Application ID
   * @param {String} status - New status
   * @param {String} notes - Optional notes
   * @returns {Promise} Updated application data
   */
  async updateApplicationStatus(id, status, notes = '') {
    try {
      const response = await api.put(`/applications/${id}`, { status, notes });
      return response.data;
    } catch (error) {
      console.error('Update application error:', error);
      throw error;
    }
  },

  /**
   * Withdraw/delete application
   * @param {String} id - Application ID
   * @returns {Promise} Success message
   */
  async deleteApplication(id) {
    try {
      const response = await api.delete(`/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete application error:', error);
      throw error;
    }
  },

  /**
   * Get application statistics
   * @returns {Promise} Stats and recent applications
   */
  async getApplicationStats() {
    try {
      const response = await api.get('/applications/stats/summary');
      return response.data;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }
};

export default applicationService;

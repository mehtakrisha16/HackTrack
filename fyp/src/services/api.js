import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'An error occurred';
      
      // Handle 401 Unauthorized - logout user
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return Promise.reject({ message, status: error.response.status });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({ message: 'Network error. Please check your connection.', status: 0 });
    } else {
      // Something else happened
      return Promise.reject({ message: error.message || 'An unexpected error occurred', status: 0 });
    }
  }
);

// ================== AUTH SERVICES ==================

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Google OAuth login
  googleAuth: async (credential) => {
    const response = await api.post('/auth/google', { credential });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      authService.logout();
      throw error;
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.valid;
    } catch (error) {
      return false;
    }
  },
};

// ================== USER SERVICES ==================

export const userService = {
  // Get user profile
  getProfile: async () => {
    return await api.get('/users/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Update password
  updatePassword: async (passwordData) => {
    return await api.put('/users/password', passwordData);
  },

  // Upload profile picture
  uploadAvatar: async (formData) => {
    return await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get user stats
  getStats: async () => {
    return await api.get('/users/stats');
  },

  // Get user applications
  getApplications: async () => {
    return await api.get('/users/applications');
  },

  // Get saved events
  getSavedEvents: async () => {
    return await api.get('/users/saved-events');
  },
};

// ================== EVENT SERVICES ==================

export const eventService = {
  // Get all events
  getAllEvents: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/events?${params}`);
  },

  // Get event by ID
  getEventById: async (id) => {
    return await api.get(`/events/${id}`);
  },

  // Save/unsave event
  toggleSaveEvent: async (eventId) => {
    return await api.post(`/events/${eventId}/save`);
  },

  // Apply to event
  applyToEvent: async (eventId, applicationData) => {
    return await api.post(`/events/${eventId}/apply`, applicationData);
  },

  // Get featured events
  getFeaturedEvents: async () => {
    return await api.get('/events/featured');
  },

  // Get upcoming events
  getUpcomingEvents: async (limit = 10) => {
    return await api.get(`/events/upcoming?limit=${limit}`);
  },
};

// ================== HACKATHON SERVICES ==================

export const hackathonService = {
  // Get all hackathons
  getAllHackathons: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/hackathons?${params}`);
  },

  // Get hackathon by ID
  getHackathonById: async (id) => {
    return await api.get(`/hackathons/${id}`);
  },

  // Register for hackathon
  registerForHackathon: async (hackathonId, teamData) => {
    return await api.post(`/hackathons/${hackathonId}/register`, teamData);
  },

  // Submit hackathon project
  submitProject: async (hackathonId, projectData) => {
    return await api.post(`/hackathons/${hackathonId}/submit`, projectData);
  },

  // Get featured hackathons
  getFeaturedHackathons: async () => {
    return await api.get('/hackathons/featured');
  },
};

// ================== INTERNSHIP SERVICES ==================

export const internshipService = {
  // Get all internships
  getAllInternships: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/internships?${params}`);
  },

  // Get internship by ID
  getInternshipById: async (id) => {
    return await api.get(`/internships/${id}`);
  },

  // Apply to internship
  applyToInternship: async (internshipId, applicationData) => {
    return await api.post(`/internships/${internshipId}/apply`, applicationData);
  },

  // Get featured internships
  getFeaturedInternships: async () => {
    return await api.get('/internships/featured');
  },

  // Get internships by company
  getByCompany: async (company) => {
    return await api.get(`/internships/company/${company}`);
  },
};

// ================== APPLICATION SERVICES ==================

export const applicationService = {
  // Get user's applications
  getMyApplications: async () => {
    return await api.get('/applications');
  },

  // Get application by ID
  getApplicationById: async (id) => {
    return await api.get(`/applications/${id}`);
  },

  // Update application status
  updateApplicationStatus: async (id, status) => {
    return await api.put(`/applications/${id}/status`, { status });
  },

  // Withdraw application
  withdrawApplication: async (id) => {
    return await api.delete(`/applications/${id}`);
  },
};

// ================== NOTIFICATION SERVICES ==================

export const notificationService = {
  // Get all notifications
  getNotifications: async () => {
    return await api.get('/notifications');
  },

  // Mark notification as read
  markAsRead: async (id) => {
    return await api.put(`/notifications/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: async () => {
    return await api.put('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (id) => {
    return await api.delete(`/notifications/${id}`);
  },
};

// ================== SEARCH SERVICES ==================

export const searchService = {
  // Global search
  globalSearch: async (query) => {
    return await api.get(`/search?q=${encodeURIComponent(query)}`);
  },

  // Search events
  searchEvents: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters }).toString();
    return await api.get(`/search/events?${params}`);
  },

  // Search hackathons
  searchHackathons: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters }).toString();
    return await api.get(`/search/hackathons?${params}`);
  },

  // Search internships
  searchInternships: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters }).toString();
    return await api.get(`/search/internships?${params}`);
  },
};

// Export default api instance for custom requests
export default api;

// API utility functions for HackTrack Mumbai

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log(`🚀 API Call: ${config.method || 'GET'} ${url}`);
    console.log('📤 Request data:', config.body ? JSON.parse(config.body) : 'No body');

    const response = await fetch(url, config);
    const data = await response.json();

    console.log(`📥 Response status: ${response.status}`);
    console.log('📥 Response data:', data);

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      'Network error. Please check your connection and try again.',
      0,
      error
    );
  }
};

// Auth API functions
export const authAPI = {
  register: (userData) => apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getProfile: (token) => apiCall('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),
};

// User API functions
export const userAPI = {
  updateProfile: (profileData, token) => apiCall('/api/users/profile', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  }),

  getStats: (token) => apiCall('/api/users/stats', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

  searchUsers: (searchParams) => {
    const queryString = new URLSearchParams(searchParams).toString();
    return apiCall(`/api/users/search?${queryString}`);
  },
};

export default apiCall;
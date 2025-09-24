// Enhanced authentication utilities
import { authAPI } from './api';

export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get current user from token
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        return null;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      localStorage.removeItem('token');
      return null;
    }
  },

  // Login with credentials
  login: async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      
      // Store token
      localStorage.setItem('token', data.token);
      
      // Return user data
      return {
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        location: data.user.location,
        education: data.user.education,
        skills: data.user.skills || [],
        interests: data.user.interests || [],
        bio: data.user.bio,
        avatar: data.user.avatar || '/default-avatar.png',
        joinedDate: data.user.createdAt || data.user.joinedDate
      };
    } catch (error) {
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const data = await authAPI.register(userData);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        return data.user;
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      throw error;
    }
  },

  // Verify token validity
  verifyToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch('/api/auth/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }
};

export default authUtils;
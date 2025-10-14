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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        credentials: 'include', // Include cookies for session persistence
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Check for malformed token specifically
        if (errorData.code === 'MALFORMED_TOKEN') {
          console.log('Clearing malformed token from localStorage');
        }
        // Token is invalid, remove it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  },

  // Login with credentials
  login: async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      
      // Store token and user data (cookies are automatically handled by browser)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
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
        socialLinks: data.user.socialLinks,
        avatar: data.user.avatar || '/default-avatar.png',
        joinedDate: data.user.createdAt || data.user.joinedDate
      };
    } catch (error) {
      throw error;
    }
  },

  // Register new user (automatically logs in like LinkedIn)
  register: async (userData) => {
    try {
      const data = await authAPI.register(userData);
      
      // Return complete response with token and user for auto-login
      return {
        token: data.token,
        user: {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          location: data.user.location,
          education: data.user.education,
          skills: data.user.skills || [],
          interests: data.user.interests || [],
          bio: data.user.bio,
          socialLinks: data.user.socialLinks,
          avatar: data.user.avatar || '/default-avatar.png',
          joinedDate: data.user.createdAt || data.user.joinedDate
        }
      };
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`, {
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
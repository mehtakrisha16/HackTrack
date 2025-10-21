import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Custom hook for fetching opportunities
export const useOpportunities = (initialFilters = {}) => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'postedDate',
    sortOrder: 'desc',
    ...initialFilters
  });

  const fetchOpportunities = useCallback(async (newFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = { ...filters, ...newFilters };
      const queryString = new URLSearchParams(queryParams).toString();
      
      const response = await axios.get(`${API_BASE_URL}/opportunities?${queryString}`);
      
      if (response.data.success) {
        setOpportunities(response.data.data.opportunities);
        setPagination(response.data.data.pagination);
        setFilters(prev => ({ ...prev, ...newFilters }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch opportunities');
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError(err.message || 'Failed to fetch opportunities');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOpportunities();
  }, []); // Run on mount

  // Also refresh opportunities when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOpportunities();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchOpportunities]);

  const updateFilters = useCallback((newFilters) => {
    fetchOpportunities({ ...newFilters, page: 1 });
  }, [fetchOpportunities]);

  const loadMore = useCallback(() => {
    if (pagination.hasNext) {
      fetchOpportunities({ page: pagination.currentPage + 1 });
    }
  }, [pagination, fetchOpportunities]);

  const refresh = useCallback(() => {
    fetchOpportunities({ page: 1 });
  }, [fetchOpportunities]);

  return {
    opportunities,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    loadMore,
    refresh,
    fetchOpportunities
  };
};

// Hook for opportunity statistics
export const useOpportunityStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/opportunities/stats`);
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
};

// Hook for trending opportunities
export const useTrendingOpportunities = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/opportunities/trending`);
      
      if (response.data.success) {
        setTrending(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch trending opportunities');
      }
    } catch (err) {
      console.error('Error fetching trending:', err);
      setError(err.message || 'Failed to fetch trending opportunities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return { trending, loading, error, refresh: fetchTrending };
};

// Hook for filter options
export const useFilterOptions = () => {
  const [filterOptions, setFilterOptions] = useState({
    types: [],
    categories: [],
    companies: [],
    locations: [],
    skills: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFilterOptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/opportunities/filters`);
      
      if (response.data.success) {
        setFilterOptions(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch filter options');
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
      setError(err.message || 'Failed to fetch filter options');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  return { filterOptions, loading, error, refresh: fetchFilterOptions };
};

// Hook for single opportunity
export const useOpportunity = (id) => {
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOpportunity = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/opportunities/${id}`);
      
      if (response.data.success) {
        setOpportunity(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch opportunity');
      }
    } catch (err) {
      console.error('Error fetching opportunity:', err);
      setError(err.message || 'Failed to fetch opportunity');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOpportunity();
  }, [fetchOpportunity]);

  return { opportunity, loading, error, refresh: fetchOpportunity };
};

// Manual scraping trigger (admin only)
export const useScraper = () => {
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState(null);

  const triggerScraping = useCallback(async () => {
    setScraping(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/opportunities/scrape`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to trigger scraping');
      }
      
      return response.data;
    } catch (err) {
      console.error('Error triggering scraping:', err);
      setError(err.message || 'Failed to trigger scraping');
      throw err;
    } finally {
      setScraping(false);
    }
  }, []);

  return { triggerScraping, scraping, error };
};

// Utility functions for opportunity data
export const opportunityUtils = {
  // Format salary/prize information
  formatSalary: (salary) => {
    if (!salary) return 'Not specified';
    return salary;
  },

  // Calculate days until deadline
  getDaysUntilDeadline: (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  },

  // Check if opportunity is new (within last 7 days)
  isNew: (postedDate) => {
    const now = new Date();
    const posted = new Date(postedDate);
    const diffTime = now - posted;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  },

  // Check if opportunity is urgent (deadline within 3 days)
  isUrgent: (deadline) => {
    if (!deadline) return false;
    const daysLeft = opportunityUtils.getDaysUntilDeadline(deadline);
    return daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
  },

  // Format experience requirement
  formatExperience: (experience) => {
    if (!experience || experience === 'Not specified') return 'Any experience level';
    return experience;
  },

  // Get opportunity type color
  getTypeColor: (type) => {
    const colors = {
      'internship': '#3b82f6',
      'job': '#10b981', 
      'hackathon': '#f59e0b',
      'event': '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  },

  // Get category icon
  getCategoryIcon: (category) => {
    const icons = {
      'software': '💻',
      'data-science': '📊',
      'product': '🎯',
      'design': '🎨',
      'marketing': '📈',
      'finance': '💰',
      'blockchain': '⛓️',
      'general': '🔧'
    };
    return icons[category] || '🔧';
  },

  // Filter opportunities by search term
  filterBySearch: (opportunities, searchTerm) => {
    if (!searchTerm) return opportunities;
    
    const term = searchTerm.toLowerCase();
    return opportunities.filter(opp => 
      opp.title.toLowerCase().includes(term) ||
      opp.company.toLowerCase().includes(term) ||
      opp.description.toLowerCase().includes(term) ||
      opp.skills.some(skill => skill.toLowerCase().includes(term))
    );
  },

  // Group opportunities by company
  groupByCompany: (opportunities) => {
    return opportunities.reduce((groups, opp) => {
      const company = opp.company;
      if (!groups[company]) {
        groups[company] = [];
      }
      groups[company].push(opp);
      return groups;
    }, {});
  },

  // Sort opportunities by various criteria
  sortOpportunities: (opportunities, sortBy, order = 'desc') => {
    const sorted = [...opportunities].sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'postedDate':
          aVal = new Date(a.postedDate);
          bVal = new Date(b.postedDate);
          break;
        case 'deadline':
          aVal = a.deadline ? new Date(a.deadline) : new Date('2099-12-31');
          bVal = b.deadline ? new Date(b.deadline) : new Date('2099-12-31');
          break;
        case 'company':
          aVal = a.company.toLowerCase();
          bVal = b.company.toLowerCase();
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }
};

export default {
  useOpportunities,
  useOpportunityStats,
  useTrendingOpportunities,
  useFilterOptions,
  useOpportunity,
  useScraper,
  opportunityUtils
};
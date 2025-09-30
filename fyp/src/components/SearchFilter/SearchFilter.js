// Advanced Search and Filter Component
import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiMapPin, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import dataService from '../../utils/dataService';
import './SearchFilter.css';

const SearchFilter = ({ onResultsUpdate, eventType = 'all' }) => {
  const { filters, setFilters, searchQuery, setSearchQuery } = useContext(AppContext);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Filter options
  const filterOptions = {
    locations: [
      'Mumbai', 'Pune', 'Bengaluru', 'Delhi NCR', 'Chennai', 'Hyderabad',
      'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi', 'Online', 'Pan India'
    ],
    difficulties: ['Beginner', 'Intermediate', 'Advanced'],
    technologies: [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Machine Learning',
      'AI', 'Data Science', 'Mobile Development', 'Web Development',
      'Blockchain', 'Cloud Computing', 'Cybersecurity', 'IoT', 'DevOps'
    ],
    categories: [
      'Hackathon', 'Internship', 'College Event', 'Workshop', 'Competition',
      'Conference', 'Meetup', 'Bootcamp', 'Certification'
    ],
    dateRanges: [
      { label: 'This Week', value: 'week' },
      { label: 'This Month', value: 'month' },
      { label: 'Next 3 Months', value: '3months' },
      { label: 'Next 6 Months', value: '6months' },
      { label: 'Custom Range', value: 'custom' }
    ]
  };

  // Search functionality
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.length > 2) {
        performSearch();
      } else if (searchQuery.length === 0) {
        loadDefaultResults();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filters]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const results = await dataService.searchEvents(searchQuery, {
        ...filters,
        type: eventType === 'all' ? undefined : eventType
      });
      
      setSearchResults(results.data || results.events || []);
      onResultsUpdate(results.data || results.events || []);
      
      // Generate suggestions based on search
      if (searchQuery.length > 2) {
        generateSuggestions(searchQuery);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      onResultsUpdate([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultResults = async () => {
    try {
      setLoading(true);
      const results = await dataService.fetchEvents({
        ...filters,
        type: eventType === 'all' ? undefined : eventType,
        limit: 20
      });
      
      setSearchResults(results.data || results.events || []);
      onResultsUpdate(results.data || results.events || []);
      
    } catch (error) {
      console.error('Error loading default results:', error);
      setSearchResults([]);
      onResultsUpdate([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = (query) => {
    const suggestions = [];
    
    // Technology suggestions
    filterOptions.technologies.forEach(tech => {
      if (tech.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({ type: 'technology', value: tech, icon: '💻' });
      }
    });
    
    // Location suggestions
    filterOptions.locations.forEach(location => {
      if (location.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({ type: 'location', value: location, icon: '📍' });
      }
    });
    
    // Category suggestions
    filterOptions.categories.forEach(category => {
      if (category.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({ type: 'category', value: category, icon: '🏷️' });
      }
    });
    
    setSuggestions(suggestions.slice(0, 5));
  };

  const handleFilterChange = (filterType, value, checked) => {
    const currentValues = filters[filterType] || [];
    let newValues;
    
    if (Array.isArray(currentValues)) {
      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter(v => v !== value);
      }
    } else {
      newValues = checked ? value : '';
    }
    
    setFilters({ [filterType]: newValues });
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      location: 'all',
      dateRange: 'all',
      difficulty: 'all',
      type: 'all',
      technologies: []
    });
  };

  const applySuggestion = (suggestion) => {
    if (suggestion.type === 'technology') {
      handleFilterChange('technologies', suggestion.value, true);
    } else if (suggestion.type === 'location') {
      handleFilterChange('location', suggestion.value, true);
    } else if (suggestion.type === 'category') {
      handleFilterChange('category', suggestion.value, true);
    }
    
    setSearchQuery('');
    setSuggestions([]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'technologies' && Array.isArray(value) && value.length > 0) {
        count += value.length;
      } else if (value && value !== 'all' && !Array.isArray(value)) {
        count++;
      }
    });
    return count;
  };

  return (
    <div className="search-filter-container">
      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={`Search ${eventType === 'all' ? 'events' : eventType + 's'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {loading && <div className="search-spinner"></div>}
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
              }}
            >
              <FiX />
            </button>
          )}
        </div>
        
        {/* Search Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              className="search-suggestions"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  className="suggestion-item"
                  onClick={() => applySuggestion(suggestion)}
                  whileHover={{ backgroundColor: '#f8f9fa' }}
                >
                  <span className="suggestion-icon">{suggestion.icon}</span>
                  <span className="suggestion-text">{suggestion.value}</span>
                  <span className="suggestion-type">{suggestion.type}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Toggle */}
      <div className="filter-controls">
        <motion.button
          className={`filter-toggle ${isFiltersOpen ? 'active' : ''}`}
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiFilter />
          Filters
          {getActiveFiltersCount() > 0 && (
            <span className="filter-badge">{getActiveFiltersCount()}</span>
          )}
        </motion.button>
        
        {getActiveFiltersCount() > 0 && (
          <motion.button
            className="clear-filters"
            onClick={clearFilters}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Clear All
          </motion.button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            className="filter-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filter-grid">
              {/* Location Filter */}
              <div className="filter-group">
                <h4>
                  <FiMapPin />
                  Location
                </h4>
                <div className="filter-options">
                  {filterOptions.locations.map(location => (
                    <label key={location} className="filter-option">
                      <input
                        type="checkbox"
                        checked={(filters.location || []).includes(location)}
                        onChange={(e) => handleFilterChange('location', location, e.target.checked)}
                      />
                      <span>{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Technology Filter */}
              <div className="filter-group">
                <h4>
                  💻
                  Technologies
                </h4>
                <div className="filter-options">
                  {filterOptions.technologies.map(tech => (
                    <label key={tech} className="filter-option">
                      <input
                        type="checkbox"
                        checked={(filters.technologies || []).includes(tech)}
                        onChange={(e) => handleFilterChange('technologies', tech, e.target.checked)}
                      />
                      <span>{tech}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="filter-group">
                <h4>
                  <FiTrendingUp />
                  Difficulty
                </h4>
                <div className="filter-options radio-options">
                  {filterOptions.difficulties.map(difficulty => (
                    <label key={difficulty} className="filter-option">
                      <input
                        type="radio"
                        name="difficulty"
                        checked={filters.difficulty === difficulty.toLowerCase()}
                        onChange={() => setFilters({ difficulty: difficulty.toLowerCase() })}
                      />
                      <span>{difficulty}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="filter-group">
                <h4>
                  <FiCalendar />
                  Date Range
                </h4>
                <div className="filter-options radio-options">
                  {filterOptions.dateRanges.map(range => (
                    <label key={range.value} className="filter-option">
                      <input
                        type="radio"
                        name="dateRange"
                        checked={filters.dateRange === range.value}
                        onChange={() => setFilters({ dateRange: range.value })}
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          {loading ? 'Searching...' : `${searchResults.length} results found`}
        </span>
        {searchQuery && (
          <span className="search-query">for "{searchQuery}"</span>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
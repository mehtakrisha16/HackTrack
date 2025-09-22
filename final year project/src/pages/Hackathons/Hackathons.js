import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import EventCard from '../../components/EventCard/EventCard';
import Button from '../../components/Button/Button';
import { hackathons, difficulties, technologies, locations, states } from '../../data/mockData';
import './Hackathons.css';

const Hackathons = () => {
  const { filters, setFilters, searchQuery, setSearchQuery } = useContext(AppContext);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState(hackathons);

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = hackathons;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.technologies.some(tech => 
          tech.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(event => 
        event.difficulty?.toLowerCase() === filters.difficulty
      );
    }

    // Apply location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply state filter
    if (filters.state && filters.state !== 'all') {
      filtered = filtered.filter(event => {
        const location = event.location.toLowerCase();
        const state = filters.state.toLowerCase();
        
        // Map major cities to their states for better filtering
        const cityStateMap = {
          'mumbai': 'maharashtra',
          'pune': 'maharashtra',
          'bangalore': 'karnataka',
          'bengaluru': 'karnataka',
          'chennai': 'tamil nadu',
          'delhi': 'delhi ncr',
          'gurgaon': 'delhi ncr',
          'noida': 'delhi ncr',
          'hyderabad': 'telangana',
          'kolkata': 'west bengal',
          'ahmedabad': 'gujarat',
          'jaipur': 'rajasthan',
          'kochi': 'kerala',
          'chandigarh': 'punjab'
        };
        
        // Check if location contains state name or city belongs to state
        return location.includes(state) || 
               Object.entries(cityStateMap).some(([city, cityState]) => 
                 location.includes(city) && cityState === state
               );
      });
    }

    // Apply date filter
    if (filters.dateRange !== 'all') {
      const today = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startDate);
        const daysDiff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'this-week':
            return daysDiff <= 7 && daysDiff >= 0;
          case 'this-month':
            return daysDiff <= 30 && daysDiff >= 0;
          case 'this-quarter':
            return daysDiff <= 90 && daysDiff >= 0;
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
  }, [searchQuery, filters]);

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      difficulty: 'all',
      location: 'all',
      state: 'all',
      dateRange: 'all'
    });
    setSearchQuery('');
  };

  return (
    <div className="hackathons">
      <div className="container">
        {/* Hero Section */}
        <section 
          className="hackathons-hero"
          style={{
            backgroundImage: `url('${process.env.PUBLIC_URL}/images/hackathons-header.svg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="hero-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1>Mumbai Hackathons</h1>
              <p>Discover coding competitions, innovation challenges, and tech events across Mumbai's thriving startup ecosystem</p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">{hackathons.length}</span>
                  <span className="stat-label">Active Hackathons</span>
                </div>
                <div className="stat">
                  <span className="stat-number">₹50L+</span>
                  <span className="stat-label">Total Prize Money</span>
                </div>
                <div className="stat">
                  <span className="stat-number">200+</span>
                  <span className="stat-label">Mumbai Teams</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        {/* Header */}
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Hackathons</h1>
          <p>Discover and participate in exciting coding competitions worldwide</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="search-filters"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Search Bar */}
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search hackathons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            icon={<FiFilter />}
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'active' : ''}
          >
            Filters
          </Button>

          {/* View Mode Toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FiList />
            </button>
          </div>
        </motion.div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div 
            className="filter-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="filter-group">
              <label>Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="all">All Levels</option>
                {Object.entries(difficulties).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Location</label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                <option value="all">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location.toLowerCase()}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>State/Region</label>
              <select
                value={filters.state || 'all'}
                onChange={(e) => handleFilterChange('state', e.target.value)}
              >
                <option value="all">All States</option>
                {states.map((state) => (
                  <option key={state} value={state.toLowerCase()}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="this-quarter">Next 3 Months</option>
              </select>
            </div>

            <Button variant="ghost" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </motion.div>
        )}

        {/* Results Count */}
        <motion.div 
          className="results-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span>{filteredEvents.length} hackathons found</span>
        </motion.div>

        {/* Events Grid/List */}
        <motion.div 
          className={`events-container ${viewMode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {filteredEvents.length === 0 ? (
            <div className="no-results">
              <h3>No hackathons found</h3>
              <p>Try adjusting your filters or search terms</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <EventCard event={event} variant={viewMode} />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Hackathons;
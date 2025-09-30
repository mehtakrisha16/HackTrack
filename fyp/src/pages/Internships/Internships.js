import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import EventCard from '../../components/EventCard/EventCard';
import Button from '../../components/Button/Button';
import { internships, difficulties, technologies, locations, states } from '../../data/mockData';
import './Internships.css';

const Internships = () => {
  const { filters, setFilters, searchQuery, setSearchQuery } = useContext(AppContext);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState(internships);

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = internships;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.company && event.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.technologies && event.technologies.some(tech => 
          tech.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    // Apply filters similar to hackathons
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(event => 
        event.difficulty?.toLowerCase() === filters.difficulty
      );
    }

    if (filters.location !== 'all') {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.state && filters.state !== 'all') {
      filtered = filtered.filter(event => {
        const location = event.location.toLowerCase();
        const state = filters.state.toLowerCase();
        
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
        
        return location.includes(state) || 
               Object.entries(cityStateMap).some(([city, cityState]) => 
                 location.includes(city) && cityState === state
               );
      });
    }

    setFilteredEvents(filtered);
  }, [searchQuery, filters]);

  return (
    <div className="internships">
      <div className="container">
        {/* Hero Section */}
        <section 
          className="internships-hero"
          style={{
            backgroundImage: `url('${process.env.PUBLIC_URL}/images/internships-header.svg')`,
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
              <h1>Mumbai Internships</h1>
              <p>Launch your career with internships at India's leading companies in Mumbai's financial and tech capital</p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">{internships.length}</span>
                  <span className="stat-label">Active Positions</span>
                </div>
                <div className="stat">
                  <span className="stat-number">₹30K+</span>
                  <span className="stat-label">Average Stipend</span>
                </div>
                <div className="stat">
                  <span className="stat-number">85%</span>
                  <span className="stat-label">PPO Conversion</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search and Filters */}
        <div className="search-filters">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search internships, companies, technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <button
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter size={16} />
              Filters
            </button>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid size={16} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div 
            className="filter-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="filter-group">
              <label>Experience Level</label>
              <select
                value={filters.difficulty || 'all'}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
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
                value={filters.location || 'all'}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
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
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              >
                <option value="all">All States</option>
                {states.map((state) => (
                  <option key={state} value={state.toLowerCase()}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setFilters({ difficulty: 'all', location: 'all', state: 'all' })}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Results */}
        <div className="results-header">
          <h2>Available Internships ({filteredEvents.length})</h2>
        </div>

        <motion.div 
          className={`events-grid ${viewMode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {filteredEvents.map((internship, index) => (
            <motion.div
              key={internship.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <EventCard event={internship} variant={viewMode} />
            </motion.div>
          ))}
        </motion.div>

        {filteredEvents.length === 0 && (
          <motion.div 
            className="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>No internships found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Internships;
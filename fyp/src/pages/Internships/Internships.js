import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import EventCard from '../../components/EventCard/EventCard';
import Button from '../../components/Button/Button';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { internships, difficulties, technologies, locations, states } from '../../data/mockData';
import './Internships.css';

const Internships = () => {
  const { filters, setFilters, searchQuery, setSearchQuery } = useContext(AppContext);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(true); // Show filters by default
  const [filteredEvents, setFilteredEvents] = useState(internships);
  const [activeFilters, setActiveFilters] = useState({
    locations: [],
    deadlines: [],
    difficulties: [],
    prizeRange: [], // Will be used for stipend ranges
    mode: []
  });

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

    // Apply location filters
    if (activeFilters.locations.length > 0) {
      filtered = filtered.filter(event => {
        const eventCity = typeof event.location === 'string' 
          ? event.location 
          : event.location?.city || '';
        return activeFilters.locations.some(loc => 
          eventCity.toLowerCase().includes(loc.toLowerCase())
        );
      });
    }

    // Apply deadline filters
    if (activeFilters.deadlines.length > 0) {
      const today = new Date();
      filtered = filtered.filter(event => {
        const deadline = new Date(event.deadline);
        const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        
        return activeFilters.deadlines.some(range => {
          switch(range) {
            case 'Today':
              return daysLeft === 0;
            case 'This Week':
              return daysLeft >= 0 && daysLeft <= 7;
            case 'This Month':
              return daysLeft >= 0 && daysLeft <= 30;
            case 'Next 3 Months':
              return daysLeft >= 0 && daysLeft <= 90;
            default:
              return true;
          }
        });
      });
    }

    // Apply difficulty filters
    if (activeFilters.difficulties.length > 0) {
      filtered = filtered.filter(event =>
        activeFilters.difficulties.some(diff =>
          event.difficulty?.toLowerCase() === diff.toLowerCase()
        )
      );
    }

    // Apply stipend range filters (using prizeRange state)
    if (activeFilters.prizeRange.length > 0) {
      filtered = filtered.filter(event => {
        const stipend = event.salary || 0;
        const stipendNum = typeof stipend === 'string' 
          ? parseInt(stipend.replace(/[^0-9]/g, '')) 
          : stipend;
        
        return activeFilters.prizeRange.some(range => {
          switch(range) {
            case 'Under ₹50K':
              return stipendNum < 50000;
            case '₹50K - ₹1L':
              return stipendNum >= 50000 && stipendNum < 100000;
            case '₹1L - ₹5L':
              return stipendNum >= 100000 && stipendNum < 500000;
            case 'Above ₹5L':
              return stipendNum >= 500000;
            default:
              return true;
          }
        });
      });
    }

    // Apply mode filters
    if (activeFilters.mode.length > 0) {
      filtered = filtered.filter(event => {
        const eventMode = typeof event.location === 'string' 
          ? 'In-person' 
          : event.location?.mode || 'In-person';
        return activeFilters.mode.some(mode =>
          eventMode.toLowerCase().includes(mode.toLowerCase())
        );
      });
    }

    setFilteredEvents(filtered);
  }, [searchQuery, activeFilters]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({
      locations: [],
      deadlines: [],
      difficulties: [],
      prizeRange: [],
      mode: []
    });
    setSearchQuery('');
  };

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
              <h1>Internships</h1>
              <p>Launch your career with internships at India's leading companies across major tech hubs</p>
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

        {/* Content Layout with Sidebar */}
        <div className="content-layout">
          {/* Sidebar with Filter Panel */}
          {showFilters && (
            <motion.aside 
              className="filters-sidebar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FilterPanel 
                filters={activeFilters}
                onFilterChange={handleFilterChange}
              />
            </motion.aside>
          )}

          {/* Main Content */}
          <div className="main-content">
            {/* Results Count */}
            <motion.div 
              className="results-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span>{filteredEvents.length} internships found</span>
              {(activeFilters.locations.length > 0 || 
                activeFilters.deadlines.length > 0 || 
                activeFilters.difficulties.length > 0 || 
                activeFilters.prizeRange.length > 0 || 
                activeFilters.mode.length > 0) && (
                <Button variant="ghost" size="small" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </motion.div>

            {/* Events Grid */}
            <motion.div 
              className={`events-grid ${viewMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {filteredEvents.length === 0 ? (
                <div className="no-results">
                  <h3>No internships found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                filteredEvents.map((internship, index) => (
                  <motion.div
                    key={internship.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <EventCard event={internship} variant={viewMode} />
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Internships;
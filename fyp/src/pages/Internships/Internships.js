import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import EventCard from '../../components/EventCard/EventCard';
import Button from '../../components/Button/Button';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { internships, difficulties, technologies, locations, states, getOpportunitiesByType } from '../../data/mockData';
import { useOpportunities } from '../../hooks/useOpportunities';
import './Internships.css';

const Internships = () => {
  const { filters, setFilters, searchQuery, setSearchQuery } = useContext(AppContext);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(true); // Show filters by default
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    locations: [],
    deadlines: [],
    difficulties: [],
    prizeRange: [], // Will be used for stipend ranges
    mode: []
  });

  // Fetch real internship data
  const { 
    opportunities: realInternships, 
    loading, 
    error, 
    refresh 
  } = useOpportunities({
    type: 'internship',
    limit: 200
  });

  // Combine real scraped data with static real-world data
  const allInternships = React.useMemo(() => {
    // Get internships from real-world data
    const staticInternships = getOpportunitiesByType('internship').map(internship => ({
      id: internship.id,
      title: internship.title,
      description: internship.description,
      company: internship.company,
      location: internship.location,
      startDate: internship.postedDate,
      duration: '3 months',
      stipend: internship.salary,
      difficulty: internship.experience,
      technologies: internship.skills || [],
      category: internship.category,
      applicationLink: internship.applicationLink,
      deadline: internship.deadline,
      remote: internship.remote || false,
      urgent: internship.urgent || false,
      rating: internship.rating || 4.0,
      benefits: internship.benefits || [],
      requirements: internship.requirements || []
    }));

    // Get internships from scraped API data  
    const scrapedInternships = realInternships.map(internship => ({
      id: internship._id || internship.id,
      title: internship.title,
      description: internship.description || 'Great internship opportunity to gain hands-on experience',
      company: internship.company,
      location: internship.location || 'Remote',
      startDate: internship.postedDate || new Date().toISOString(),
      duration: '3 months',
      stipend: internship.salary || 'Stipend Available',
      difficulty: internship.experience || 'Entry Level',
      technologies: internship.skills || [],
      category: internship.category || 'general',
      applicationLink: internship.applicationLink,
      deadline: internship.deadline || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      remote: internship.remote || false,
      urgent: internship.urgent || false,
      rating: internship.rating || 4.0
    }));

    // Combine static real-world internships with scraped internships, prioritizing static
    const combinedInternships = [...staticInternships, ...scrapedInternships];
    
    // Remove duplicates based on title similarity
    const uniqueInternships = [];
    const seenTitles = new Set();
    
    combinedInternships.forEach(internship => {
      const normalizedTitle = internship.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueInternships.push(internship);
      }
    });

    // Add a few mock internships if we have less than 15 internships
    const finalInternships = uniqueInternships.length < 15 ? [...uniqueInternships, ...internships.slice(0, 15 - uniqueInternships.length)] : uniqueInternships;
    
    return finalInternships;
  }, [realInternships]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      refresh();
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [refresh]);

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = allInternships;

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
  }, [allInternships, searchQuery, activeFilters]);

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
import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiLoader } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import EventCard from '../../components/EventCard/EventCard';
import Button from '../../components/Button/Button';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { events, getOpportunitiesByType } from '../../data/mockData';
import { useOpportunities } from '../../hooks/useOpportunities';
import './Events.css';

const Events = () => {
  const { searchQuery, setSearchQuery } = useContext(AppContext);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [activeFilters, setActiveFilters] = useState({
    locations: [],
    deadlines: [],
    difficulties: [],
    prizeRange: [],
    mode: []
  });

  // Fetch real events data
  const { 
    opportunities: realEvents, 
    loading, 
    error, 
    refresh 
  } = useOpportunities({
    type: 'event',
    limit: 200
  });

  // Combine real scraped data with static real-world data
  const allEvents = React.useMemo(() => {
    // Get events from real-world data
    const staticEvents = getOpportunitiesByType('event').map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      organizer: event.company,
      location: event.location,
      startDate: event.postedDate,
      endDate: event.deadline,
      registrationDeadline: event.deadline,
      prizePool: event.salary,
      difficulty: event.experience,
      technologies: event.skills || [],
      category: event.category,
      url: event.applicationLink,
      sourceUrl: event.sourceUrl,
      remote: event.remote || false,
      urgent: event.urgent || false,
      rating: event.rating || 4.0,
      registrationFee: 0,
      benefits: event.benefits || [],
      requirements: event.requirements || []
    }));

    // Get events from scraped API data  
    const scrapedEvents = realEvents.map(event => ({
      id: event._id || event.id,
      title: event.title,
      description: event.description || 'Join this exciting event opportunity',
      organizer: event.company,
      location: event.location || 'TBD',
      startDate: event.postedDate || new Date().toISOString(),
      endDate: event.deadline || new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      registrationDeadline: event.deadline || new Date(Date.now() + 3*24*60*60*1000).toISOString(),
      prizePool: event.salary || 'TBD',
      difficulty: event.experience === 'Any Level' ? 'Beginner' : event.experience,
      technologies: event.skills || [],
      category: event.category || 'general',
      mode: event.remote ? 'Online' : 'Offline',
      registrationLink: event.applicationLink,
      maxTeamSize: 4,
      minTeamSize: 1,
      participantCount: Math.floor(Math.random() * 500) + 50,
      rating: event.rating || 4.0,
      urgent: event.urgent || false
    }));

    // Combine static real-world events with scraped events, prioritizing static
    const combinedEvents = [...staticEvents, ...scrapedEvents];
    
    // Remove duplicates based on title similarity
    const uniqueEvents = [];
    const seenTitles = new Set();
    
    combinedEvents.forEach(event => {
      const normalizedTitle = event.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueEvents.push(event);
      }
    });

    // Add a few mock events if we have less than 15 events
    const finalEvents = uniqueEvents.length < 15 ? [...uniqueEvents, ...events.slice(0, 15 - uniqueEvents.length)] : uniqueEvents;
    
    return finalEvents;
  }, [realEvents]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      refresh();
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [refresh]);

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = allEvents;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.organizer && event.organizer.toLowerCase().includes(searchQuery.toLowerCase())) ||
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

    // Apply prize range filters (for events with prizes)
    if (activeFilters.prizeRange.length > 0) {
      filtered = filtered.filter(event => {
        const prize = event.prize || 0;
        const prizeNum = typeof prize === 'string' 
          ? parseInt(prize.replace(/[^0-9]/g, '')) 
          : prize;
        
        return activeFilters.prizeRange.some(range => {
          switch(range) {
            case 'Under ₹50K':
              return prizeNum < 50000;
            case '₹50K - ₹1L':
              return prizeNum >= 50000 && prizeNum < 100000;
            case '₹1L - ₹5L':
              return prizeNum >= 100000 && prizeNum < 500000;
            case 'Above ₹5L':
              return prizeNum >= 500000;
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
    <div className="events">
      <div className="container">
        {/* Hero Section */}
        <section 
          className="events-hero"
          style={{
            backgroundImage: `url('${process.env.PUBLIC_URL}/images/events-header.svg')`,
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
              <h1>College Events</h1>
              <p>Discover amazing tech events, conferences, and workshops happening across India</p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">{events.length}</span>
                  <span className="stat-label">Active Events</span>
                </div>
                <div className="stat">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Colleges</span>
                </div>
                <div className="stat">
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">Attendees</span>
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
          <h1>College Events</h1>
          <p>Discover amazing tech events, conferences, and workshops</p>
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
              placeholder="Search events..."
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
              <span>{filteredEvents.length} events found</span>
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
                  <h3>No events found</h3>
                  <p>Try adjusting your search or filter criteria</p>
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
      </div>
    </div>
  );
};

export default Events;
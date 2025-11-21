import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiLoader } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import EventCard from '../../components/EventCard/EventCard';
import Button from '../../components/Button/Button';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { hackathons, difficulties, technologies, locations, states, getOpportunitiesByType } from '../../data/mockData';
import { useOpportunities } from '../../hooks/useOpportunities';
import './Hackathons.css';

const Hackathons = () => {
  const { filters, setFilters, searchQuery, setSearchQuery } = useContext(AppContext);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState(hackathons);
  const [activeFilters, setActiveFilters] = useState({
    locations: [],
    deadlines: [],
    difficulties: [],
    prizeRange: [],
    mode: []
  });

  // Fetch real hackathon data
  const { 
    opportunities: realHackathons, 
    loading, 
    error, 
    refresh 
  } = useOpportunities({
    type: 'hackathon',
    limit: 200
  });

  // Combine real scraped data with static real-world data
  const allHackathons = React.useMemo(() => {
    // Get hackathons from real-world data
    const staticHackathons = getOpportunitiesByType('hackathon').map(hackathon => ({
      id: hackathon.id,
      title: hackathon.title,
      description: hackathon.description,
      organizer: hackathon.company,
      location: typeof hackathon.location === 'string' ? hackathon.location : (hackathon.location?.city || 'Global'),
      startDate: hackathon.postedDate,
      endDate: hackathon.deadline,
      registrationDeadline: hackathon.deadline,
      prizePool: hackathon.salary,
      difficulty: hackathon.experience,
      technologies: hackathon.skills || [],
      category: hackathon.category,
      url: hackathon.applicationLink,
      sourceUrl: hackathon.sourceUrl,
      remote: hackathon.remote || false,
      urgent: hackathon.urgent || false,
      rating: hackathon.rating || 4.0,
      registrationFee: 0,
      benefits: hackathon.benefits || [],
      requirements: hackathon.requirements || [],
      mode: hackathon.remote ? 'Online' : 'Offline',
      maxTeamSize: 4,
      minTeamSize: 1,
      participantCount: Math.floor(Math.random() * 1000) + 100
    }));

    // Get hackathons from scraped API data  
    const scrapedHackathons = realHackathons.map(hackathon => ({
      id: hackathon._id || hackathon.id,
      title: hackathon.title,
      description: hackathon.description || 'Join this exciting hackathon and showcase your skills',
      organizer: hackathon.company,
      location: typeof hackathon.location === 'string' ? hackathon.location : (hackathon.location?.city || 'Global'),
      startDate: hackathon.postedDate || new Date().toISOString(),
      endDate: hackathon.deadline || new Date(Date.now() + 14*24*60*60*1000).toISOString(),
      registrationDeadline: hackathon.deadline || new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      prizePool: hackathon.salary || 'Prizes Available',
      difficulty: hackathon.experience === 'Any Level' ? 'Beginner' : (hackathon.experience || 'Intermediate'),
      technologies: hackathon.skills || [],
      category: hackathon.category || 'general',
      mode: hackathon.remote ? 'Online' : 'Offline',
      // Multiple link fields for Apply Now button
      applicationLink: hackathon.applicationLink || hackathon.registrationLink,
      registrationLink: hackathon.registrationLink || hackathon.applicationLink,
      applyLink: hackathon.applyLink,
      url: hackathon.sourceUrl || hackathon.applicationLink,
      sourceUrl: hackathon.sourceUrl,
      website: hackathon.website,
      maxTeamSize: 4,
      minTeamSize: 1,
      participantCount: Math.floor(Math.random() * 1000) + 100,
      isLive: true,
      themes: hackathon.skills || ['Innovation', 'Technology']
    }));

    // Combine static real-world hackathons with scraped hackathons, prioritizing static
    const combinedHackathons = [...staticHackathons, ...scrapedHackathons];
    
    // Remove duplicates based on title similarity
    const uniqueHackathons = [];
    const seenTitles = new Set();
    
    combinedHackathons.forEach(hackathon => {
      const normalizedTitle = hackathon.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueHackathons.push(hackathon);
      }
    });

    // Add a few mock hackathons if we have less than 15 hackathons
    const finalHackathons = uniqueHackathons.length < 15 ? [...uniqueHackathons, ...hackathons.slice(0, 15 - uniqueHackathons.length)] : uniqueHackathons;
    
    return finalHackathons;
  }, [realHackathons]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      refresh();
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [refresh]);

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = allHackathons;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

    // Apply prize range filters
    if (activeFilters.prizeRange.length > 0) {
      filtered = filtered.filter(event => {
        const prize = event.prize || event.salary || 0;
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
  }, [searchQuery, activeFilters, allHackathons]);

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
              <h1>Hackathons</h1>
              <p>Discover coding competitions, innovation challenges, and tech events across India's thriving startup ecosystem</p>
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
                  <span className="stat-number">5K+</span>
                  <span className="stat-label">Participants</span>
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
              <span>{filteredEvents.length} hackathons found</span>
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
      </div>
    </div>
  );
};

export default Hackathons;
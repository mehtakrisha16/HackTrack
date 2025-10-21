import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiBarChart2, 
  FiGlobe, 
  FiMapPin, 
  FiClock,
  FiUsers,
  FiAward,
  FiBriefcase,
  FiExternalLink,
  FiFilter,
  FiSearch,
  FiStar,
  FiCalendar,
  FiHome,
  FiRefreshCw,
  FiLoader
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useOpportunities } from '../../hooks/useOpportunities';
import { getFintechOpportunities } from '../../data/mockData';
import './FinTechHub.css';

const FinTechHub = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  // Use custom hooks for real data
  const { 
    opportunities, 
    loading, 
    error, 
    refresh 
  } = useOpportunities({
    type: '',
    category: '',
    limit: 200
  });

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      refresh();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [refresh]);

  // Get FinTech opportunities from our real-world data
  const allFintechOpportunities = React.useMemo(() => {
    // Get static FinTech opportunities from our data
    const staticOpportunities = getFintechOpportunities();
    
    // Get FinTech opportunities from scraped data
    const scrapedFintechOpportunities = opportunities.filter(opp => {
      const fintechKeywords = ['fintech', 'payment', 'bank', 'financial', 'razorpay', 'paytm', 'phonepe', 'cred', 'zerodha', 'wallet', 'lending', 'crypto'];
      return fintechKeywords.some(keyword => 
        opp.company?.toLowerCase().includes(keyword) ||
        opp.title?.toLowerCase().includes(keyword) ||
        opp.description?.toLowerCase().includes(keyword) ||
        opp.category?.toLowerCase().includes(keyword)
      );
    });

    // Combine and prioritize static over scraped
    const combinedOpportunities = [...staticOpportunities, ...scrapedFintechOpportunities];
    
    // Remove duplicates
    const uniqueOpportunities = [];
    const seenTitles = new Set();
    
    combinedOpportunities.forEach(opp => {
      const normalizedTitle = opp.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueOpportunities.push(opp);
      }
    });

    return uniqueOpportunities.slice(0, 50);
  }, [opportunities]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Check if opportunity is urgent (deadline within 7 days)
  const isUrgent = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  // Apply filters and search
  const filteredOpportunities = React.useMemo(() => {
    let filtered = allFintechOpportunities;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(opp => opp.type === activeFilter);
    }

    return filtered;
  }, [allFintechOpportunities, searchTerm, activeFilter]);

  const categories = [
    { id: 'all', name: 'All Opportunities', icon: FiGlobe },
    { id: 'job', name: 'Jobs', icon: FiBriefcase },
    { id: 'internship', name: 'Internships', icon: FiUsers },
    { id: 'hackathon', name: 'Hackathons', icon: FiAward }
  ];

  // Handle application click
  const handleApplyClick = (opportunity) => {
    if (opportunity.applicationLink) {
      window.open(opportunity.applicationLink, '_blank');
      toast.success(`Opening application for ${opportunity.title}`);
    } else {
      toast.error('Application link not available');
    }
  };

  // Handle view details
  const handleViewDetails = (opportunity) => {
    setSelectedOpportunity(opportunity);
  };

  if (loading) {
    return (
      <div className="fintech-hub-loading">
        <FiLoader className="animate-spin" size={32} />
        <p>Loading FinTech opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fintech-hub-error">
        <p>Error loading opportunities: {error}</p>
        <button onClick={refresh} className="retry-button">
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="fintech-hub">
      {/* Header */}
      <motion.div 
        className="fintech-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <h1>
            <FiDollarSign className="header-icon" />
            FinTech Hub
          </h1>
          <p>Discover cutting-edge opportunities in Financial Technology</p>
          <div className="stats">
            <div className="stat">
              <span className="stat-number">{filteredOpportunities.length}</span>
              <span className="stat-label">Opportunities</span>
            </div>
            <div className="stat">
              <span className="stat-number">{filteredOpportunities.filter(o => o.type === 'job').length}</span>
              <span className="stat-label">Jobs</span>
            </div>
            <div className="stat">
              <span className="stat-number">{filteredOpportunities.filter(o => o.type === 'internship').length}</span>
              <span className="stat-label">Internships</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        className="search-filters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="category-filters">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                className={`filter-btn ${activeFilter === category.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(category.id)}
              >
                <Icon />
                {category.name}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Opportunities Grid */}
      <motion.div 
        className="opportunities-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredOpportunities.map((opportunity, index) => (
          <motion.div
            key={opportunity.id}
            className="opportunity-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="card-header">
              <div className="company-info">
                <h3>{opportunity.title}</h3>
                <p className="company">{opportunity.company}</p>
              </div>
              <div className="card-badges">
                {isUrgent(opportunity.deadline) && (
                  <span className="badge urgent">Urgent</span>
                )}
                {opportunity.remote && (
                  <span className="badge remote">Remote</span>
                )}
                <span className={`badge type-${opportunity.type}`}>
                  {opportunity.type}
                </span>
              </div>
            </div>

            <div className="card-content">
              <div className="details-row">
                <div className="detail">
                  <FiMapPin size={16} />
                  <span>{opportunity.location}</span>
                </div>
                <div className="detail">
                  <FiDollarSign size={16} />
                  <span>{opportunity.salary}</span>
                </div>
              </div>

              <div className="details-row">
                <div className="detail">
                  <FiCalendar size={16} />
                  <span>Deadline: {formatDate(opportunity.deadline)}</span>
                </div>
                <div className="detail">
                  <FiClock size={16} />
                  <span>Posted: {formatDate(opportunity.postedDate)}</span>
                </div>
              </div>

              <p className="description">{opportunity.description}</p>

              {opportunity.skills && opportunity.skills.length > 0 && (
                <div className="skills">
                  {opportunity.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                  {opportunity.skills.length > 3 && (
                    <span className="skill-tag more">+{opportunity.skills.length - 3} more</span>
                  )}
                </div>
              )}
            </div>

            <div className="card-actions">
              <button 
                className="btn-secondary"
                onClick={() => handleViewDetails(opportunity)}
              >
                View Details
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleApplyClick(opportunity)}
              >
                <FiExternalLink size={16} />
                Apply Now
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredOpportunities.length === 0 && (
        <motion.div 
          className="no-opportunities"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p>No FinTech opportunities found matching your criteria.</p>
          <button onClick={() => { setSearchTerm(''); setActiveFilter('all'); }}>
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedOpportunity(null)}
        >
          <motion.div 
            className="opportunity-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{selectedOpportunity.title}</h2>
                <p className="company">{selectedOpportunity.company}</p>
              </div>
              <button 
                className="close-btn"
                onClick={() => setSelectedOpportunity(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="opportunity-details">
                <div className="detail-section">
                  <h3>Overview</h3>
                  <div className="details-grid">
                    <div className="detail">
                      <FiMapPin />
                      <div>
                        <span className="label">Location</span>
                        <span className="value">{selectedOpportunity.location}</span>
                      </div>
                    </div>
                    <div className="detail">
                      <FiDollarSign />
                      <div>
                        <span className="label">Compensation</span>
                        <span className="value">{selectedOpportunity.salary}</span>
                      </div>
                    </div>
                    <div className="detail">
                      <FiCalendar />
                      <div>
                        <span className="label">Deadline</span>
                        <span className="value">{formatDate(selectedOpportunity.deadline)}</span>
                      </div>
                    </div>
                    <div className="detail">
                      <FiClock />
                      <div>
                        <span className="label">Experience</span>
                        <span className="value">{selectedOpportunity.experience}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Description</h3>
                  <p>{selectedOpportunity.description}</p>
                </div>

                {selectedOpportunity.requirements && selectedOpportunity.requirements.length > 0 && (
                  <div className="detail-section">
                    <h3>Requirements</h3>
                    <ul>
                      {selectedOpportunity.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedOpportunity.benefits && selectedOpportunity.benefits.length > 0 && (
                  <div className="detail-section">
                    <h3>Benefits</h3>
                    <ul>
                      {selectedOpportunity.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedOpportunity.skills && selectedOpportunity.skills.length > 0 && (
                  <div className="detail-section">
                    <h3>Required Skills</h3>
                    <div className="skills">
                      {selectedOpportunity.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-primary"
                onClick={() => handleApplyClick(selectedOpportunity)}
              >
                <FiExternalLink size={16} />
                Apply Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default FinTechHub;
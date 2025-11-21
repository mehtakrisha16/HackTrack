import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiClock, FiBookmark, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AppContext } from '../../context/AppContext';
import Button from '../Button/Button';
import CountdownTimer from '../CountdownTimer/CountdownTimer';
import './EventCard.css';

const EventCard = ({ event, variant = 'default' }) => {
  const { saveEvent, unsaveEvent, isEventSaved, addApplication, user } = useContext(AppContext);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const isSaved = isEventSaved(event.id);

  const handleSaveToggle = (e) => {
    e.stopPropagation();
    if (!user) {
      // Redirect to login or show auth modal
      return;
    }
    
    if (isSaved) {
      unsaveEvent(event.id);
    } else {
      saveEvent(event);
    }
  };

  const handleApply = (e) => {
    e.stopPropagation();
    
    // Priority order for registration/application links
    const link = event.applicationLink || 
                 event.registrationLink || 
                 event.applyLink || 
                 event.registrationUrl ||
                 event.apply_url ||
                 event.website || 
                 event.url ||
                 event.sourceUrl;
    
    if (link) {
      // Open the registration/application page in a new tab
      window.open(link, '_blank', 'noopener,noreferrer');
      
      // Show success toast
      toast.success(`Opening application for ${event.title}`, {
        duration: 3000,
        icon: '🚀',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
          padding: '16px',
        }
      });
      
      // Track application if user is logged in (optional)
      if (user && addApplication) {
        addApplication({
          eventId: event.id || event._id,
          eventTitle: event.title,
          eventType: event.type,
          companyName: event.company || event.organizer || event.organization
        });
      }
    } else {
      // No external link available
      if (!user) {
        // If user isn't logged in, route them to signup so they can create an account and express interest
        toast('Please create an account to apply for this opportunity', {
          icon: 'ℹ️',
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#2563eb',
            color: '#fff',
            padding: '12px'
          }
        });
        navigate('/signup');
      } else {
        // Logged in but no external registration link - show helpful message
        toast.error('Registration link not available. Please check back later or visit the company website.', {
          duration: 4000,
          icon: '⚠️',
          style: {
            borderRadius: '12px',
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
          }
        });
      }
      console.warn('No application link found for event:', event.title);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatCurrency = (amount) => {
    if (amount.includes('₹')) {
      return amount; // Already formatted
    }
    // Convert USD to INR for display (if needed)
    if (amount.includes('$')) {
      const value = parseFloat(amount.replace('$', '').replace(',', ''));
      return `₹${(value * 83).toLocaleString('en-IN')}`; // Approximate conversion
    }
    return amount;
  };

  const getDaysUntilDeadline = (event) => {
    // Priority order: deadline > registrationDeadline > endDate > startDate
    const deadlineDate = event.deadline || event.registrationDeadline || event.endDate || event.startDate;
    
    if (!deadlineDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
    
    const deadline = new Date(deadlineDate);
    if (isNaN(deadline.getTime())) return null; // Invalid date
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEventImage = (event) => {
    // Return company-specific logo if available
    if (event.organizer || event.company) {
      const company = (event.organizer || event.company).toLowerCase();
      if (company.includes('tcs')) return '/images/tcs-logo.svg';
      if (company.includes('reliance') || company.includes('jio')) return '/images/reliance-jio-logo.svg';
      if (company.includes('iit') || company.includes('bombay')) return '/images/iit-bombay-logo.svg';
      if (company.includes('vjti')) return '/images/vjti-logo.svg';
    }
    
    // Return type-specific icon
    switch (event.type?.toLowerCase()) {
      case 'hackathon':
        return '/images/hackathon-icon.svg';
      case 'internship':
        return '/images/internship-icon.svg';
      case 'event':
      case 'workshop':
      case 'conference':
        return '/images/event-icon.svg';
      default:
        return '/images/networking-icon.svg';
    }
  };

  const getVenueImage = (location) => {
    if (!location) return null;
    
    // Handle both string and object location formats
    let loc = '';
    if (typeof location === 'string') {
      loc = location.toLowerCase();
    } else if (typeof location === 'object') {
      // Combine city and venue for matching
      loc = `${location.city || ''} ${location.venue || ''}`.toLowerCase();
    } else {
      return null;
    }
    
    if (loc.includes('bkc') || loc.includes('bandra kurla')) return '/images/bkc-venue.svg';
    if (loc.includes('iit') || loc.includes('powai')) return '/images/iit-campus-venue.svg';
    if (loc.includes('lower parel') || loc.includes('co-work') || loc.includes('workspace')) return '/images/coworking-venue.svg';
    return null;
  };

  const daysLeft = getDaysUntilDeadline(event);
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  const hasDaysLeft = daysLeft !== null;

  return (
    <motion.div 
      className={`event-card ${variant} ${isExpired ? 'expired' : ''}`}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Event Image */}
      <div className="event-image">
        <img 
          src={getEventImage(event)} 
          alt={event.title}
          loading="lazy"
          className="event-main-image"
        />
        {getVenueImage(event.location) && (
          <div className="venue-overlay">
            <img 
              src={getVenueImage(event.location)} 
              alt={`${typeof event.location === 'string' ? event.location : event.location?.city} venue`}
              className="venue-image"
            />
          </div>
        )}
        <div className="event-overlay">
          <button 
            className={`save-btn ${isSaved ? 'saved' : ''}`}
            onClick={handleSaveToggle}
            disabled={!user}
          >
            <FiBookmark size={20} />
          </button>
          {event.featured && (
            <span className="featured-badge">FEATURED</span>
          )}
          {!isExpired && isUrgent && (
            <span className="urgent-badge">URGENT</span>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className="event-content">
        {/* Status Badges Row */}
        <div className="status-badges">
          {/* Event Type Badge */}
          <span className={`status-badge type-badge ${event.type?.toLowerCase()}`}>
            {event.type?.toUpperCase()}
          </span>
          
          {/* Difficulty Badge */}
          {event.difficulty && (
            <span className={`status-badge difficulty-badge ${event.difficulty.toLowerCase()}`}>
              {event.difficulty.toUpperCase()}
            </span>
          )}
          
          {/* Status Badge (Open/Closed) */}
          <span className={`status-badge status-indicator ${isExpired ? 'closed' : 'open'}`}>
            {isExpired ? 'CLOSED' : 'OPEN'}
          </span>
          
          {/* Days Left Badge */}
          {!isExpired && hasDaysLeft && (
            <span className={`status-badge days-badge ${isUrgent ? 'urgent' : 'normal'}`}>
              {daysLeft === 0 ? 'DUE TODAY' : 
               daysLeft === 1 ? '1 DAY LEFT' : 
               `${daysLeft} DAYS LEFT`}
            </span>
          )}
        </div>

        {/* Event Title */}
        <h3 className="event-title">{event.title}</h3>

        {/* Event Description */}
        <p className="event-description">{event.description}</p>

        {/* Event Details */}
        <div className="event-details">
          {event.organizer && (
            <div className="detail-item">
              <FiUsers size={16} />
              <span>{event.organizer}</span>
            </div>
          )}
          
          <div className="detail-item">
            <FiMapPin size={16} />
            <span>
              {typeof event.location === 'string' 
                ? event.location 
                : `${event.location?.city || ''}, ${event.location?.mode || 'In-person'}`}
            </span>
          </div>
          
          <div className="detail-item">
            <FiCalendar size={16} />
            <span>
              {event.startDate && event.endDate ? 
                `${formatDate(event.startDate)} - ${formatDate(event.endDate)}` :
                formatDate(event.startDate || event.postedDate)
              }
            </span>
          </div>

          <div className="detail-item">
            <FiClock size={16} />
            <span>Deadline: {formatDate(event.deadline || event.registrationDeadline)}</span>
          </div>

          {(event.prize || event.salary || event.stipend) && (
            <div className="detail-item">
              <FiDollarSign size={16} />
              <span>{formatCurrency(event.prize || event.salary || event.stipend)}</span>
            </div>
          )}
        </div>

        {/* Countdown Timer with Days Remaining */}
        {!isExpired && hasDaysLeft && (
          <div className="deadline-countdown">
            <div className="countdown-header">
              <FiClock size={18} />
              <span className="countdown-label">Time Remaining</span>
            </div>
            <div className="countdown-display">
              <div className="countdown-item">
                <span className="countdown-value">{daysLeft}</span>
                <span className="countdown-unit">Days</span>
              </div>
              <CountdownTimer 
                deadline={event.deadline || event.registrationDeadline || event.endDate || event.startDate} 
                compact={true} 
              />
            </div>
            {isUrgent && (
              <div className="urgency-message">
                <span className="pulse-dot"></span>
                <span>Hurry! Deadline approaching soon</span>
              </div>
            )}
          </div>
        )}

        {isExpired && (
          <div className="deadline-info expired">
            <FiClock size={16} />
            <span>Applications Closed</span>
          </div>
        )}

        {/* Action Buttons - Enhanced */}
        <div className="event-actions">
          {!isExpired && (
            <button 
              className="action-btn apply-btn"
              onClick={handleApply}
              title="Apply to this opportunity"
            >
              <span className="btn-content">
                <FiExternalLink size={18} />
                <span className="btn-text">Apply Now</span>
              </span>
              {isUrgent && <span className="btn-badge">Urgent</span>}
            </button>
          )}
          
          <button 
            className="action-btn details-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            title="View opportunity details"
          >
            <span className="btn-content">
              <FiExternalLink size={18} />
              <span className="btn-text">View Details</span>
            </span>
          </button>
        </div>

        {/* Skills/Technologies */}
        {event.technologies && event.technologies.length > 0 && (
          <div className="event-technologies">
            {event.technologies.slice(0, 3).map((tech, index) => (
              <span key={index} className="tech-tag">{tech}</span>
            ))}
            {event.technologies.length > 3 && (
              <span className="tech-more">+{event.technologies.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && (
        <motion.div 
          className="event-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowModal(false)}
        >
          <motion.div 
            className="event-modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>{event.title}</h2>
                <div className="modal-badges">
                  <span className={`modal-badge type-${event.type?.toLowerCase()}`}>
                    {event.type?.toUpperCase()}
                  </span>
                  {event.difficulty && (
                    <span className={`modal-badge difficulty-${event.difficulty.toLowerCase()}`}>
                      {event.difficulty}
                    </span>
                  )}
                  {isUrgent && <span className="modal-badge urgent-badge">URGENT</span>}
                </div>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Company/Organizer Info */}
              {(event.company || event.organizer) && (
                <div className="modal-section">
                  <h3 className="modal-section-title">
                    <FiUsers size={18} />
                    {event.type === 'internship' || event.type === 'job' ? 'Company' : 'Organizer'}
                  </h3>
                  <p className="modal-section-content">{event.company || event.organizer}</p>
                </div>
              )}

              {/* Description */}
              <div className="modal-section">
                <h3 className="modal-section-title">About</h3>
                <p className="modal-section-content">{event.description}</p>
              </div>

              {/* Location & Date Info */}
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <div className="modal-info-icon">
                    <FiMapPin size={20} />
                  </div>
                  <div className="modal-info-content">
                    <span className="modal-info-label">Location</span>
                    <span className="modal-info-value">
                      {typeof event.location === 'string' 
                        ? event.location 
                        : `${event.location?.city || 'Remote'}, ${event.location?.mode || 'In-person'}`}
                    </span>
                  </div>
                </div>

                {event.startDate && (
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiCalendar size={20} />
                    </div>
                    <div className="modal-info-content">
                      <span className="modal-info-label">
                        {event.endDate ? 'Duration' : 'Start Date'}
                      </span>
                      <span className="modal-info-value">
                        {event.endDate 
                          ? `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`
                          : formatDate(event.startDate)
                        }
                      </span>
                    </div>
                  </div>
                )}

                {(event.deadline || event.registrationDeadline) && (
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiClock size={20} />
                    </div>
                    <div className="modal-info-content">
                      <span className="modal-info-label">Deadline</span>
                      <span className="modal-info-value">
                        {formatDate(event.deadline || event.registrationDeadline)}
                      </span>
                    </div>
                  </div>
                )}

                {(event.prize || event.salary || event.stipend) && (
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiDollarSign size={20} />
                    </div>
                    <div className="modal-info-content">
                      <span className="modal-info-label">
                        {event.prize ? 'Prize' : 'Compensation'}
                      </span>
                      <span className="modal-info-value">
                        {formatCurrency(event.prize || event.salary || event.stipend)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Technologies/Skills */}
              {event.technologies && event.technologies.length > 0 && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Technologies & Skills</h3>
                  <div className="modal-tech-tags">
                    {event.technologies.map((tech, index) => (
                      <span key={index} className="modal-tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {event.requirements && event.requirements.length > 0 && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Requirements</h3>
                  <ul className="modal-requirements-list">
                    {event.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {event.benefits && event.benefits.length > 0 && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Benefits</h3>
                  <ul className="modal-benefits-list">
                    {event.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Details */}
              {(event.experience || event.duration || event.registrationFee) && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Additional Information</h3>
                  <div className="modal-additional-info">
                    {event.experience && (
                      <p><strong>Experience Level:</strong> {event.experience}</p>
                    )}
                    {event.duration && (
                      <p><strong>Duration:</strong> {event.duration}</p>
                    )}
                    {event.registrationFee !== undefined && (
                      <p><strong>Registration Fee:</strong> {event.registrationFee === 0 ? 'Free' : formatCurrency(event.registrationFee.toString())}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button 
                className="modal-btn modal-btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              {!isExpired && (
                <button 
                  className="modal-btn modal-btn-primary"
                  onClick={(e) => {
                    handleApply(e);
                    setShowModal(false);
                  }}
                >
                  <FiExternalLink size={18} />
                  Apply Now
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EventCard;
import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiClock, FiBookmark, FiExternalLink } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import Button from '../Button/Button';
import './EventCard.css';

const EventCard = ({ event, variant = 'default' }) => {
  const { saveEvent, unsaveEvent, isEventSaved, addApplication, user } = useContext(AppContext);
  const [isHovered, setIsHovered] = useState(false);
  
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
    if (!user) {
      // Redirect to login or show auth modal
      return;
    }
    
    addApplication({
      eventId: event.id,
      eventTitle: event.title,
      eventType: event.type,
      companyName: event.company || event.organizer
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
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

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
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
    const loc = location.toLowerCase();
    if (loc.includes('bkc') || loc.includes('bandra kurla')) return '/images/bkc-venue.svg';
    if (loc.includes('iit') || loc.includes('powai')) return '/images/iit-campus-venue.svg';
    if (loc.includes('lower parel') || loc.includes('co-work') || loc.includes('workspace')) return '/images/coworking-venue.svg';
    return null;
  };

  const daysLeft = getDaysUntilDeadline(event.deadline);
  const isExpired = daysLeft < 0;
  const isUrgent = daysLeft <= 7 && daysLeft > 0;

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
              alt={`${event.location} venue`}
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
            <span className="featured-badge">Featured</span>
          )}
          {!isExpired && isUrgent && (
            <span className="urgent-badge">Urgent</span>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className="event-content">
        {/* Event Type & Difficulty */}
        <div className="event-meta">
          <span className={`event-type ${event.type}`}>{event.type}</span>
          {event.difficulty && (
            <span className={`difficulty ${event.difficulty.toLowerCase()}`}>
              {event.difficulty}
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
            <span>{event.location}</span>
          </div>
          
          <div className="detail-item">
            <FiCalendar size={16} />
            <span>{formatDate(event.startDate)}</span>
          </div>

          {(event.prize || event.salary) && (
            <div className="detail-item">
              <FiDollarSign size={16} />
              <span>{formatCurrency(event.prize || event.salary)}</span>
            </div>
          )}
        </div>

        {/* Deadline Warning */}
        {!isExpired && (
          <div className={`deadline-info ${isUrgent ? 'urgent' : ''}`}>
            <FiClock size={16} />
            <span>
              {daysLeft === 0 ? 'Due today' : 
               daysLeft === 1 ? '1 day left' : 
               `${daysLeft} days left`}
            </span>
          </div>
        )}

        {isExpired && (
          <div className="deadline-info expired">
            <span>Application closed</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="event-actions">
          {!isExpired && (
            <Button 
              onClick={handleApply}
              disabled={!user}
              fullWidth
            >
              Apply Now
            </Button>
          )}
          
          <Button 
            variant="outline" 
            icon={<FiExternalLink size={16} />}
            onClick={() => window.open(event.url, '_blank')}
          >
            View Details
          </Button>
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
    </motion.div>
  );
};

export default EventCard;
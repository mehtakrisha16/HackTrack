import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCalendar, 
  FiMapPin, 
  FiAward, 
  FiBriefcase, 
  FiCode, 
  FiUsers,
  FiTrendingUp,
  FiStar,
  FiPlay,
  FiTarget
} from 'react-icons/fi';
import './CareerTimeline.css';

const CareerTimeline = ({ user = {} }) => {
  const [filter, setFilter] = useState('all');

  // Generate timeline events based on user data
  const generateTimelineEvents = () => {
    const events = [];

    // Profile creation
    if (user.createdAt) {
      events.push({
        id: 'profile-created',
        type: 'milestone',
        title: 'Joined HackTrack',
        description: 'Created profile and started the journey',
        date: new Date(user.createdAt),
        icon: FiUsers,
        color: '#4f46e5'
      });
    }

    // First login streak
    if (user.loginStreak >= 7) {
      events.push({
        id: 'first-streak',
        type: 'achievement',
        title: '7-Day Login Streak',
        description: 'Maintained consistent platform engagement',
        date: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)), // 7 days ago
        icon: FiTrendingUp,
        color: '#059669'
      });
    }

    // Profile completion
    if (user.name && user.email && user.phone) {
      events.push({
        id: 'profile-completed',
        type: 'milestone',
        title: 'Profile Completed',
        description: 'Added all essential profile information',
        date: new Date(Date.now() - (10 * 24 * 60 * 60 * 1000)), // 10 days ago
        icon: FiStar,
        color: '#7c3aed'
      });
    }

    // First skill added
    if (user.skills && user.skills.length > 0) {
      events.push({
        id: 'skills-added',
        type: 'skill',
        title: 'Added Technical Skills',
        description: `Added ${user.skills.length} technical skills to profile`,
        date: new Date(Date.now() - (8 * 24 * 60 * 60 * 1000)), // 8 days ago
        icon: FiCode,
        color: '#0284c7'
      });
    }

    // Sample hackathon participation
    events.push({
      id: 'hackathon-1',
      type: 'event',
      title: 'Mumbai FinTech Hackathon 2024',
      description: 'Participated in 48-hour fintech innovation challenge',
      date: new Date('2024-09-15'),
      icon: FiCode,
      color: '#dc2626',
      location: 'IIT Bombay, Mumbai'
    });

    // Sample internship application
    events.push({
      id: 'internship-1',
      type: 'application',
      title: 'Applied to TCS Internship',
      description: 'Software Development Intern position',
      date: new Date('2024-10-01'),
      icon: FiBriefcase,
      color: '#ea580c',
      status: 'pending'
    });

    // Sample achievement unlock
    events.push({
      id: 'achievement-1',
      type: 'achievement',
      title: 'Code Starter Badge Unlocked',
      description: 'Completed first coding session milestone',
      date: new Date('2024-10-10'),
      icon: FiAward,
      color: '#7c3aed'
    });

    // Recent activity
    events.push({
      id: 'recent-activity',
      type: 'activity',
      title: 'Profile Updated',
      description: 'Updated bio and social links',
      date: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)), // 2 days ago
      icon: FiTarget,
      color: '#6366f1'
    });

    return events.sort((a, b) => b.date - a.date);
  };

  const timelineEvents = generateTimelineEvents();

  const filteredEvents = filter === 'all' 
    ? timelineEvents 
    : timelineEvents.filter(event => event.type === filter);

  const eventTypes = [
    { key: 'all', label: 'All Events', count: timelineEvents.length },
    { key: 'achievement', label: 'Achievements', count: timelineEvents.filter(e => e.type === 'achievement').length },
    { key: 'event', label: 'Events', count: timelineEvents.filter(e => e.type === 'event').length },
    { key: 'application', label: 'Applications', count: timelineEvents.filter(e => e.type === 'application').length },
    { key: 'milestone', label: 'Milestones', count: timelineEvents.filter(e => e.type === 'milestone').length }
  ];

  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="career-timeline">
      {/* Timeline Header */}
      <motion.div 
        className="timeline-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3>
          <FiCalendar className="header-icon" />
          Career Timeline
        </h3>
        <p>Track your journey, milestones, and achievements on HackTrack</p>
      </motion.div>

      {/* Timeline Filters */}
      <motion.div 
        className="timeline-filters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {eventTypes.map((type) => (
          <button
            key={type.key}
            className={`filter-btn ${filter === type.key ? 'active' : ''}`}
            onClick={() => setFilter(type.key)}
          >
            {type.label}
            <span className="count">{type.count}</span>
          </button>
        ))}
      </motion.div>

      {/* Timeline Events */}
      <motion.div 
        className="timeline-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              className={`timeline-event event-${event.type}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="event-marker">
                <div 
                  className="event-icon"
                  style={{ backgroundColor: event.color }}
                >
                  <event.icon size={16} />
                </div>
                <div className="event-line"></div>
              </div>

              <div className="event-content">
                <div className="event-header">
                  <h4 className="event-title">{event.title}</h4>
                  <span className="event-date">{formatDate(event.date)}</span>
                </div>

                <p className="event-description">{event.description}</p>

                {event.location && (
                  <div className="event-location">
                    <FiMapPin size={14} />
                    <span>{typeof event.location === 'string' ? event.location : (event.location?.city || 'TBD')}</span>
                  </div>
                )}

                {event.status && (
                  <div className={`event-status status-${event.status}`}>
                    <span>{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</span>
                  </div>
                )}

                <div className={`event-type-badge type-${event.type}`}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="no-events"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FiCalendar className="no-events-icon" />
            <h4>No events found</h4>
            <p>Start participating in hackathons and events to build your timeline!</p>
          </motion.div>
        )}
      </motion.div>

      {/* Timeline Stats */}
      <motion.div 
        className="timeline-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="stat-card">
          <FiAward className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{timelineEvents.filter(e => e.type === 'achievement').length}</span>
            <span className="stat-label">Achievements</span>
          </div>
        </div>

        <div className="stat-card">
          <FiCode className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{timelineEvents.filter(e => e.type === 'event').length}</span>
            <span className="stat-label">Events</span>
          </div>
        </div>

        <div className="stat-card">
          <FiBriefcase className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{timelineEvents.filter(e => e.type === 'application').length}</span>
            <span className="stat-label">Applications</span>
          </div>
        </div>

        <div className="stat-card">
          <FiTrendingUp className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{timelineEvents.filter(e => e.type === 'milestone').length}</span>
            <span className="stat-label">Milestones</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CareerTimeline;
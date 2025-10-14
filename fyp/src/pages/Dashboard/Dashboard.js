import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiBell, FiBookmark, FiTrendingUp, FiUsers, FiAward, FiRefreshCw, FiStar } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import EventCard from '../../components/EventCard/EventCard';
import { userStats } from '../../data/mockData';
import dataService from '../../utils/dataService';
import recommendationEngine from '../../utils/recommendationEngine';
import './Dashboard.css';

const Dashboard = () => {
  const { user, savedEvents, applications, notifications } = useContext(AppContext);
  const [recommendations, setRecommendations] = useState([]);
  const [userStatistics, setUserStatistics] = useState(userStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load personalized recommendations
      const personalizedRecs = await recommendationEngine.getPersonalizedRecommendations('all', 6);
      setRecommendations(personalizedRecs.recommendations || []);
      
      // Load user statistics
      try {
        const stats = await dataService.getUserStats();
        setUserStatistics(stats.data || userStats);
      } catch (error) {
        console.log('Using fallback stats');
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    dataService.clearCache(); // Clear cache for fresh data
    await loadDashboardData();
    setRefreshing(false);
  };

  const stats = [
    { icon: FiCalendar, label: 'Events Applied', value: applications.length, color: 'primary' },
    { icon: FiBookmark, label: 'Saved Events', value: savedEvents.length, color: 'secondary' },
    { icon: FiBell, label: 'Notifications', value: notifications.filter(n => !n.read).length, color: 'warning' }
  ];

  if (!user) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="auth-required">
            <h2>Please log in to view your dashboard</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <motion.div 
          className="dashboard-header"
          style={{
            backgroundImage: `url('${process.env.PUBLIC_URL}/images/dashboard-bg.svg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
          <p>Track your applications in Mumbai's thriving tech ecosystem</p>
          
          <div className="mumbai-insights">
            <div className="insight">
              <span className="insight-number">₹50L+</span>
              <span className="insight-label">Total Prizes Available</span>
            </div>
            <div className="insight">
              <span className="insight-number">200+</span>
              <span className="insight-label">Mumbai Companies</span>
            </div>
            <div className="insight">
              <span className="insight-number">5000+</span>
              <span className="insight-label">Active Opportunities</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="stats-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className={`stat-card ${stat.color}`}
                whileHover={{ y: -5 }}
              >
                <div className="stat-icon">
                  <Icon size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="dashboard-content">
          {/* Personalized Recommendations */}
          <motion.section 
            className="dashboard-section recommendations-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="section-header">
              <h2>
                <FiStar className="section-icon" />
                Recommended for You
              </h2>
              <button 
                className="refresh-btn" 
                onClick={refreshDashboard} 
                disabled={refreshing}
              >
                <FiRefreshCw className={refreshing ? 'spinning' : ''} />
                Refresh
              </button>
            </div>
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading personalized recommendations...</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="empty-state">
                <FiTrendingUp size={48} />
                <h3>No recommendations available</h3>
                <p>Complete your profile to get personalized recommendations!</p>
              </div>
            ) : (
              <div className="events-grid">
                {recommendations.map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <EventCard 
                      event={event} 
                      showRecommendationScore={true}
                      onView={() => recommendationEngine.trackInteraction(event.id, 'view')}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Saved Events */}
          <motion.section 
            className="dashboard-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="section-header">
              <h2>Saved Events</h2>
              <span className="section-count">{savedEvents.length}</span>
            </div>
            {savedEvents.length === 0 ? (
              <div className="empty-state">
                <FiBookmark size={48} />
                <h3>No saved events yet</h3>
                <p>Start exploring and save events you're interested in!</p>
              </div>
            ) : (
              <div className="events-grid">
                {savedEvents.slice(0, 6).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </motion.section>

          {/* Recent Applications */}
          <motion.section 
            className="dashboard-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="section-header">
              <h2>Recent Applications</h2>
              <span className="section-count">{applications.length}</span>
            </div>
            {applications.length === 0 ? (
              <div className="empty-state">
                <FiCalendar size={48} />
                <h3>No applications yet</h3>
                <p>Apply to events to track your progress here!</p>
              </div>
            ) : (
              <div className="applications-list">
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="application-item">
                    <div className="application-info">
                      <h4>{application.eventTitle}</h4>
                      <p>{application.companyName}</p>
                      <span className="application-date">
                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={`application-status ${application.status}`}>
                      {application.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Recent Notifications */}
          <motion.section 
            className="dashboard-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="section-header">
              <h2>Recent Notifications</h2>
              <span className="section-count">{notifications.filter(n => !n.read).length}</span>
            </div>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <FiBell size={48} />
                <h3>No notifications</h3>
                <p>We'll notify you about deadlines and updates!</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {!notification.read && <div className="unread-indicator"></div>}
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiCalendar, FiBell, FiUsers, FiTrendingUp, FiAward } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import EventCard from '../../components/EventCard/EventCard';
import { featuredEvents } from '../../data/mockData';
import './Home.css';

const Home = () => {
  const { user } = useContext(AppContext);

  const features = [
    {
      icon: FiSearch,
      title: 'Discover Mumbai Events',
      description: 'Find hackathons, internships, and college events across Mumbai and Maharashtra.',
      customIcon: '/images/event-icon.svg'
    },
    {
      icon: FiCalendar,
      title: 'Track IST Deadlines',
      description: 'Never miss an application deadline with notifications in Indian Standard Time.',
      customIcon: '/images/hackathon-icon.svg'
    },
    {
      icon: FiBell,
      title: 'Get Local Alerts',
      description: 'Receive personalized alerts for opportunities in Mumbai and nearby cities.',
      customIcon: '/images/networking-icon.svg'
    },
    {
      icon: FiUsers,
      title: 'Connect with Mumbai Tech',
      description: 'Network with Mumbai\'s tech community, students from IIT Bombay, and local startups.',
      customIcon: '/images/networking-icon.svg'
    },
    {
      icon: FiTrendingUp,
      title: 'Track Your Progress',
      description: 'Monitor applications and growth in India\'s financial and tech capital.',
      customIcon: '/images/internship-icon.svg'
    },
    {
      icon: FiAward,
      title: 'Build Indian Portfolio',
      description: 'Showcase achievements from Indian colleges, startups, and tech competitions.',
      customIcon: '/images/hackathon-icon.svg'
    }
  ];

  const stats = [
    { number: '5,000+', label: 'Mumbai Events' },
    { number: '25,000+', label: 'Indian Students' },
    { number: '200+', label: 'Mumbai Companies' },
    { number: '95%', label: 'Success Rate' }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section 
        className="hero"
        style={{
          backgroundImage: `url('${process.env.PUBLIC_URL}/images/mumbai-skyline-hero.svg'), var(--gradient-primary)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="hero-title">
              Mumbai's Ultimate Hub for 
              <span className="gradient-text"> Tech Opportunities</span>
            </h1>
            <p className="hero-description">
              Discover hackathons, internships, and college events across Mumbai and India. 
              Connect with the financial capital's thriving tech ecosystem and accelerate your career.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard">
                  <Button size="large">Go to Dashboard</Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button size="large">Get Started Free</Button>
                </Link>
              )}
              <Link to="/hackathons">
                <Button variant="outline" size="large">Explore Events</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="stat-item"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Why Choose HackTrack?</h2>
            <p>Everything you need to succeed in the tech world</p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  className="feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="feature-icon">
                    {feature.customIcon ? (
                      <img src={feature.customIcon} alt={feature.title} className="custom-feature-icon" />
                    ) : (
                      <Icon size={24} />
                    )}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="featured-events">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Featured Opportunities</h2>
            <p>Hand-picked events and opportunities for you</p>
          </motion.div>

          <div className="events-grid">
            {featuredEvents.slice(0, 6).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="view-all"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link to="/hackathons">
              <Button variant="outline" size="large">View All Events</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of students and professionals from Mumbai's top colleges and companies</p>
            
            {/* Mumbai Tech Ecosystem Showcase */}
            <div className="mumbai-ecosystem">
              <h3>Trusted by Mumbai's Tech Leaders</h3>
              <div className="company-logos">
                <img src="/images/tcs-logo.svg" alt="TCS" className="company-logo" />
                <img src="/images/reliance-jio-logo.svg" alt="Reliance Jio" className="company-logo" />
                <img src="/images/iit-bombay-logo.svg" alt="IIT Bombay" className="company-logo" />
                <img src="/images/vjti-logo.svg" alt="VJTI Mumbai" className="company-logo" />
              </div>
              
              <h3>Popular Mumbai Tech Venues</h3>
              <div className="venue-showcase">
                <div className="venue-card">
                  <img src="/images/bkc-venue.svg" alt="BKC Business District" className="venue-image" />
                  <span>BKC Business Hub</span>
                </div>
                <div className="venue-card">
                  <img src="/images/iit-campus-venue.svg" alt="IIT Bombay Campus" className="venue-image" />
                  <span>IIT Bombay</span>
                </div>
                <div className="venue-card">
                  <img src="/images/coworking-venue.svg" alt="Mumbai Co-working Spaces" className="venue-image" />
                  <span>Tech Co-working Hubs</span>
                </div>
              </div>
            </div>
            
            <div className="cta-actions">
              {!user && (
                <>
                  <Link to="/signup">
                    <Button size="large">Create Free Account</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="ghost" size="large">Sign In</Button>
                  </Link>
                </>
              )}
              {user && (
                <Link to="/dashboard">
                  <Button size="large">Go to Dashboard</Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
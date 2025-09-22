import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiBell } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import Button from '../Button/Button';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, notifications } = useContext(AppContext);

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Hackathons', path: '/hackathons' },
    { name: 'Internships', path: '/internships' },
    { name: 'College Events', path: '/events' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <img 
              src="/images/hacktrack-logo.svg" 
              alt="HackTrack Mumbai" 
              className="logo-image"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="user-actions">
            {user ? (
              <>
                {/* Notifications */}
                <button className="notification-btn">
                  <FiBell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="notification-badge">{unreadNotifications}</span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="profile-dropdown">
                  <button 
                    className="profile-btn"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <img 
                      src={user.avatar || '/default-avatar.png'} 
                      alt={user.name}
                      className="profile-avatar"
                    />
                  </button>

                  {isProfileOpen && (
                    <motion.div 
                      className="dropdown-menu"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Link to="/profile" className="dropdown-item">
                        <FiUser size={16} />
                        Profile
                      </Link>
                      <button onClick={handleLogout} className="dropdown-item">
                        <FiLogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav 
            className="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {!user && (
              <div className="mobile-auth">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" fullWidth>Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" fullWidth>Sign Up</Button>
                </Link>
              </div>
            )}
          </motion.nav>
        )}
      </div>
    </header>
  );
};

export default Header;
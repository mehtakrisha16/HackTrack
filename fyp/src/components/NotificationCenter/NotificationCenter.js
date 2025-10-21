import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiBell, 
  FiVolume2, 
  FiSmartphone,
  FiCalendar,
  FiClock,
  FiBriefcase,
  FiTarget,
  FiAward,
  FiTrendingUp,
  FiSettings,
  FiRefreshCw
} from 'react-icons/fi';
import NotificationService from '../../services/notificationService';
import { toast } from 'react-hot-toast';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notificationService] = useState(new NotificationService());
  const [permission, setPermission] = useState(notificationService.permission);
  const [settings, setSettings] = useState(notificationService.getUserNotificationSettings());
  const [isTestingNotifications, setIsTestingNotifications] = useState(false);

  useEffect(() => {
    // Check current permission status
    setPermission(notificationService.permission);
  }, [notificationService]);

  const handleRequestPermission = async () => {
    try {
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        toast.success('Notifications enabled successfully!');
        // Schedule smart notifications
        notificationService.scheduleSmartNotifications();
      } else if (newPermission === 'denied') {
        toast.error('Notifications were denied. You can enable them in browser settings.');
      }
    } catch (error) {
      toast.error('Failed to request notification permission');
      console.error('Notification permission error:', error);
    }
  };

  const handleSettingChange = (setting, value) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    notificationService.saveNotificationSettings(newSettings);
    
    if (value) {
      toast.success(`${setting.charAt(0).toUpperCase() + setting.slice(1)} notifications enabled`);
    } else {
      toast.success(`${setting.charAt(0).toUpperCase() + setting.slice(1)} notifications disabled`);
    }
  };

  const testNotification = (type) => {
    if (permission !== 'granted') {
      toast.error('Please enable notifications first');
      return;
    }

    setIsTestingNotifications(true);

    const testData = {
      'event-reminder': {
        title: 'Mumbai FinTech Summit 2024',
        location: 'IIT Bombay',
        id: 'test-event'
      },
      'deadline-reminder': {
        title: 'TCS Internship Application',
        timeLeft: 'in 2 hours',
        id: 'test-deadline',
        applicationUrl: '/internships/tcs'
      },
      'application-update': {
        title: 'Google Summer of Code',
        status: 'accepted',
        id: 'test-application'
      },
      'new-opportunity': {
        type: 'Hackathon',
        title: 'Smart India Hackathon 2024',
        company: 'Government of India',
        deadline: 'Nov 30, 2024',
        id: 'test-opportunity'
      },
      'badge-unlocked': {
        title: 'Code Warrior',
        id: 'test-badge'
      },
      'streak-milestone': {
        days: 30
      }
    };

    switch (type) {
      case 'event':
        notificationService.showEventReminder(testData['event-reminder']);
        break;
      case 'deadline':
        notificationService.showDeadlineReminder(testData['deadline-reminder']);
        break;
      case 'application':
        notificationService.showApplicationUpdate(testData['application-update']);
        break;
      case 'opportunity':
        notificationService.showNewOpportunity(testData['new-opportunity']);
        break;
      case 'badge':
        notificationService.showBadgeUnlocked(testData['badge-unlocked']);
        break;
      case 'streak':
        notificationService.showStreakMilestone(testData['streak-milestone']);
        break;
      default:
        notificationService.showNotification(
          '🔔 Test Notification',
          {
            body: 'This is a test notification from HackTrack!',
            tag: 'test-notification'
          }
        );
    }

    setTimeout(() => {
      setIsTestingNotifications(false);
    }, 1000);
  };

  const notificationTypes = [
    {
      key: 'events',
      label: 'Event Reminders',
      description: 'Get notified about upcoming events and hackathons',
      icon: FiCalendar,
      color: '#3b82f6'
    },
    {
      key: 'deadlines',
      label: 'Application Deadlines',
      description: 'Never miss important application deadlines',
      icon: FiClock,
      color: '#ef4444'
    },
    {
      key: 'applications',
      label: 'Application Updates',
      description: 'Status updates for your submitted applications',
      icon: FiBriefcase,
      color: '#059669'
    },
    {
      key: 'opportunities',
      label: 'New Opportunities',
      description: 'Be the first to know about new hackathons and internships',
      icon: FiTarget,
      color: '#7c3aed'
    },
    {
      key: 'badges',
      label: 'Achievement Badges',
      description: 'Celebrate when you unlock new badges',
      icon: FiAward,
      color: '#f59e0b'
    },
    {
      key: 'streaks',
      label: 'Activity Streaks',
      description: 'Stay motivated with streak milestones',
      icon: FiTrendingUp,
      color: '#06b6d4'
    },
    {
      key: 'maintenance',
      label: 'System Updates',
      description: 'Important platform maintenance notifications',
      icon: FiSettings,
      color: '#6b7280'
    },
    {
      key: 'updates',
      label: 'Feature Updates',
      description: 'Learn about new features and improvements',
      icon: FiRefreshCw,
      color: '#84cc16'
    }
  ];

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { status: 'Enabled', color: '#059669', canTest: true };
      case 'denied':
        return { status: 'Blocked', color: '#ef4444', canTest: false };
      case 'default':
        return { status: 'Not Set', color: '#f59e0b', canTest: false };
      default:
        return { status: 'Unknown', color: '#6b7280', canTest: false };
    }
  };

  const permissionInfo = getPermissionStatus();

  return (
    <div className="notification-center">
      {/* Header */}
      <motion.div 
        className="notification-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h3>
            <FiBell className="header-icon" />
            Notification Center
          </h3>
          <p>Manage your notification preferences and stay updated</p>
        </div>
      </motion.div>

      {/* Permission Status */}
      <motion.div 
        className="permission-status"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="permission-card">
          <div className="permission-info">
            <FiBell className="permission-icon" />
            <div className="permission-details">
              <h4>Browser Notifications</h4>
              <p>
                Status: <span style={{ color: permissionInfo.color, fontWeight: 600 }}>
                  {permissionInfo.status}
                </span>
              </p>
            </div>
          </div>
          
          {permission !== 'granted' && (
            <button 
              className="enable-notifications-btn"
              onClick={handleRequestPermission}
            >
              Enable Notifications
            </button>
          )}
          
          {permission === 'granted' && (
            <button 
              className="test-notifications-btn"
              onClick={() => testNotification('general')}
              disabled={isTestingNotifications}
            >
              {isTestingNotifications ? 'Testing...' : 'Test Notification'}
            </button>
          )}
        </div>

        {!notificationService.isNotificationSupported() && (
          <div className="unsupported-notice">
            <p>⚠️ Notifications are not supported in this browser</p>
          </div>
        )}
      </motion.div>

      {/* Notification Types */}
      <motion.div 
        className="notification-types"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h4>Notification Types</h4>
        <div className="types-grid">
          {notificationTypes.map((type, index) => (
            <motion.div
              key={type.key}
              className="type-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div className="type-header">
                <div className="type-info">
                  <div 
                    className="type-icon"
                    style={{ backgroundColor: type.color }}
                  >
                    <type.icon size={18} />
                  </div>
                  <div className="type-details">
                    <h5>{type.label}</h5>
                    <p>{type.description}</p>
                  </div>
                </div>
                
                <div className="type-controls">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings[type.key]}
                      onChange={(e) => handleSettingChange(type.key, e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              
              {settings[type.key] && permissionInfo.canTest && (
                <button 
                  className="test-type-btn"
                  onClick={() => testNotification(type.key === 'events' ? 'event' : 
                                                 type.key === 'deadlines' ? 'deadline' :
                                                 type.key === 'applications' ? 'application' :
                                                 type.key === 'opportunities' ? 'opportunity' :
                                                 type.key === 'badges' ? 'badge' :
                                                 type.key === 'streaks' ? 'streak' : 'general')}
                  disabled={isTestingNotifications}
                >
                  Test
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Advanced Settings */}
      <motion.div 
        className="advanced-settings"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h4>Advanced Settings</h4>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <FiVolume2 className="setting-icon" />
              <div>
                <h5>Sound Notifications</h5>
                <p>Play sound with notifications</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => handleSettingChange('sound', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <FiSmartphone className="setting-icon" />
              <div>
                <h5>Vibration</h5>
                <p>Vibrate device for notifications (mobile)</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.vibration}
                onChange={(e) => handleSettingChange('vibration', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Helpful Tips */}
      <motion.div 
        className="notification-tips"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h4>💡 Tips</h4>
        <ul>
          <li>Notifications help you stay on top of deadlines and opportunities</li>
          <li>You can customize which types of notifications you receive</li>
          <li>If notifications are blocked, you can enable them in your browser settings</li>
          <li>Test notifications to see how they'll appear on your device</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default NotificationCenter;
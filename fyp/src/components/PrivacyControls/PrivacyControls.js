import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiShield, 
  FiEye, 
  FiEyeOff, 
  FiBell, 
  FiMail, 
  FiPhone, 
  FiUsers, 
  FiLock, 
  FiGlobe,
  FiToggleLeft,
  FiToggleRight,
  FiInfo,
  FiSave,
  FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './PrivacyControls.css';

const PrivacyControls = () => {
  const [privacySettings, setPrivacySettings] = useState({
    // Profile Visibility
    profileVisibility: 'public', // public, friends, private
    showEmail: false,
    showPhone: false,
    showSocialMedia: true,
    showSkills: true,
    showExperience: true,
    showEducation: true,
    showAchievements: true,
    showReputationScore: true,
    
    // Contact Preferences
    allowDirectMessages: true,
    allowConnectionRequests: true,
    allowCompanyContacts: false,
    allowRecruiterContacts: true,
    
    // Notification Preferences
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyDigest: true,
    eventReminders: true,
    applicationUpdates: true,
    
    // Data Sharing
    shareAnalytics: false,
    shareWithPartners: false,
    allowDataExport: true,
    trackingConsent: false,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '30', // minutes
    loginAlerts: true,
    passwordChangeAlerts: true
  });

  const [dataRequests, setDataRequests] = useState([
    {
      id: 1,
      company: 'TechCorp Inc.',
      type: 'Profile Data',
      purpose: 'Recruitment',
      status: 'pending',
      date: '2024-01-15'
    },
    {
      id: 2,
      company: 'StartupXYZ',
      type: 'Skills & Experience',
      purpose: 'Job Matching',
      status: 'approved',
      date: '2024-01-10'
    }
  ]);

  const [showDataExport, setShowDataExport] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  useEffect(() => {
    // Load privacy settings from localStorage
    const savedSettings = localStorage.getItem('privacySettings');
    if (savedSettings) {
      setPrivacySettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (setting, value) => {
    const newSettings = {
      ...privacySettings,
      [setting]: value
    };
    setPrivacySettings(newSettings);
    localStorage.setItem('privacySettings', JSON.stringify(newSettings));
    
    toast.success('Privacy setting updated');
  };

  const handleDataRequest = (requestId, action) => {
    setDataRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: action }
          : request
      )
    );
    
    toast.success(`Data request ${action}`);
  };

  const exportUserData = async () => {
    setShowDataExport(true);
    setExportProgress(0);
    
    // Simulate data export process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setExportProgress(i);
    }
    
    // Create and download file
    const userData = {
      profile: {
        name: 'User Profile Data',
        settings: privacySettings,
        exportDate: new Date().toISOString()
      },
      // Add more user data here
    };
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hacktrack-data-export-${Date.now()}.json`;
    a.click();
    
    toast.success('Data export completed');
    setShowDataExport(false);
  };

  const deleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
      toast.error('Account deletion initiated. You will receive a confirmation email.');
    }
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="toggle-switch-container">
      <div className="toggle-info">
        <label className="toggle-label">{label}</label>
        {description && <p className="toggle-description">{description}</p>}
      </div>
      <button
        className={`toggle-switch ${checked ? 'active' : ''}`}
        onClick={() => onChange(!checked)}
      >
        {checked ? <FiToggleRight /> : <FiToggleLeft />}
      </button>
    </div>
  );

  return (
    <div className="privacy-controls">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="privacy-header"
      >
        <FiShield className="privacy-icon" />
        <div className="privacy-title">
          <h2>Privacy & Security</h2>
          <p>Manage your privacy settings and data controls</p>
        </div>
      </motion.div>

      <div className="privacy-sections">
        {/* Profile Visibility */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="privacy-section"
        >
          <h3><FiEye /> Profile Visibility</h3>
          
          <div className="setting-group">
            <label>Profile Visibility Level</label>
            <select
              value={privacySettings.profileVisibility}
              onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              className="privacy-select"
            >
              <option value="public">Public - Visible to everyone</option>
              <option value="friends">Friends - Visible to connections only</option>
              <option value="private">Private - Visible to you only</option>
            </select>
          </div>

          <ToggleSwitch
            checked={privacySettings.showEmail}
            onChange={(value) => handleSettingChange('showEmail', value)}
            label="Show Email Address"
            description="Allow others to see your email address"
          />

          <ToggleSwitch
            checked={privacySettings.showPhone}
            onChange={(value) => handleSettingChange('showPhone', value)}
            label="Show Phone Number"
            description="Allow others to see your phone number"
          />

          <ToggleSwitch
            checked={privacySettings.showSkills}
            onChange={(value) => handleSettingChange('showSkills', value)}
            label="Show Skills & Expertise"
            description="Display your skills on your profile"
          />

          <ToggleSwitch
            checked={privacySettings.showReputationScore}
            onChange={(value) => handleSettingChange('showReputationScore', value)}
            label="Show Reputation Score"
            description="Display your reputation score publicly"
          />
        </motion.section>

        {/* Contact Preferences */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="privacy-section"
        >
          <h3><FiUsers /> Contact Preferences</h3>
          
          <ToggleSwitch
            checked={privacySettings.allowDirectMessages}
            onChange={(value) => handleSettingChange('allowDirectMessages', value)}
            label="Allow Direct Messages"
            description="Let other users send you direct messages"
          />

          <ToggleSwitch
            checked={privacySettings.allowConnectionRequests}
            onChange={(value) => handleSettingChange('allowConnectionRequests', value)}
            label="Allow Connection Requests"
            description="Let other users send you connection requests"
          />

          <ToggleSwitch
            checked={privacySettings.allowRecruiterContacts}
            onChange={(value) => handleSettingChange('allowRecruiterContacts', value)}
            label="Allow Recruiter Contacts"
            description="Let recruiters contact you about opportunities"
          />

          <ToggleSwitch
            checked={privacySettings.allowCompanyContacts}
            onChange={(value) => handleSettingChange('allowCompanyContacts', value)}
            label="Allow Company Contacts"
            description="Let companies contact you directly"
          />
        </motion.section>

        {/* Notification Preferences */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="privacy-section"
        >
          <h3><FiBell /> Notification Preferences</h3>
          
          <ToggleSwitch
            checked={privacySettings.emailNotifications}
            onChange={(value) => handleSettingChange('emailNotifications', value)}
            label="Email Notifications"
            description="Receive notifications via email"
          />

          <ToggleSwitch
            checked={privacySettings.smsNotifications}
            onChange={(value) => handleSettingChange('smsNotifications', value)}
            label="SMS Notifications"
            description="Receive important notifications via SMS"
          />

          <ToggleSwitch
            checked={privacySettings.weeklyDigest}
            onChange={(value) => handleSettingChange('weeklyDigest', value)}
            label="Weekly Digest"
            description="Get a weekly summary of opportunities"
          />
        </motion.section>

        {/* Data Sharing & Privacy */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="privacy-section"
        >
          <h3><FiGlobe /> Data Sharing & Privacy</h3>
          
          <ToggleSwitch
            checked={privacySettings.shareAnalytics}
            onChange={(value) => handleSettingChange('shareAnalytics', value)}
            label="Share Anonymous Analytics"
            description="Help improve the platform by sharing anonymous usage data"
          />

          <ToggleSwitch
            checked={privacySettings.shareWithPartners}
            onChange={(value) => handleSettingChange('shareWithPartners', value)}
            label="Share with Partners"
            description="Allow sharing data with trusted partners for better opportunities"
          />

          <ToggleSwitch
            checked={privacySettings.trackingConsent}
            onChange={(value) => handleSettingChange('trackingConsent', value)}
            label="Analytics Tracking"
            description="Allow tracking for personalized experience"
          />
        </motion.section>

        {/* Security Settings */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="privacy-section"
        >
          <h3><FiLock /> Security Settings</h3>
          
          <ToggleSwitch
            checked={privacySettings.twoFactorAuth}
            onChange={(value) => handleSettingChange('twoFactorAuth', value)}
            label="Two-Factor Authentication"
            description="Add extra security to your account"
          />

          <ToggleSwitch
            checked={privacySettings.loginAlerts}
            onChange={(value) => handleSettingChange('loginAlerts', value)}
            label="Login Alerts"
            description="Get notified of new login attempts"
          />

          <div className="setting-group">
            <label>Session Timeout</label>
            <select
              value={privacySettings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
              className="privacy-select"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="never">Never</option>
            </select>
          </div>
        </motion.section>

        {/* Data Requests */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="privacy-section"
        >
          <h3><FiInfo /> Data Access Requests</h3>
          
          <div className="data-requests">
            {dataRequests.map((request) => (
              <div key={request.id} className="data-request">
                <div className="request-info">
                  <h4>{request.company}</h4>
                  <p><strong>Data Type:</strong> {request.type}</p>
                  <p><strong>Purpose:</strong> {request.purpose}</p>
                  <p><strong>Date:</strong> {request.date}</p>
                </div>
                <div className="request-status">
                  <span className={`status ${request.status}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  {request.status === 'pending' && (
                    <div className="request-actions">
                      <button 
                        onClick={() => handleDataRequest(request.id, 'approved')}
                        className="approve-btn"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleDataRequest(request.id, 'denied')}
                        className="deny-btn"
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Data Export & Account Management */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="privacy-section danger-zone"
        >
          <h3><FiSave /> Data Export & Account Management</h3>
          
          <div className="action-buttons">
            <button 
              onClick={exportUserData}
              className="export-btn"
              disabled={showDataExport}
            >
              <FiSave />
              {showDataExport ? `Exporting... ${exportProgress}%` : 'Export My Data'}
            </button>

            <button 
              onClick={deleteAccount}
              className="delete-btn"
            >
              <FiTrash2 />
              Delete Account
            </button>
          </div>

          {showDataExport && (
            <div className="export-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p>Preparing your data export...</p>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default PrivacyControls;
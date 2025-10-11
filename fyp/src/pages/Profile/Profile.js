import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiEdit3, 
  FiSave, 
  FiX, 
  FiBook,
  FiCalendar,
  FiLogOut,
  FiCode,
  FiHeart,
  FiBriefcase
} from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, logout, updateUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: {
      city: '',
      state: '',
      pincode: ''
    },
    education: {
      university: '',
      degree: '',
      year: '',
      fieldOfStudy: ''
    },
    skills: [],
    interests: [],
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: {
          city: user.location?.city || '',
          state: user.location?.state || 'Maharashtra',
          pincode: user.location?.pincode || ''
        },
        education: {
          university: user.education?.university || '',
          degree: user.education?.degree || '',
          year: user.education?.year || '',
          fieldOfStudy: user.education?.fieldOfStudy || ''
        },
        skills: user.skills || [],
        interests: user.interests || [],
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayInputChange = (field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setProfileData(prev => ({
      ...prev,
      [field]: arrayValue
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        updateUser(data.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const formatJoinDate = (date) => {
    if (!date) return 'Recently joined';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <p>Please login to view your profile</p>
        <Button onClick={() => navigate('/login')}>Login</Button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <motion.div 
          className="profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-join-date">
              <FiCalendar size={16} />
              Member since {formatJoinDate(user.joinedDate)}
            </p>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="medium"
              >
                <FiEdit3 size={18} />
                Edit Profile
              </Button>
            ) : (
              <div className="edit-actions">
                <Button
                  onClick={handleSaveProfile}
                  loading={isLoading}
                  size="medium"
                >
                  <FiSave size={18} />
                  Save
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  size="medium"
                >
                  <FiX size={18} />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Profile Stats */}
        <motion.div 
          className="profile-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon events">
                <FiCalendar size={24} />
              </div>
              <div className="stat-content">
                <h4>{user.eventsAttended || 0}</h4>
                <p>Events Attended</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon hackathons">
                <FiCode size={24} />
              </div>
              <div className="stat-content">
                <h4>{user.hackathonsParticipated || 0}</h4>
                <p>Hackathons</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon applications">
                <FiBriefcase size={24} />
              </div>
              <div className="stat-content">
                <h4>{user.applicationsSubmitted || 0}</h4>
                <p>Applications</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon score">
                <FiHeart size={24} />
              </div>
              <div className="stat-content">
                <h4>{user.profileCompleteness || Math.round(((profileData.name ? 1 : 0) + (profileData.phone ? 1 : 0) + (profileData.bio ? 1 : 0) + (profileData.skills.length > 0 ? 1 : 0) + (profileData.interests.length > 0 ? 1 : 0) + (profileData.education.university ? 1 : 0)) / 6 * 100)}%</h4>
                <p>Profile Complete</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Content */}
        <motion.div 
          className="profile-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="profile-grid">
            {/* Personal Information */}
            <div className="profile-section">
              <h3>
                <FiUser size={20} />
                Personal Information
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p>{profileData.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <p>{profileData.email}</p>
                  <small>Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p>{profileData.phone || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  ) : (
                    <p>{profileData.bio || 'No bio provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="profile-section">
              <h3>
                <FiMapPin size={20} />
                Location Details
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location.city"
                      value={profileData.location.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                    />
                  ) : (
                    <p>{profileData.location.city || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location.state"
                      value={profileData.location.state}
                      onChange={handleInputChange}
                      placeholder="Maharashtra"
                    />
                  ) : (
                    <p>{profileData.location.state || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location.pincode"
                      value={profileData.location.pincode}
                      onChange={handleInputChange}
                      placeholder="400001"
                      maxLength="6"
                    />
                  ) : (
                    <p>{profileData.location.pincode || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Education Information */}
            <div className="profile-section">
              <h3>
                <FiBook size={20} />
                Education Details
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>University/College</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="education.university"
                      value={profileData.education.university}
                      onChange={handleInputChange}
                      placeholder="IIT Bombay"
                    />
                  ) : (
                    <p>{profileData.education.university || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Degree</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="education.degree"
                      value={profileData.education.degree}
                      onChange={handleInputChange}
                      placeholder="B.Tech"
                    />
                  ) : (
                    <p>{profileData.education.degree || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Field of Study</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="education.fieldOfStudy"
                      value={profileData.education.fieldOfStudy}
                      onChange={handleInputChange}
                      placeholder="Computer Science"
                    />
                  ) : (
                    <p>{profileData.education.fieldOfStudy || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Current Year</label>
                  {isEditing ? (
                    <select
                      name="education.year"
                      value={profileData.education.year}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                      <option value="graduate">Graduate</option>
                    </select>
                  ) : (
                    <p>{profileData.education.year ? `${profileData.education.year === 'graduate' ? 'Graduate' : `${profileData.education.year}${profileData.education.year === '1' ? 'st' : profileData.education.year === '2' ? 'nd' : profileData.education.year === '3' ? 'rd' : 'th'} Year`}` : 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Skills & Interests */}
            <div className="profile-section">
              <h3>
                <FiCode size={20} />
                Technical Skills
              </h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Skills</label>
                  {isEditing ? (
                    <div>
                      <textarea
                        value={profileData.skills.join(', ')}
                        onChange={(e) => handleArrayInputChange('skills', e.target.value)}
                        placeholder="JavaScript, React, Node.js, Python, MongoDB, AWS, etc."
                        rows={3}
                      />
                      <small>Separate skills with commas. Examples: JavaScript, React, Python, Machine Learning</small>
                    </div>
                  ) : (
                    <div className="tags-container">
                      {profileData.skills.length > 0 ? (
                        profileData.skills.map((skill, index) => (
                          <span key={index} className="tag skill-tag">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p>No skills added yet. Click edit to add your technical skills!</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="profile-section">
              <h3>
                <FiHeart size={20} />
                Areas of Interest
              </h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Interests</label>
                  {isEditing ? (
                    <div>
                      <textarea
                        value={profileData.interests.join(', ')}
                        onChange={(e) => handleArrayInputChange('interests', e.target.value)}
                        placeholder="Web Development, AI/ML, Mobile Apps, FinTech, etc."
                        rows={3}
                      />
                      <small>Separate interests with commas. Examples: Web Development, AI/ML, FinTech, Blockchain</small>
                    </div>
                  ) : (
                    <div className="tags-container">
                      {profileData.interests.length > 0 ? (
                        profileData.interests.map((interest, index) => (
                          <span key={index} className="tag interest-tag">
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p>No interests added yet. Click edit to add your areas of interest!</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Footer */}
        <motion.div 
          className="profile-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            onClick={handleLogout}
            variant="outline"
            className="logout-btn"
          >
            <FiLogOut size={18} />
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
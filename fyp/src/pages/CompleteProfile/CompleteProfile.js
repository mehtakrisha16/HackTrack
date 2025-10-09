import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMapPin, FiBook, FiBriefcase, FiCode, FiHeart } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import './CompleteProfile.css';

const CompleteProfile = ({ googleUserData, onComplete }) => {
  const [formData, setFormData] = useState({
    // Pre-fill with Google data
    name: googleUserData?.name || '',
    email: googleUserData?.email || '',
    profilePicture: googleUserData?.profilePicture || '',
    
    // Additional info to collect
    phone: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    
    // Location
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: ''
    },
    
    // Education
    education: {
      university: '',
      degree: '',
      branch: '',
      year: '',
      graduationYear: ''
    },
    
    // Professional info
    skills: [],
    interests: [],
    bio: '',
    
    // Social links
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: '',
      twitter: ''
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const universities = [
    'IIT Bombay', 'VJTI Mumbai', 'Mumbai University', 'SPIT Mumbai',
    'KJ Somaiya', 'Thadomal Shahani', 'Jai Hind College', 
    'St. Xavier\'s College', 'Other'
  ];

  const degrees = ['B.Tech', 'B.E.', 'B.Sc', 'BCA', 'M.Tech', 'M.E.', 'M.Sc', 'MCA', 'MBA', 'Other'];

  const branches = [
    'Computer Science', 'Information Technology', 'Electronics', 
    'Mechanical', 'Civil', 'Chemical', 'Electrical', 'Other'
  ];

  const availableSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
    'Angular', 'Vue.js', 'Django', 'MongoDB', 'MySQL', 'AWS',
    'Machine Learning', 'Data Science', 'AI', 'Blockchain',
    'Mobile Development', 'UI/UX Design', 'DevOps', 'IoT'
  ];

  const availableInterests = [
    'FinTech', 'EdTech', 'HealthTech', 'E-commerce', 'AI/ML',
    'Blockchain', 'IoT', 'Cybersecurity', 'Web Development',
    'Mobile Development', 'Data Science', 'Cloud Computing',
    'Startup', 'Entrepreneurship', 'Product Management'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare complete profile data for backend
      const completeProfileData = {
        ...formData,
        profileCompleted: true,
        preferences: {
          interests: formData.interests,
          skillLevel: 'intermediate',
          location: formData.location.city,
          notifications: {
            email: true,
            push: true,
            recommendations: true
          }
        }
      };

      // Update profile via backend API
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(completeProfileData)
      });

      const data = await response.json();

      if (response.ok) {
        // Create complete user data combining Google info and profile data
        const completeUserData = {
          ...googleUserData,
          ...data.user,
          profileCompleted: true,
          isProfileComplete: true
        };

        // Update context with complete profile
        setUser(completeUserData);

        // Call completion callback
        if (onComplete) {
          onComplete(completeUserData);
        }

        toast.success(`Welcome to HackTrack Mumbai, ${googleUserData.name.split(' ')[0]}! Your profile is now complete.`);
        navigate('/dashboard');
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }

    } catch (error) {
      console.error('Complete profile error:', error);
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="step-content"
    >
      <h3><FiUser className="step-icon" /> Basic Information</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
        
        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="prefer-not-to-say">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Location (Pincode)</label>
        <input
          type="text"
          name="location.pincode"
          value={formData.location.pincode}
          onChange={handleChange}
          placeholder="400001"
          maxLength="6"
        />
      </div>

      <div className="form-group">
        <label>Bio (Optional)</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself..."
          maxLength="500"
        />
        <small>{formData.bio.length}/500 characters</small>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="step-content"
    >
      <h3><FiBook className="step-icon" /> Education Details</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>University/College</label>
          <select name="education.university" value={formData.education.university} onChange={handleChange}>
            <option value="">Select University</option>
            {universities.map(uni => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Degree</label>
          <select name="education.degree" value={formData.education.degree} onChange={handleChange}>
            <option value="">Select Degree</option>
            {degrees.map(degree => (
              <option key={degree} value={degree}>{degree}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Branch/Stream</label>
          <select name="education.branch" value={formData.education.branch} onChange={handleChange}>
            <option value="">Select Branch</option>
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Current Year</label>
          <select name="education.year" value={formData.education.year} onChange={handleChange}>
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Expected Graduation Year</label>
        <input
          type="number"
          name="education.graduationYear"
          value={formData.education.graduationYear}
          onChange={handleChange}
          min="2024"
          max="2030"
          placeholder="2025"
        />
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="step-content"
    >
      <h3><FiCode className="step-icon" /> Technical Skills</h3>
      <p>Select your technical skills (select multiple)</p>
      
      <div className="skills-grid">
        {availableSkills.map(skill => (
          <button
            key={skill}
            type="button"
            className={`skill-tag ${formData.skills.includes(skill) ? 'selected' : ''}`}
            onClick={() => handleSkillToggle(skill)}
          >
            {skill}
          </button>
        ))}
      </div>

      <h3><FiHeart className="step-icon" /> Interests</h3>
      <p>What areas interest you the most?</p>
      
      <div className="interests-grid">
        {availableInterests.map(interest => (
          <button
            key={interest}
            type="button"
            className={`interest-tag ${formData.interests.includes(interest) ? 'selected' : ''}`}
            onClick={() => handleInterestToggle(interest)}
          >
            {interest}
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="step-content"
    >
      <h3><FiBriefcase className="step-icon" /> Social Links (Optional)</h3>
      
      <div className="form-group">
        <label>LinkedIn Profile</label>
        <input
          type="url"
          name="socialLinks.linkedin"
          value={formData.socialLinks.linkedin}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/yourname"
        />
      </div>

      <div className="form-group">
        <label>GitHub Profile</label>
        <input
          type="url"
          name="socialLinks.github"
          value={formData.socialLinks.github}
          onChange={handleChange}
          placeholder="https://github.com/yourusername"
        />
      </div>

      <div className="form-group">
        <label>Portfolio Website</label>
        <input
          type="url"
          name="socialLinks.portfolio"
          value={formData.socialLinks.portfolio}
          onChange={handleChange}
          placeholder="https://yourportfolio.com"
        />
      </div>

      <div className="form-group">
        <label>Twitter Profile</label>
        <input
          type="url"
          name="socialLinks.twitter"
          value={formData.socialLinks.twitter}
          onChange={handleChange}
          placeholder="https://twitter.com/yourusername"
        />
      </div>
    </motion.div>
  );

  const steps = [
    { number: 1, title: 'Basic Info', component: renderStep1 },
    { number: 2, title: 'Education', component: renderStep2 },
    { number: 3, title: 'Skills & Interests', component: renderStep3 },
    { number: 4, title: 'Social Links', component: renderStep4 }
  ];

  return (
    <div className="complete-profile">
      <div className="container">
        <motion.div
          className="complete-profile-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="profile-header">
            <div className="google-user-info">
              <img 
                src={googleUserData?.profilePicture || '/default-avatar.png'} 
                alt="Profile" 
                className="google-avatar"
              />
              <div>
                <h2>Complete Your Profile</h2>
                <p>Welcome, {googleUserData?.name}! Let's complete your HackTrack profile.</p>
              </div>
            </div>
          </div>

          <div className="progress-bar">
            {steps.map((step, index) => (
              <div key={step.number} className="progress-step">
                <div 
                  className={`step-number ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
                >
                  {step.number}
                </div>
                <span className="step-title">{step.title}</span>
                {index < steps.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="complete-profile-form">
            {steps[currentStep - 1].component()}

            <div className="form-actions">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
              
              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={isLoading}
                  size="large"
                >
                  Complete Profile
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CompleteProfile;
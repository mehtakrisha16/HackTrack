import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiMapPin, FiPhone } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import { AppContext } from '../../context/AppContext';
import { toast } from '../../utils/toastFilter';
import { authUtils } from '../../utils/auth';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [university, setUniversity] = useState('Other');
  const [year, setYear] = useState('1');
  const [skillsInput, setSkillsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add DOM-level listeners for debugging to ensure submit events fire
  React.useEffect(() => {
    const f = document.getElementById('signup-form');
    const onSubmit = (e) => {
      console.log('DOM submit event fired for signup-form', e);
    };
    const onClick = (e) => {
      console.log('DOM click on signup (target):', e.target);
    };
    if (f) {
      f.addEventListener('submit', onSubmit);
      f.addEventListener('click', onClick);
    }
    return () => {
      if (f) {
        f.removeEventListener('submit', onSubmit);
        f.removeEventListener('click', onClick);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    console.log('🟢 Signup button clicked!');
    console.log('👤 Name:', formData.name);
    console.log('📧 Email:', formData.email);
    console.log('🔐 Password:', formData.password ? '***' : 'EMPTY');
    console.log('🔐 Confirm Password:', formData.confirmPassword ? '***' : 'EMPTY');
    
    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      console.log('❌ Password too short');
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Client-side validation: name only letters & spaces
    if (!/^[a-zA-Z\s]{2,100}$/.test(formData.name)) {
      toast.error('Please enter a valid name (letters and spaces only)');
      return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Password complexity check (server enforces too)
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}/.test(formData.password)) {
      toast.error('Password must contain uppercase, lowercase and a number');
      return;
    }

    // Phone validation (optional)
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    // Pincode validation (optional)
    if (pincode && !/^[1-9][0-9]{5}$/.test(pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setIsLoading(true);
    console.log('🚀 Calling register API...');

    try {
      // Timeout wrapper for register call
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      // Build payload with optional profile fields
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: phone || undefined,
        location: {
          city: city || undefined,
          state: stateName || undefined,
          pincode: pincode || undefined,
          country: 'India'
        },
        education: {
          university: university || undefined,
          year: year ? parseInt(year, 10) : undefined
        },
        skills: skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      const response = await authUtils.register(payload, { signal: controller.signal });

      clearTimeout(timeout);

      console.log('✅ Signup successful!', response);

      if (response.token && response.user) {
        // Persist token & user and update global context
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);

        toast.success('🎉 Welcome to HackTrack! Your account has been created successfully!');

        // If user profile is incomplete, route to complete-profile page
        const needsProfile = !response.user.phone || !response.user.location || !response.user.education;
        navigate(needsProfile ? '/complete-profile' : '/dashboard');
      } else {
        toast.success('Account created successfully! Please log in.');
        navigate('/login');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);

      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.');
      } else if (error.status === 400 && error.data?.errors) {
        const validationErrors = error.data.errors;
        validationErrors.forEach(err => toast.error(err.msg || err.message));
      } else if (error.status === 503) {
        toast.error('Database temporarily unavailable. Please try later.');
      } else {
        toast.error(error.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Removed Google OAuth functionality - Email registration only

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-text">HackTrack</span>
              <span className="logo-location">India</span>
            </Link>
            <h1>Join India's Tech Community</h1>
            <p>Connect with thousands of students and professionals across India</p>
          </div>

          {/* Email Registration Only */}

          {/* Signup Form */}
          <form id="signup-form" className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                    /* required removed to allow JS submit handler to run during demo */
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                    /* required removed to allow JS submit handler to run during demo */
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                    /* required removed to allow JS submit handler to run during demo */
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                    /* required removed to allow JS submit handler to run during demo */
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                {/* Default checked to avoid HTML5 blocking submission during demos; user can still uncheck. */}
                <input type="checkbox" required defaultChecked aria-label="Agree to terms" />
                <span className="checkmark"></span>
                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>

            <Button 
              type="submit" 
              loading={isLoading}
              disabled={isLoading}
              fullWidth 
              size="large"
              onClick={() => {
                if (isLoading) return; // guard against double clicks
                const f = document.getElementById('signup-form');
                if (f && typeof f.requestSubmit === 'function') f.requestSubmit();
              }}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
            <button
              type="submit"
              style={{ display: 'none' }}
              aria-hidden="true"
            />
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in here</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
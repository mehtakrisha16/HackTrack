import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import OTPLogin from '../../components/OTPLogin/OTPLogin';
import { toast } from '../../utils/toastFilter';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'otp'
  const { login, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Debug: DOM listeners to ensure submit/click events are observable
  React.useEffect(() => {
    const f = document.getElementById('login-form');
    const onSubmit = (e) => console.log('DOM submit event fired for login-form', e);
    const onClick = (e) => console.log('DOM click on login (target):', e.target);
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
    console.log('🔵 Login button clicked!');
    console.log('📧 Email:', formData.email);
    console.log('🔐 Password:', formData.password ? '***' : 'EMPTY');
    if (isLoading) return;

    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Calling login API...');

      // Timeout wrapper
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const userData = await login({
        email: formData.email,
        password: formData.password
      }, { signal: controller.signal });

      clearTimeout(timeout);

      console.log('✅ Login successful!', userData);

      // If profile incomplete, redirect to complete-profile
      const needsProfile = !userData.phone || !userData.location;
      navigate(needsProfile ? '/complete-profile' : '/dashboard');

    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.status === 400 && error.data?.errors) {
        // Handle validation errors
        const validationErrors = error.data.errors;
        validationErrors.forEach(err => {
          toast.error(err.msg || err.message);
        });
      } else if (error.status === 503) {
        // Database unavailable - MongoDB not connected
        toast.error('⚠️ Database temporarily unavailable');
        toast.error('Please whitelist your IP in MongoDB Atlas', { duration: 6000 });
        console.log('Hint:', error.data?.hint);
      } else if (error.status === 0) {
        // Network error - backend not running
        toast.error('❌ Cannot connect to server. Make sure backend is running on port 5000.');
      } else {
        toast.error(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Removed Google OAuth functionality - Email login only

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
            <h1>Welcome Back to India's Tech Hub</h1>
            <p>Sign in to discover opportunities across India</p>
          </div>

          {/* Login Method Toggle */}
          <div className="login-method-toggle">
            <button
              type="button"
              className={`method-btn ${loginMethod === 'email' ? 'active' : ''}`}
              onClick={() => setLoginMethod('email')}
            >
              <FiMail size={18} />
              Email
            </button>
            <button
              type="button"
              className={`method-btn ${loginMethod === 'otp' ? 'active' : ''}`}
              onClick={() => setLoginMethod('otp')}
            >
              <FiPhone size={18} />
              Mobile OTP
            </button>
          </div>

          {/* Conditional Login Forms */}
          {loginMethod === 'email' ? (
            <form id="login-form" className="auth-form" onSubmit={handleSubmit}>
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
                    /* required removed so JS submit handler runs during demo */
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
                    placeholder="Enter your password"
                    /* required removed so JS submit handler runs during demo */
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

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                loading={isLoading}
                fullWidth 
                size="large"
                onClick={() => {
                  // Ensure form submit fires even if something intercepts native submit
                  const f = document.getElementById('login-form');
                  if (f && typeof f.requestSubmit === 'function') f.requestSubmit();
                }}
              >
                Sign In
              </Button>
              {/* Native fallback button for edge cases where the styled Button is blocked by CSS/overlays */}
              <button
                type="submit"
                style={{ display: 'none' }}
                aria-hidden="true"
              />
            </form>
          ) : (
            <OTPLogin onBack={() => setLoginMethod('email')} />
          )}

          {/* Footer */}
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
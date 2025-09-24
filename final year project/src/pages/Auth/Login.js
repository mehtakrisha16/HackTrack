import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiGithub, FiLinkedin } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { AppContext } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../utils/api';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = await login({
        email: formData.email,
        password: formData.password
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.status === 400 && error.data?.errors) {
        // Handle validation errors
        const validationErrors = error.data.errors;
        validationErrors.forEach(err => {
          toast.error(err.msg || err.message);
        });
      } else {
        toast.error(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast.success(`${provider} login coming soon!`);
  };

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
              <span className="logo-location">Mumbai</span>
            </Link>
            <h1>Welcome Back to Mumbai's Tech Hub</h1>
            <p>Sign in to discover opportunities in India's financial capital</p>
          </div>

          {/* Social Login */}
          <div className="social-login">
            <button 
              className="social-btn google"
              onClick={() => handleSocialLogin('Google')}
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>
            
            <button 
              className="social-btn github"
              onClick={() => handleSocialLogin('GitHub')}
            >
              <FiGithub size={20} />
              Continue with GitHub
            </button>
            
            <button 
              className="social-btn linkedin"
              onClick={() => handleSocialLogin('LinkedIn')}
            >
              <FiLinkedin size={20} />
              Continue with LinkedIn
            </button>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          {/* Login Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
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
                  required
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
                  required
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
            >
              Sign In
            </Button>
          </form>

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
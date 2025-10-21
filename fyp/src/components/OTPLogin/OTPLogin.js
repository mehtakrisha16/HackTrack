import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiKey, FiArrowLeft, FiClock, FiCheckCircle } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './OTPLogin.css';

const OTPLogin = ({ onBack }) => {
  const { setUser, setLoading } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0 && step === 'otp') {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhone = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    // Limit to 10 digits
    return cleaned.slice(0, 10);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`OTP sent to +91 ${phone}`);
        setStep('otp');
        setTimer(300); // 5 minutes
        setCanResend(false);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    if (isNewUser && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone, 
          otp,
          name: isNewUser ? name : undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setSuccess('Login successful!');

        // Navigate based on profile completion
        setTimeout(() => {
          if (data.isNewUser || !data.user.profileCompleted) {
            navigate('/complete-profile');
          } else {
            const redirectTo = location.state?.from || '/dashboard';
            navigate(redirectTo);
          }
        }, 1000);

      } else {
        setError(data.message || 'Invalid OTP');
        if (data.message && data.message.includes('new user')) {
          setIsNewUser(true);
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP resent successfully');
        setTimer(300);
        setCanResend(false);
        setOtp('');
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setError('');
      setSuccess('');
      setTimer(0);
    } else {
      onBack();
    }
  };

  return (
    <div className="otp-login">
      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.div
            key="phone-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="otp-step"
          >
            <div className="step-header">
              <button className="back-btn" onClick={handleBack}>
                <FiArrowLeft size={20} />
              </button>
              <div className="step-info">
                <FiPhone className="step-icon" />
                <h2>Enter Mobile Number</h2>
                <p>We'll send you a 6-digit OTP to verify your number</p>
              </div>
            </div>

            <form onSubmit={handlePhoneSubmit} className="otp-form">
              <div className="form-group">
                <label>Mobile Number</label>
                <div className="phone-input">
                  <span className="country-code">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="success-message"
                >
                  <FiCheckCircle size={16} />
                  {success}
                </motion.div>
              )}

              <button
                type="submit"
                className="otp-submit-btn"
                disabled={isLoading || phone.length !== 10}
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="otp-step"
          >
            <div className="step-header">
              <button className="back-btn" onClick={handleBack}>
                <FiArrowLeft size={20} />
              </button>
              <div className="step-info">
                <FiKey className="step-icon" />
                <h2>Enter OTP</h2>
                <p>Enter the 6-digit code sent to +91 {phone}</p>
              </div>
            </div>

            <form onSubmit={handleOTPSubmit} className="otp-form">
              <div className="form-group">
                <label>6-Digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter OTP"
                  maxLength="6"
                  className="otp-input"
                  autoFocus
                  required
                />
              </div>

              {isNewUser && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="form-group"
                >
                  <label>Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </motion.div>
              )}

              <div className="timer-section">
                {timer > 0 ? (
                  <div className="timer">
                    <FiClock size={16} />
                    <span>Resend OTP in {formatTime(timer)}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={handleResendOTP}
                    disabled={!canResend || isLoading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="success-message"
                >
                  <FiCheckCircle size={16} />
                  {success}
                </motion.div>
              )}

              <button
                type="submit"
                className="otp-submit-btn"
                disabled={isLoading || otp.length !== 6 || (isNewUser && !name.trim())}
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  'Verify & Continue'
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OTPLogin;
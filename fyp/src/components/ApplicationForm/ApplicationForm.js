// Enhanced Application Form Component
import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUser, FiMail, FiPhone, FiMapPin, FiGithub, FiLinkedin, FiUpload, FiX, FiCheck } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import dataService from '../../utils/dataService';
import './ApplicationForm.css';

const ApplicationForm = ({ event, isOpen, onClose, onSuccess }) => {
  const { user, addApplication } = useContext(AppContext);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    
    // Academic/Professional Information
    education: user?.education?.degree || '',
    institution: user?.education?.institution || '',
    graduationYear: user?.education?.graduationYear || '',
    experience: '',
    
    // Skills and Interests
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    
    // Event-specific
    motivation: '',
    expectations: '',
    previousExperience: '',
    teamPreference: 'either', // 'team', 'solo', 'either'
    
    // Portfolio/Links
    portfolio: '',
    github: '',
    linkedin: '',
    resume: null,
    
    // Additional
    additionalInfo: '',
    agreeToTerms: false,
    agreeToUpdates: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          resume: 'File size must be less than 5MB'
        }));
        return;
      }
      
      if (!file.type.includes('pdf') && !file.type.includes('doc')) {
        setErrors(prev => ({
          ...prev,
          resume: 'Please upload a PDF or DOC file'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
      
      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.education.trim()) newErrors.education = 'Education level is required';
    if (!formData.motivation.trim()) newErrors.motivation = 'Motivation is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitApplication = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const applicationData = {
        eventId: event.id || event._id,
        eventTitle: event.title,
        eventType: event.type,
        companyName: event.organizer || event.company,
        ...formData,
        appliedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      // Submit through data service
      await dataService.submitApplication(applicationData);
      
      // Add to local state
      addApplication(applicationData);
      
      setSubmitSuccess(true);
      
      // Call success callback after a delay
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="application-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="application-modal"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="event-info">
              <h2>Apply to {event.title}</h2>
              <p>{event.organizer || event.company}</p>
              <div className="event-details">
                <span className="event-type">{event.type}</span>
                <span className="event-location">{event.location}</span>
                <span className="event-deadline">
                  Deadline: {new Date(event.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button className="close-button" onClick={onClose}>
              <FiX />
            </button>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {submitSuccess && (
              <motion.div
                className="success-message"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <FiCheck />
                <h3>Application Submitted Successfully!</h3>
                <p>We'll notify you about the status via email.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {!submitSuccess && (
            <form className="application-form" onSubmit={(e) => e.preventDefault()}>
              {/* Personal Information */}
              <section className="form-section">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <FiUser />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={errors.fullName ? 'error' : ''}
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FiMail />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FiPhone />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="e.g., 9876543210"
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FiMapPin />
                      Current Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Mumbai, Maharashtra"
                    />
                  </div>
                </div>
              </section>

              {/* Education/Experience */}
              <section className="form-section">
                <h3>Education & Experience</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Education Level *</label>
                    <select
                      value={formData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      className={errors.education ? 'error' : ''}
                    >
                      <option value="">Select Education Level</option>
                      <option value="high-school">High School</option>
                      <option value="diploma">Diploma</option>
                      <option value="bachelors">Bachelor's Degree</option>
                      <option value="masters">Master's Degree</option>
                      <option value="phd">PhD/Doctorate</option>
                    </select>
                    {errors.education && <span className="error-message">{errors.education}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Institution/College</label>
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={(e) => handleInputChange('institution', e.target.value)}
                      placeholder="e.g., IIT Bombay, VJTI Mumbai"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Graduation Year</label>
                    <input
                      type="number"
                      value={formData.graduationYear}
                      onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                      min="2020"
                      max="2030"
                      placeholder="e.g., 2025"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Experience Level</label>
                    <select
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                    >
                      <option value="">Select Experience Level</option>
                      <option value="fresher">Fresher (0 years)</option>
                      <option value="junior">Junior (1-2 years)</option>
                      <option value="intermediate">Intermediate (3-5 years)</option>
                      <option value="senior">Senior (5+ years)</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Skills & Portfolio */}
              <section className="form-section">
                <h3>Skills & Portfolio</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Technical Skills</label>
                    <textarea
                      value={formData.skills}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      placeholder="e.g., JavaScript, Python, React, Node.js, Machine Learning"
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FiGithub />
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      value={formData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FiLinkedin />
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Portfolio Website</label>
                    <input
                      type="url"
                      value={formData.portfolio}
                      onChange={(e) => handleInputChange('portfolio', e.target.value)}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FiUpload />
                      Resume (PDF/DOC, max 5MB)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className={errors.resume ? 'error' : ''}
                    />
                    {formData.resume && (
                      <span className="file-name">{formData.resume.name}</span>
                    )}
                    {errors.resume && <span className="error-message">{errors.resume}</span>}
                  </div>
                </div>
              </section>

              {/* Event-specific Questions */}
              <section className="form-section">
                <h3>Event-specific Information</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Why do you want to participate in this {event.type}? *</label>
                    <textarea
                      value={formData.motivation}
                      onChange={(e) => handleInputChange('motivation', e.target.value)}
                      placeholder="Share your motivation and what you hope to achieve..."
                      rows="4"
                      className={errors.motivation ? 'error' : ''}
                    />
                    {errors.motivation && <span className="error-message">{errors.motivation}</span>}
                  </div>
                  
                  <div className="form-group full-width">
                    <label>What are your expectations from this {event.type}?</label>
                    <textarea
                      value={formData.expectations}
                      onChange={(e) => handleInputChange('expectations', e.target.value)}
                      placeholder="What do you expect to learn or gain from this experience?"
                      rows="3"
                    />
                  </div>
                  
                  {event.type === 'hackathon' && (
                    <div className="form-group">
                      <label>Team Preference</label>
                      <select
                        value={formData.teamPreference}
                        onChange={(e) => handleInputChange('teamPreference', e.target.value)}
                      >
                        <option value="either">Either team or solo</option>
                        <option value="team">Prefer to work in a team</option>
                        <option value="solo">Prefer to work solo</option>
                      </select>
                    </div>
                  )}
                  
                  <div className="form-group full-width">
                    <label>Previous Experience (Optional)</label>
                    <textarea
                      value={formData.previousExperience}
                      onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                      placeholder="Any relevant previous experience with similar events or projects..."
                      rows="3"
                    />
                  </div>
                </div>
              </section>

              {/* Additional Information */}
              <section className="form-section">
                <h3>Additional Information (Optional)</h3>
                <div className="form-group full-width">
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    placeholder="Any additional information you'd like to share..."
                    rows="3"
                  />
                </div>
              </section>

              {/* Agreements */}
              <section className="form-section">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className={errors.agreeToTerms ? 'error' : ''}
                    />
                    <span>I agree to the terms and conditions *</span>
                  </label>
                  {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.agreeToUpdates}
                      onChange={(e) => handleInputChange('agreeToUpdates', e.target.checked)}
                    />
                    <span>I agree to receive updates about this event and similar opportunities</span>
                  </label>
                </div>
              </section>

              {/* Error Message */}
              {errors.submit && (
                <div className="error-message submit-error">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <motion.button
                  type="button"
                  className="submit-button"
                  onClick={submitApplication}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Submit Application
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApplicationForm;
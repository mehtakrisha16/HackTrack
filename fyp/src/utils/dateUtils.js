/**
 * Date Utilities for Opportunities
 * Handles date formatting and deadline calculations consistently
 */

/**
 * Parse and validate a date string
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {Date|null} Valid Date object or null
 */
export const parseDate = (dateInput) => {
  if (!dateInput) return null;
  
  try {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Format date for display
 * @param {string|Date} dateInput - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-IN')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput, locale = 'en-IN') => {
  if (!dateInput) return 'No deadline';
  
  const date = parseDate(dateInput);
  if (!date) return 'Invalid date';
  
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format date with time
 * @param {string|Date} dateInput - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-IN')
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateInput, locale = 'en-IN') => {
  if (!dateInput) return 'No date';
  
  const date = parseDate(dateInput);
  if (!date) return 'Invalid date';
  
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate days until deadline
 * @param {string|Date} deadline - Deadline date
 * @returns {number|null} Days until deadline (negative if expired) or null if invalid
 */
export const getDaysUntilDeadline = (deadline) => {
  if (!deadline) return null;
  
  const deadlineDate = parseDate(deadline);
  if (!deadlineDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(deadlineDate);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Format days left in human-readable format
 * @param {number} days - Number of days
 * @returns {string} Formatted string
 */
export const formatDaysLeft = (days) => {
  if (days === null || isNaN(days)) return 'Invalid date';
  if (days < 0) return 'Expired';
  if (days === 0) return 'Due Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
};

/**
 * Check if deadline is urgent (within specified days)
 * @param {string|Date} deadline - Deadline date
 * @param {number} urgentDays - Number of days to consider urgent (default: 7)
 * @returns {boolean} True if urgent
 */
export const isDeadlineUrgent = (deadline, urgentDays = 7) => {
  const days = getDaysUntilDeadline(deadline);
  return days !== null && days > 0 && days <= urgentDays;
};

/**
 * Check if deadline has expired
 * @param {string|Date} deadline - Deadline date
 * @returns {boolean} True if expired
 */
export const isDeadlineExpired = (deadline) => {
  const days = getDaysUntilDeadline(deadline);
  return days !== null && days < 0;
};

/**
 * Get deadline status
 * @param {string|Date} deadline - Deadline date
 * @returns {object} Status object with type and message
 */
export const getDeadlineStatus = (deadline) => {
  const days = getDaysUntilDeadline(deadline);
  
  if (days === null) {
    return { type: 'invalid', message: 'Invalid date', class: 'invalid' };
  }
  
  if (days < 0) {
    return { type: 'expired', message: 'Expired', class: 'expired' };
  }
  
  if (days === 0) {
    return { type: 'today', message: 'Due Today', class: 'critical' };
  }
  
  if (days === 1) {
    return { type: 'tomorrow', message: '1 day left', class: 'critical' };
  }
  
  if (days <= 3) {
    return { type: 'urgent', message: `${days} days left`, class: 'urgent' };
  }
  
  if (days <= 7) {
    return { type: 'soon', message: `${days} days left`, class: 'warning' };
  }
  
  return { type: 'normal', message: `${days} days left`, class: 'normal' };
};

/**
 * Format relative time (e.g., "2 days ago", "in 3 days")
 * @param {string|Date} dateInput - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateInput) => {
  const date = parseDate(dateInput);
  if (!date) return 'Invalid date';
  
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};

/**
 * Check if date is valid
 * @param {string|Date} dateInput - Date to validate
 * @returns {boolean} True if valid
 */
export const isValidDate = (dateInput) => {
  return parseDate(dateInput) !== null;
};

/**
 * Get month and year from date
 * @param {string|Date} dateInput - Date input
 * @returns {string} Formatted month and year
 */
export const formatMonthYear = (dateInput) => {
  const date = parseDate(dateInput);
  if (!date) return 'Invalid date';
  
  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });
};

export default {
  parseDate,
  formatDate,
  formatDateTime,
  getDaysUntilDeadline,
  formatDaysLeft,
  isDeadlineUrgent,
  isDeadlineExpired,
  getDeadlineStatus,
  formatRelativeTime,
  isValidDate,
  formatMonthYear
};

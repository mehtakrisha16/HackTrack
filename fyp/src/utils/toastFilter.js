// Toast filter to prevent duplicate error messages
import { toast as originalToast } from 'react-hot-toast';

const recentToasts = new Map();
const DEBOUNCE_TIME = 2000; // 2 seconds

// Filter function to prevent duplicate toasts
const shouldShowToast = (message, type) => {
  const key = `${type}:${message}`;
  const now = Date.now();
  
  if (recentToasts.has(key)) {
    const lastShown = recentToasts.get(key);
    if (now - lastShown < DEBOUNCE_TIME) {
      return false; // Skip duplicate
    }
  }
  
  recentToasts.set(key, now);
  
  // Clean up old entries
  setTimeout(() => {
    recentToasts.delete(key);
  }, DEBOUNCE_TIME);
  
  return true;
};

// Wrap toast functions with filter
export const toast = {
  success: (message, options) => {
    if (shouldShowToast(message, 'success')) {
      return originalToast.success(message, options);
    }
  },
  error: (message, options) => {
    // Only filter out "Route not found" errors - allow all other errors
    if (message && typeof message === 'string') {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('route not found')) {
        console.log('Suppressed route not found toast');
        return; // Don't show these initialization errors
      }
    }
    
    if (shouldShowToast(message, 'error')) {
      return originalToast.error(message, options);
    }
  },
  loading: (message, options) => {
    return originalToast.loading(message, options);
  },
  custom: (message, options) => {
    return originalToast.custom(message, options);
  },
  dismiss: (toastId) => {
    return originalToast.dismiss(toastId);
  },
  remove: (toastId) => {
    return originalToast.remove(toastId);
  },
};

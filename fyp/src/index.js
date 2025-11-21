import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import App from './App';
import { AppProvider } from './context/AppContext';
import './styles/index.css';

// Suppress console errors related to route not found during development
const originalError = console.error;
console.error = (...args) => {
  const errorMessage = args.join(' ');
  if (errorMessage.includes('Route not found') || 
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('NetworkError')) {
    return; // Suppress these errors
  }
  originalError.apply(console, args);
};

// Clear any existing toasts on page load
toast.dismiss();

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              duration: 2000,
              style: {
                background: '#10b981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            error: {
              duration: 3000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
          }}
          containerStyle={{
            top: 80,
          }}
          gutter={10}
          toastOptions={{
            style: {
              maxWidth: 500,
            },
          }}
        />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
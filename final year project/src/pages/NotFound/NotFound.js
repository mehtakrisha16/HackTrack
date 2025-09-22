import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="container">
        <motion.div 
          className="not-found-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="error-code">404</div>
          <h1>Page Not Found</h1>
          <p>
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track!
          </p>
          
          <div className="not-found-actions">
            <Link to="/">
              <Button icon={<FiHome />} size="large">
                Go Home
              </Button>
            </Link>
            <Button 
              variant="outline" 
              icon={<FiArrowLeft />}
              onClick={() => window.history.back()}
              size="large"
            >
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
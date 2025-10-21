import React from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiStar, FiAward, FiTarget, FiCode, FiGift } from 'react-icons/fi';
import './Badge.css';

const Badge = ({ type, level, title, description, unlocked, progress, rarity = 'common' }) => {
  const getBadgeIcon = () => {
    switch (type) {
      case 'streak':
        return <FiZap />;
      case 'achievement':
        return <FiGift />;
      case 'skill':
        return <FiCode />;
      case 'event':
        return <FiStar />;
      case 'challenge':
        return <FiTarget />;
      default:
        return <FiAward />;
    }
  };

  const getBadgeColor = () => {
    switch (rarity) {
      case 'common':
        return '#6b7280';
      case 'rare':
        return '#3b82f6';
      case 'epic':
        return '#8b5cf6';
      case 'legendary':
        return '#f59e0b';
      case 'mythic':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getRarityGlow = () => {
    switch (rarity) {
      case 'rare':
        return '0 0 20px rgba(59, 130, 246, 0.5)';
      case 'epic':
        return '0 0 25px rgba(139, 92, 246, 0.6)';
      case 'legendary':
        return '0 0 30px rgba(245, 158, 11, 0.7)';
      case 'mythic':
        return '0 0 35px rgba(239, 68, 68, 0.8)';
      default:
        return 'none';
    }
  };

  return (
    <motion.div
      className={`badge ${unlocked ? 'unlocked' : 'locked'} badge-${rarity}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ 
        scale: unlocked ? 1.05 : 1,
        boxShadow: unlocked ? getRarityGlow() : 'none'
      }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="badge-icon" style={{ color: unlocked ? getBadgeColor() : '#9ca3af' }}>
        {getBadgeIcon()}
      </div>
      
      <div className="badge-content">
        <div className="badge-header">
          <h4 className="badge-title">{title}</h4>
          {level && (
            <span className="badge-level">Lv.{level}</span>
          )}
        </div>
        
        <p className="badge-description">{description}</p>
        
        {!unlocked && progress !== undefined && (
          <div className="badge-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}
        
        <div className="badge-rarity">
          <span className={`rarity-label rarity-${rarity}`}>
            {rarity.toUpperCase()}
          </span>
        </div>
      </div>
      
      {unlocked && rarity !== 'common' && (
        <div className="badge-shine" />
      )}
    </motion.div>
  );
};

export default Badge;
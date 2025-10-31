import React from 'react';
import './PointsNotification.css';

/**
 * Points Notification Component
 * Shows animated notification when user earns points
 */
const PointsNotification = ({ points, message, badge = null, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="points-notification">
      <div className="points-notification-content">
        {badge ? (
          <div className="badge-earned">
            <span className="badge-icon">{badge.icon}</span>
            <div className="badge-details">
              <div className="badge-name">{badge.name}</div>
              <div className="badge-points">+{badge.pointsAwarded} points</div>
            </div>
          </div>
        ) : (
          <div className="points-earned">
            <span className="points-icon">🎯</span>
            <div className="points-details">
              <div className="points-value">+{points}</div>
              <div className="points-message">{message}</div>
            </div>
          </div>
        )}
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

/**
 * Points Widget Component
 * Shows current user points and rank
 */
export const PointsWidget = ({ points, rank, tier, streak }) => {
  return (
    <div className="points-widget">
      <div className="widget-header">
        <span className="tier-icon">{tier?.icon}</span>
        <span className="tier-name">{tier?.name}</span>
      </div>
      
      <div className="widget-stats">
        <div className="stat-item">
          <div className="stat-value">{points?.toLocaleString()}</div>
          <div className="stat-label">Points</div>
        </div>
        
        <div className="stat-divider"></div>
        
        <div className="stat-item">
          <div className="stat-value">#{rank}</div>
          <div className="stat-label">Rank</div>
        </div>
      </div>
      
      {streak > 0 && (
        <div className="widget-streak">
          <span className="streak-icon">🔥</span>
          <span className="streak-text">{streak} day streak</span>
        </div>
      )}
    </div>
  );
};

export default PointsNotification;

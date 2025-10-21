import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward, FiTarget, FiInfo } from 'react-icons/fi';
import ReputationSystem from '../../utils/reputationSystem';
import './ReputationScore.css';

const ReputationScore = ({ userActivity = {} }) => {
  const reputationSystem = new ReputationSystem();
  const currentScore = reputationSystem.calculateReputationScore(userActivity);
  const currentTier = reputationSystem.getReputationTier(currentScore);
  const nextTierInfo = reputationSystem.getNextTier(currentScore);
  const breakdown = reputationSystem.getReputationBreakdown(userActivity);
  const insights = reputationSystem.getReputationInsights(userActivity);

  const tierProgress = nextTierInfo 
    ? ((currentScore - currentTier.minScore) / (nextTierInfo.nextTier.minScore - currentTier.minScore)) * 100
    : 100;

  return (
    <div className="reputation-container">
      {/* Current Reputation Score */}
      <motion.div 
        className="reputation-card main-score"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="score-header">
          <div className="score-info">
            <h3>Reputation Score</h3>
            <div className="score-display">
              <span className="score-number">{currentScore.toLocaleString()}</span>
              <span className="score-label">points</span>
            </div>
          </div>
          <div className="tier-badge" style={{ backgroundColor: currentTier.color }}>
            <span className="tier-icon">{currentTier.icon}</span>
            <span className="tier-name">{currentTier.name}</span>
          </div>
        </div>
        
        {nextTierInfo && (
          <div className="progress-section">
            <div className="progress-info">
              <span>Progress to {nextTierInfo.nextTier.name}</span>
              <span>{nextTierInfo.pointsNeeded} points needed</span>
            </div>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                style={{ backgroundColor: currentTier.color }}
                initial={{ width: 0 }}
                animate={{ width: `${tierProgress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Reputation Breakdown */}
      <motion.div 
        className="reputation-card breakdown"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="card-header">
          <FiAward className="header-icon" />
          <h4>Reputation Breakdown</h4>
        </div>
        <div className="breakdown-list">
          {breakdown.length > 0 ? (
            breakdown.map((item, index) => (
              <motion.div 
                key={index} 
                className="breakdown-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <div className="item-info">
                  <span className="item-category">{item.category}</span>
                  <span className="item-description">{item.description}</span>
                </div>
                <span className="item-points">+{item.points}</span>
              </motion.div>
            ))
          ) : (
            <div className="no-activity">
              <FiInfo className="info-icon" />
              <p>Complete activities to earn reputation points!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Reputation Insights */}
      {insights.length > 0 && (
        <motion.div 
          className="reputation-card insights"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="card-header">
            <FiTarget className="header-icon" />
            <h4>Reputation Insights</h4>
          </div>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <motion.div 
                key={index} 
                className={`insight-item priority-${insight.priority}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <FiTrendingUp className="insight-icon" />
                <span className="insight-message">{insight.message}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reputation Tiers Info */}
      <motion.div 
        className="reputation-card tiers-info"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="card-header">
          <FiAward className="header-icon" />
          <h4>Reputation Tiers</h4>
        </div>
        <div className="tiers-list">
          {reputationSystem.reputationTiers.map((tier, index) => (
            <div 
              key={index} 
              className={`tier-item ${currentTier.name === tier.name ? 'current' : ''}`}
            >
              <div className="tier-badge-small" style={{ backgroundColor: tier.color }}>
                <span>{tier.icon}</span>
              </div>
              <div className="tier-details">
                <span className="tier-name">{tier.name}</span>
                <span className="tier-range">
                  {tier.minScore.toLocaleString()} - {tier.maxScore === Infinity ? '∞' : tier.maxScore.toLocaleString()} pts
                </span>
              </div>
              {currentTier.name === tier.name && (
                <span className="current-label">Current</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ReputationScore;
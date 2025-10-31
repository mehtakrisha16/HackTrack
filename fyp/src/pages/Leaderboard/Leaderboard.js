import React, { useState, useEffect } from 'react';
import PointsService from '../../services/pointsService';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [timeframe, setTimeframe] = useState('all-time');
  const [stats, setStats] = useState(null);
  const [myRank, setMyRank] = useState(null);

  const categories = [
    { value: 'all', label: 'Overall', icon: '🏆' },
    { value: 'hackathons', label: 'Hackathons', icon: '💻' },
    { value: 'internships', label: 'Internships', icon: '💼' },
    { value: 'events', label: 'Events', icon: '🎪' },
    { value: 'projects', label: 'Projects', icon: '🛠️' }
  ];

  const timeframes = [
    { value: 'all-time', label: 'All Time' },
    { value: 'monthly', label: 'This Month' },
    { value: 'weekly', label: 'This Week' }
  ];

  useEffect(() => {
    fetchLeaderboard();
    fetchMyRank();
    fetchStats();
  }, [category, timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const result = await PointsService.getLeaderboard(category, timeframe, 50);
      if (result?.success) {
        setLeaderboard(result.data.leaderboard);
      }
    } catch (error) {
      console.error('Fetch leaderboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRank = async () => {
    try {
      const pointsData = await PointsService.getMyPoints();
      if (pointsData?.success) {
        setMyRank(pointsData.data.points);
      }
    } catch (error) {
      console.error('Fetch rank error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await PointsService.getPlatformStats();
      if (result?.success) {
        setStats(result.data.platformStats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankChangeIcon = (change) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  };

  return (
    <div className="leaderboard-page">
      {/* Header */}
      <div className="leaderboard-header">
        <div className="header-content">
          <h1>🏆 Leaderboard</h1>
          <p>Compete with top performers across Mumbai's tech community</p>
        </div>

        {/* Platform Stats */}
        {stats && (
          <div className="platform-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{stats.totalUsers?.toLocaleString()}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{Math.round(stats.avgPoints)}</div>
              <div className="stat-label">Avg Points</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💻</div>
              <div className="stat-value">{stats.totalHackathons}</div>
              <div className="stat-label">Hackathons</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💼</div>
              <div className="stat-value">{stats.totalInternships}</div>
              <div className="stat-label">Internships</div>
            </div>
          </div>
        )}
      </div>

      <div className="leaderboard-container">
        {/* My Rank Card */}
        {myRank && (
          <div className="my-rank-card">
            <div className="rank-badge large">
              <span className="rank-icon">{myRank.reputationTier?.icon}</span>
              <span className="rank-number">#{myRank.currentRank || '—'}</span>
            </div>
            <div className="rank-details">
              <h3>Your Rank</h3>
              <div className="points-display">
                <span className="points-value">{myRank.totalPoints}</span>
                <span className="points-label">points</span>
              </div>
              <div className="tier-badge" style={{ background: myRank.reputationTier?.color }}>
                {myRank.reputationTier?.name}
              </div>
              {myRank.rankChange !== 0 && (
                <div className={`rank-change ${myRank.rankChange > 0 ? 'up' : 'down'}`}>
                  {getRankChangeIcon(myRank.rankChange)}
                  {Math.abs(myRank.rankChange)} places
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="leaderboard-filters">
          <div className="filter-group">
            <label>Category:</label>
            <div className="filter-buttons">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  className={`filter-btn ${category === cat.value ? 'active' : ''}`}
                  onClick={() => setCategory(cat.value)}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Timeframe:</label>
            <div className="filter-buttons">
              {timeframes.map(tf => (
                <button
                  key={tf.value}
                  className={`filter-btn ${timeframe === tf.value ? 'active' : ''}`}
                  onClick={() => setTimeframe(tf.value)}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="leaderboard-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="empty-state">
              <p>No users found for this category</p>
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Points</th>
                  <th>Tier</th>
                  <th>Stats</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={entry.user?._id || index} className={`rank-${entry.rank}`}>
                    <td className="rank-cell">
                      <div className="rank-badge">
                        {getRankBadge(entry.rank)}
                      </div>
                      {entry.rankChange !== 0 && (
                        <span className={`rank-trend ${entry.rankChange > 0 ? 'up' : 'down'}`}>
                          {getRankChangeIcon(entry.rankChange)}
                        </span>
                      )}
                    </td>
                    
                    <td className="user-cell">
                      <div className="user-info">
                        <img 
                          src={entry.user?.profilePicture || `https://ui-avatars.com/api/?name=${entry.user?.name}&background=random`}
                          alt={entry.user?.name}
                          className="user-avatar"
                        />
                        <div className="user-details">
                          <div className="user-name">{entry.user?.name}</div>
                          {entry.user?.education?.university && (
                            <div className="user-college">{entry.user.education.university}</div>
                          )}
                          {entry.user?.location?.city && (
                            <div className="user-location">📍 {entry.user.location.city}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="points-cell">
                      <div className="points-display">
                        <span className="points-value">{entry.points?.toLocaleString()}</span>
                        <span className="points-label">pts</span>
                      </div>
                    </td>
                    
                    <td className="tier-cell">
                      <div 
                        className="tier-badge"
                        style={{ background: entry.reputationTier?.color }}
                      >
                        <span className="tier-icon">{entry.reputationTier?.icon}</span>
                        <span className="tier-name">{entry.reputationTier?.name}</span>
                      </div>
                    </td>
                    
                    <td className="stats-cell">
                      <div className="mini-stats">
                        {entry.activityStats?.hackathonsWon > 0 && (
                          <span className="mini-stat" title="Hackathons Won">
                            🏆 {entry.activityStats.hackathonsWon}
                          </span>
                        )}
                        {entry.activityStats?.internshipsCompleted > 0 && (
                          <span className="mini-stat" title="Internships Completed">
                            💼 {entry.activityStats.internshipsCompleted}
                          </span>
                        )}
                        {entry.activityStats?.eventsAttended > 0 && (
                          <span className="mini-stat" title="Events Attended">
                            🎪 {entry.activityStats.eventsAttended}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="badges-cell">
                      <div className="badges-list">
                        {entry.badges?.slice(0, 3).map((badge, i) => (
                          <span 
                            key={i}
                            className="badge-icon"
                            title={badge.description}
                          >
                            {badge.icon}
                          </span>
                        ))}
                        {entry.badges?.length > 3 && (
                          <span className="badge-more">+{entry.badges.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

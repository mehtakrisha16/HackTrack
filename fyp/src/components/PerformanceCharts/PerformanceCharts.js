import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, 
  FiCalendar, 
  FiTarget, 
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiUsers,
  FiAward
} from 'react-icons/fi';
import './PerformanceCharts.css';

const PerformanceCharts = ({ user = {} }) => {
  const [timeRange, setTimeRange] = useState('3months');
  const [activeChart, setActiveChart] = useState('overview');

  // Generate performance data based on user activity
  const generatePerformanceData = () => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    
    return {
      activityData: [
        { period: 'Jul', events: 2, applications: 1, logins: 15, badges: 1 },
        { period: 'Aug', events: 3, applications: 2, logins: 22, badges: 2 },
        { period: 'Sep', events: 5, applications: 4, logins: 28, badges: 3 },
        { period: 'Oct', events: 4, applications: 3, logins: 31, badges: 2 },
        { period: 'Nov', events: 6, applications: 5, logins: 25, badges: 4 },
        { period: 'Dec', events: 3, applications: 2, logins: 18, badges: 1 }
      ],
      weeklyData: [
        { period: 'Week 1', activities: 8, streak: 5 },
        { period: 'Week 2', activities: 12, streak: 7 },
        { period: 'Week 3', activities: 15, streak: 6 },
        { period: 'Week 4', activities: 10, streak: 4 }
      ],
      categoryBreakdown: [
        { category: 'Hackathons', value: 35, color: '#4f46e5' },
        { category: 'Internships', value: 25, color: '#059669' },
        { category: 'Events', value: 20, color: '#dc2626' },
        { category: 'Networking', value: 15, color: '#7c3aed' },
        { category: 'Learning', value: 5, color: '#ea580c' }
      ],
      skillProgress: [
        { skill: 'JavaScript', current: 85, target: 95, growth: 15 },
        { skill: 'React', current: 80, target: 90, growth: 20 },
        { skill: 'Node.js', current: 75, target: 85, growth: 10 },
        { skill: 'MongoDB', current: 70, target: 80, growth: 12 },
        { skill: 'Python', current: 65, target: 75, growth: 8 }
      ]
    };
  };

  const data = generatePerformanceData();

  // Calculate performance metrics
  const calculateMetrics = () => {
    const totalActivities = data.activityData.reduce((sum, item) => 
      sum + item.events + item.applications, 0);
    const totalLogins = data.activityData.reduce((sum, item) => sum + item.logins, 0);
    const totalBadges = data.activityData.reduce((sum, item) => sum + item.badges, 0);
    const avgActivitiesPerMonth = Math.round(totalActivities / data.activityData.length);
    
    return {
      totalActivities,
      totalLogins,
      totalBadges,
      avgActivitiesPerMonth,
      growthRate: '+23%',
      engagementScore: 87
    };
  };

  const metrics = calculateMetrics();

  const chartTypes = [
    { key: 'overview', label: 'Overview', icon: FiBarChart2 },
    { key: 'activity', label: 'Activity Trends', icon: FiTrendingUp },
    { key: 'breakdown', label: 'Category Breakdown', icon: FiPieChart },
    { key: 'skills', label: 'Skill Progress', icon: FiTarget }
  ];

  const timeRanges = [
    { key: '1month', label: '1 Month' },
    { key: '3months', label: '3 Months' },
    { key: '6months', label: '6 Months' },
    { key: '1year', label: '1 Year' }
  ];

  const getMaxValue = (dataArray, key) => {
    return Math.max(...dataArray.map(item => item[key]));
  };

  const renderBarChart = (data, keys, colors) => {
    const maxValue = Math.max(...data.flatMap(item => keys.map(key => item[key])));
    
    return (
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-group">
            <div className="bars">
              {keys.map((key, keyIndex) => (
                <motion.div
                  key={key}
                  className="bar"
                  style={{ backgroundColor: colors[keyIndex] }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(item[key] / maxValue) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  title={`${key}: ${item[key]}`}
                />
              ))}
            </div>
            <span className="bar-label">{item.period}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderLineChart = (data, key, color) => {
    const maxValue = getMaxValue(data, key);
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: 100 - (item[key] / maxValue) * 80
    }));

    const pathData = points.reduce((path, point, index) => {
      return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
    }, '');

    return (
      <div className="line-chart">
        <svg viewBox="0 0 100 100" className="chart-svg">
          <motion.path
            d={pathData}
            stroke={color}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          {points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          ))}
        </svg>
        <div className="chart-labels">
          {data.map((item, index) => (
            <span key={index} className="chart-label">
              {item.period}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = (data) => {
    let cumulativePercentage = 0;
    
    return (
      <div className="pie-chart-container">
        <svg viewBox="0 0 200 200" className="pie-chart">
          {data.map((item, index) => {
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + item.value) * 3.6;
            cumulativePercentage += item.value;
            
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;
            
            const largeArcFlag = item.value > 50 ? 1 : 0;
            
            const x1 = 100 + 80 * Math.cos(startAngleRad);
            const y1 = 100 + 80 * Math.sin(startAngleRad);
            const x2 = 100 + 80 * Math.cos(endAngleRad);
            const y2 = 100 + 80 * Math.sin(endAngleRad);
            
            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            return (
              <motion.path
                key={index}
                d={pathData}
                fill={item.color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            );
          })}
        </svg>
        <div className="pie-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: item.color }}
              />
              <span className="legend-label">{item.category}</span>
              <span className="legend-value">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="performance-charts">
      {/* Header */}
      <motion.div 
        className="charts-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h3>
            <FiBarChart2 className="header-icon" />
            Performance Analytics
          </h3>
          <p>Track your progress and achievements over time</p>
        </div>
        
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            {timeRanges.map(range => (
              <option key={range.key} value={range.key}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div 
        className="metrics-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="metric-card">
          <FiActivity className="metric-icon" />
          <div className="metric-info">
            <span className="metric-value">{metrics.totalActivities}</span>
            <span className="metric-label">Total Activities</span>
          </div>
        </div>

        <div className="metric-card">
          <FiUsers className="metric-icon" />
          <div className="metric-info">
            <span className="metric-value">{metrics.totalLogins}</span>
            <span className="metric-label">Platform Visits</span>
          </div>
        </div>

        <div className="metric-card">
          <FiAward className="metric-icon" />
          <div className="metric-info">
            <span className="metric-value">{metrics.totalBadges}</span>
            <span className="metric-label">Badges Earned</span>
          </div>
        </div>

        <div className="metric-card">
          <FiTrendingUp className="metric-icon" />
          <div className="metric-info">
            <span className="metric-value">{metrics.growthRate}</span>
            <span className="metric-label">Growth Rate</span>
          </div>
        </div>
      </motion.div>

      {/* Chart Navigation */}
      <motion.div 
        className="chart-navigation"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {chartTypes.map(chart => (
          <button
            key={chart.key}
            className={`chart-nav-btn ${activeChart === chart.key ? 'active' : ''}`}
            onClick={() => setActiveChart(chart.key)}
          >
            <chart.icon size={18} />
            {chart.label}
          </button>
        ))}
      </motion.div>

      {/* Chart Content */}
      <motion.div 
        className="chart-content"
        key={activeChart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {activeChart === 'overview' && (
          <div className="chart-section">
            <h4>Activity Overview</h4>
            <div className="chart-wrapper">
              {renderBarChart(
                data.activityData, 
                ['events', 'applications'], 
                ['#4f46e5', '#059669']
              )}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#4f46e5' }} />
                <span>Events Attended</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#059669' }} />
                <span>Applications Submitted</span>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'activity' && (
          <div className="chart-section">
            <h4>Activity Trends</h4>
            <div className="chart-wrapper">
              {renderLineChart(data.activityData, 'logins', '#7c3aed')}
            </div>
            <p className="chart-description">
              Platform engagement over the last 6 months
            </p>
          </div>
        )}

        {activeChart === 'breakdown' && (
          <div className="chart-section">
            <h4>Activity Category Breakdown</h4>
            <div className="chart-wrapper">
              {renderPieChart(data.categoryBreakdown)}
            </div>
          </div>
        )}

        {activeChart === 'skills' && (
          <div className="chart-section">
            <h4>Skill Progress Tracking</h4>
            <div className="skills-progress">
              {data.skillProgress.map((skill, index) => (
                <motion.div 
                  key={skill.skill} 
                  className="skill-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="skill-header">
                    <span className="skill-name">{skill.skill}</span>
                    <span className="skill-percentage">{skill.current}%</span>
                  </div>
                  <div className="skill-bar">
                    <motion.div 
                      className="skill-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.current}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                    <div 
                      className="skill-target" 
                      style={{ left: `${skill.target}%` }}
                      title={`Target: ${skill.target}%`}
                    />
                  </div>
                  <div className="skill-stats">
                    <span className="skill-growth">+{skill.growth}% this month</span>
                    <span className="skill-target-label">Target: {skill.target}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PerformanceCharts;
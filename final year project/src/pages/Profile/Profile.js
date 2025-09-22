import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Profile.css';

const Profile = () => {
  const [user] = useState({
    name: "Arjun Sharma",
    email: "arjun.sharma@student.edu",
    university: "IIT Bombay",
    year: "3rd Year",
    branch: "Computer Science",
    location: "Mumbai, Maharashtra",
    skills: ["React", "Node.js", "Python", "Machine Learning", "Data Science"],
    interests: ["FinTech", "AI/ML", "Blockchain", "IoT"],
    achievements: [
      { title: "Winner - TCS CodeVita", date: "Dec 2023", badge: "🏆" },
      { title: "Finalist - Smart India Hackathon", date: "Oct 2023", badge: "🥈" },
      { title: "Intern - Reliance Jio", date: "Summer 2023", badge: "💼" },
      { title: "Top 100 - ICPC Mumbai Regional", date: "Sep 2023", badge: "🏅" }
    ],
    stats: {
      eventsAttended: 15,
      hackathonsWon: 3,
      internshipsCompleted: 2,
      networksBuilt: 45
    }
  });

  const [activeTab, setActiveTab] = useState('overview');

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="profile">
      <div className="profile-bg">
        <svg viewBox="0 0 1200 400" className="profile-bg-svg">
          {/* Mumbai skyline silhouette */}
          <defs>
            <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <path d="M0,300 L100,280 L200,250 L300,260 L400,240 L500,220 L600,200 L700,180 L800,160 L900,170 L1000,150 L1100,140 L1200,130 L1200,400 L0,400 Z" fill="url(#profileGradient)" opacity="0.1"/>
          <circle cx="1000" cy="100" r="30" fill="url(#profileGradient)" opacity="0.3"/>
          <circle cx="950" cy="120" r="20" fill="url(#profileGradient)" opacity="0.2"/>
        </svg>
      </div>

      <div className="container">
        <motion.div 
          className="profile-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Header */}
          <motion.div 
            className="profile-header"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="profile-avatar">
              <img 
                src="/images/avatar-placeholder.jpg" 
                alt="Profile" 
                onError={(e) => {
                  e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%234f46e5"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="35" font-family="Arial">${user.name.charAt(0)}</text></svg>`;
                }}
              />
              <div className="profile-status"></div>
            </div>
            <div className="profile-info">
              <h1>{user.name}</h1>
              <p className="profile-title">{user.branch} • {user.university}</p>
              <p className="profile-location">📍 {user.location}</p>
              <div className="profile-stats-mini">
                <span>{user.stats.eventsAttended} Events</span>
                <span>{user.stats.hackathonsWon} Wins</span>
                <span>{user.stats.networksBuilt} Connections</span>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="profile-tabs">
            {['overview', 'achievements', 'skills', 'activity'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            className="tab-content"
          >
            {activeTab === 'overview' && (
              <div className="overview-grid">
                <div className="stats-card">
                  <h3>Quick Stats</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-number">{user.stats.eventsAttended}</span>
                      <span className="stat-label">Events Attended</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{user.stats.hackathonsWon}</span>
                      <span className="stat-label">Hackathons Won</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{user.stats.internshipsCompleted}</span>
                      <span className="stat-label">Internships</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{user.stats.networksBuilt}</span>
                      <span className="stat-label">Network Built</span>
                    </div>
                  </div>
                </div>

                <div className="interests-card">
                  <h3>Interests</h3>
                  <div className="interests-tags">
                    {user.interests.map((interest, index) => (
                      <span key={index} className="interest-tag">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="recent-activity">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    <div className="activity-item">
                      <span className="activity-icon">🎯</span>
                      <div>
                        <p>Registered for TCS Digital Hackathon 2024</p>
                        <span className="activity-time">2 days ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <span className="activity-icon">🏆</span>
                      <div>
                        <p>Won Best Innovation Award at IIT Bombay TechFest</p>
                        <span className="activity-time">1 week ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <span className="activity-icon">💼</span>
                      <div>
                        <p>Applied for internship at Zomato Mumbai</p>
                        <span className="activity-time">2 weeks ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="achievements-grid">
                {user.achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    className="achievement-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="achievement-badge">{achievement.badge}</span>
                    <h4>{achievement.title}</h4>
                    <p>{achievement.date}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="skills-section">
                <h3>Technical Skills</h3>
                <div className="skills-grid">
                  {user.skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      className="skill-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="skill-name">{skill}</span>
                      <div className="skill-bar">
                        <div 
                          className="skill-progress"
                          style={{ width: `${85 - (index * 5)}%` }}
                        ></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="activity-timeline">
                <h3>Activity Timeline</h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>Joined HackTrack Mumbai</h4>
                      <p>Started exploring tech opportunities in Mumbai</p>
                      <span className="timeline-date">Jan 2024</span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>First Hackathon Win</h4>
                      <p>Won TCS CodeVita with innovative FinTech solution</p>
                      <span className="timeline-date">Dec 2023</span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>Summer Internship</h4>
                      <p>Completed internship at Reliance Jio, Mumbai</p>
                      <span className="timeline-date">Jul 2023</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
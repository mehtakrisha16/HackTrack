import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCode, 
  FiTrendingUp, 
  FiTarget, 
  FiStar,
  FiPlus,
  FiEdit3,
  FiCheck,
  FiX,
  FiAward,
  FiBookOpen
} from 'react-icons/fi';
import './SkillProgression.css';

const SkillProgression = ({ user = {} }) => {
  const [skills, setSkills] = useState([]);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 0, category: 'frontend' });
  const [editingSkill, setEditingSkill] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Initialize skills with sample data
  useEffect(() => {
    const initialSkills = [
      {
        id: 1,
        name: 'JavaScript',
        level: 85,
        category: 'frontend',
        target: 95,
        experience: '2 years',
        projects: 12,
        certifications: ['JavaScript Fundamentals'],
        trend: 'up',
        monthlyGrowth: 8,
        color: '#f7df1e'
      },
      {
        id: 2,
        name: 'React',
        level: 78,
        category: 'frontend',
        target: 90,
        experience: '1.5 years',
        projects: 8,
        certifications: ['React Developer'],
        trend: 'up',
        monthlyGrowth: 12,
        color: '#61dafb'
      },
      {
        id: 3,
        name: 'Node.js',
        level: 72,
        category: 'backend',
        target: 85,
        experience: '1 year',
        projects: 6,
        certifications: [],
        trend: 'up',
        monthlyGrowth: 6,
        color: '#339933'
      },
      {
        id: 4,
        name: 'MongoDB',
        level: 65,
        category: 'database',
        target: 80,
        experience: '8 months',
        projects: 4,
        certifications: [],
        trend: 'stable',
        monthlyGrowth: 3,
        color: '#47a248'
      },
      {
        id: 5,
        name: 'Python',
        level: 60,
        category: 'backend',
        target: 75,
        experience: '6 months',
        projects: 3,
        certifications: [],
        trend: 'up',
        monthlyGrowth: 10,
        color: '#3776ab'
      },
      {
        id: 6,
        name: 'AWS',
        level: 45,
        category: 'cloud',
        target: 70,
        experience: '4 months',
        projects: 2,
        certifications: [],
        trend: 'up',
        monthlyGrowth: 15,
        color: '#ff9900'
      }
    ];
    setSkills(initialSkills);
  }, []);

  const skillCategories = [
    { key: 'all', label: 'All Skills', color: '#6b7280' },
    { key: 'frontend', label: 'Frontend', color: '#3b82f6' },
    { key: 'backend', label: 'Backend', color: '#10b981' },
    { key: 'database', label: 'Database', color: '#8b5cf6' },
    { key: 'cloud', label: 'Cloud', color: '#f59e0b' },
    { key: 'mobile', label: 'Mobile', color: '#ef4444' },
    { key: 'devops', label: 'DevOps', color: '#06b6d4' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredSkills = selectedCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory);

  const getSkillLevelLabel = (level) => {
    if (level >= 90) return 'Expert';
    if (level >= 75) return 'Advanced';
    if (level >= 50) return 'Intermediate';
    if (level >= 25) return 'Beginner';
    return 'Novice';
  };

  const getSkillLevelColor = (level) => {
    if (level >= 90) return '#dc2626';
    if (level >= 75) return '#ea580c';
    if (level >= 50) return '#d97706';
    if (level >= 25) return '#059669';
    return '#6b7280';
  };

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      const skill = {
        id: Date.now(),
        ...newSkill,
        target: Math.min(100, newSkill.level + 20),
        experience: '0 months',
        projects: 0,
        certifications: [],
        trend: 'new',
        monthlyGrowth: 0,
        color: skillCategories.find(cat => cat.key === newSkill.category)?.color || '#6b7280'
      };
      setSkills([...skills, skill]);
      setNewSkill({ name: '', level: 0, category: 'frontend' });
      setIsAddingSkill(false);
    }
  };

  const handleEditSkill = (skillId, updates) => {
    setSkills(skills.map(skill => 
      skill.id === skillId ? { ...skill, ...updates } : skill
    ));
    setEditingSkill(null);
  };

  const calculateOverallProgress = () => {
    if (skills.length === 0) return 0;
    const totalProgress = skills.reduce((sum, skill) => sum + skill.level, 0);
    return Math.round(totalProgress / skills.length);
  };

  const getTopSkills = () => {
    return [...skills]
      .sort((a, b) => b.level - a.level)
      .slice(0, 3);
  };

  const getGrowingSkills = () => {
    return [...skills]
      .filter(skill => skill.monthlyGrowth > 0)
      .sort((a, b) => b.monthlyGrowth - a.monthlyGrowth)
      .slice(0, 3);
  };

  return (
    <div className="skill-progression">
      {/* Header */}
      <motion.div 
        className="skills-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h3>
            <FiCode className="header-icon" />
            Skill Progression
          </h3>
          <p>Track and visualize your technical skill development</p>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'chart' ? 'active' : ''}`}
              onClick={() => setViewMode('chart')}
            >
              Chart
            </button>
          </div>
          <button 
            className="add-skill-btn"
            onClick={() => setIsAddingSkill(true)}
          >
            <FiPlus size={16} />
            Add Skill
          </button>
        </div>
      </motion.div>

      {/* Skills Overview */}
      <motion.div 
        className="skills-overview"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="overview-card">
          <FiTarget className="overview-icon" />
          <div className="overview-info">
            <span className="overview-value">{calculateOverallProgress()}%</span>
            <span className="overview-label">Overall Progress</span>
          </div>
        </div>

        <div className="overview-card">
          <FiStar className="overview-icon" />
          <div className="overview-info">
            <span className="overview-value">{skills.length}</span>
            <span className="overview-label">Total Skills</span>
          </div>
        </div>

        <div className="overview-card">
          <FiTrendingUp className="overview-icon" />
          <div className="overview-info">
            <span className="overview-value">{getGrowingSkills().length}</span>
            <span className="overview-label">Growing Skills</span>
          </div>
        </div>

        <div className="overview-card">
          <FiAward className="overview-icon" />
          <div className="overview-info">
            <span className="overview-value">{skills.filter(s => s.level >= 75).length}</span>
            <span className="overview-label">Advanced Skills</span>
          </div>
        </div>
      </motion.div>

      {/* Category Filters */}
      <motion.div 
        className="category-filters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {skillCategories.map(category => (
          <button
            key={category.key}
            className={`category-btn ${selectedCategory === category.key ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.key)}
            style={{ 
              '--category-color': category.color,
              borderColor: selectedCategory === category.key ? category.color : '#e5e7eb'
            }}
          >
            {category.label}
            <span className="category-count">
              {category.key === 'all' ? skills.length : skills.filter(s => s.category === category.key).length}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Add Skill Modal */}
      {isAddingSkill && (
        <motion.div 
          className="add-skill-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="modal-content">
            <h4>Add New Skill</h4>
            <div className="modal-form">
              <input
                type="text"
                placeholder="Skill name (e.g., TypeScript)"
                value={newSkill.name}
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
              />
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
              >
                {skillCategories.slice(1).map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
              <input
                type="range"
                min="0"
                max="100"
                value={newSkill.level}
                onChange={(e) => setNewSkill({...newSkill, level: parseInt(e.target.value)})}
              />
              <span className="level-display">Current Level: {newSkill.level}%</span>
            </div>
            <div className="modal-actions">
              <button onClick={handleAddSkill} className="confirm-btn">
                <FiCheck size={16} /> Add Skill
              </button>
              <button onClick={() => setIsAddingSkill(false)} className="cancel-btn">
                <FiX size={16} /> Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Skills Content */}
      <motion.div 
        className="skills-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {viewMode === 'grid' ? (
          <div className="skills-grid">
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                className="skill-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="skill-header">
                  <div className="skill-info">
                    <div 
                      className="skill-color-indicator"
                      style={{ backgroundColor: skill.color }}
                    />
                    <div>
                      <h4 className="skill-name">{skill.name}</h4>
                      <span className="skill-category">{skill.category}</span>
                    </div>
                  </div>
                  <button 
                    className="edit-skill-btn"
                    onClick={() => setEditingSkill(skill.id)}
                  >
                    <FiEdit3 size={14} />
                  </button>
                </div>

                <div className="skill-progress-section">
                  <div className="progress-header">
                    <span className="current-level">{skill.level}%</span>
                    <span className="skill-level-label" style={{ color: getSkillLevelColor(skill.level) }}>
                      {getSkillLevelLabel(skill.level)}
                    </span>
                  </div>
                  
                  <div className="skill-progress-bar">
                    <motion.div 
                      className="progress-fill"
                      style={{ backgroundColor: skill.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                    <div 
                      className="target-marker"
                      style={{ left: `${skill.target}%` }}
                      title={`Target: ${skill.target}%`}
                    />
                  </div>
                  
                  <div className="progress-footer">
                    <span className="target-info">Target: {skill.target}%</span>
                    {skill.trend === 'up' && (
                      <span className="growth-info">
                        <FiTrendingUp size={12} />
                        +{skill.monthlyGrowth}% this month
                      </span>
                    )}
                  </div>
                </div>

                <div className="skill-details">
                  <div className="detail-item">
                    <span className="detail-label">Experience</span>
                    <span className="detail-value">{skill.experience}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Projects</span>
                    <span className="detail-value">{skill.projects}</span>
                  </div>
                  {skill.certifications.length > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Certifications</span>
                      <span className="detail-value">{skill.certifications.length}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="skills-chart">
            <div className="chart-container">
              <div className="chart-grid">
                {filteredSkills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    className="chart-bar"
                    initial={{ height: 0 }}
                    animate={{ height: `${skill.level}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    style={{ backgroundColor: skill.color }}
                  >
                    <div className="bar-label">
                      <span className="bar-skill-name">{skill.name}</span>
                      <span className="bar-level">{skill.level}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Skills Insights */}
      <motion.div 
        className="skills-insights"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="insight-section">
          <h4>
            <FiStar className="section-icon" />
            Top Skills
          </h4>
          <div className="top-skills">
            {getTopSkills().map((skill, index) => (
              <div key={skill.id} className="top-skill-item">
                <span className="skill-rank">#{index + 1}</span>
                <div className="skill-mini-info">
                  <span className="skill-mini-name">{skill.name}</span>
                  <span className="skill-mini-level">{skill.level}%</span>
                </div>
                <div 
                  className="skill-mini-bar"
                  style={{ 
                    width: `${skill.level}%`,
                    backgroundColor: skill.color 
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="insight-section">
          <h4>
            <FiTrendingUp className="section-icon" />
            Growing Skills
          </h4>
          <div className="growing-skills">
            {getGrowingSkills().map((skill) => (
              <div key={skill.id} className="growing-skill-item">
                <div className="skill-mini-info">
                  <span className="skill-mini-name">{skill.name}</span>
                  <span className="skill-growth">+{skill.monthlyGrowth}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SkillProgression;
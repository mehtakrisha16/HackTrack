import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './FilterPanel.css';

const FilterPanel = ({ onFilterChange, opportunityType = 'all' }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    domain: true,
    location: true,
    deadline: true,
    difficulty: false,
    prize: false
  });

  const [filters, setFilters] = useState({
    domains: [],
    locations: [],
    deadlines: [],
    difficulties: [],
    prizeRange: [],
    companies: [],
    mode: []
  });

  const filterOptions = {
    domains: [
      { value: 'Web Development', label: '🌐 Web Development', count: 15 },
      { value: 'Mobile Development', label: '📱 Mobile Development', count: 8 },
      { value: 'AI/ML', label: '🤖 AI/ML', count: 12 },
      { value: 'Data Science', label: '📊 Data Science', count: 10 },
      { value: 'Cybersecurity', label: '🔒 Cybersecurity', count: 6 },
      { value: 'Cloud Computing', label: '☁️ Cloud Computing', count: 7 },
      { value: 'DevOps', label: '⚙️ DevOps', count: 5 },
      { value: 'Blockchain', label: '🔗 Blockchain', count: 4 },
      { value: 'IoT', label: '📡 IoT', count: 5 },
      { value: 'Game Development', label: '🎮 Game Development', count: 3 },
      { value: 'AR/VR', label: '🥽 AR/VR', count: 2 },
      { value: 'Electronics', label: '⚡ Electronics', count: 8 },
      { value: 'Mechanical', label: '⚙️ Mechanical', count: 6 },
      { value: 'Civil', label: '🏗️ Civil', count: 4 },
      { value: 'Electrical', label: '💡 Electrical', count: 5 },
      { value: 'Management', label: '📈 Management', count: 7 },
      { value: 'Finance', label: '💰 Finance', count: 6 },
      { value: 'Marketing', label: '📣 Marketing', count: 5 },
      { value: 'Design', label: '🎨 Design', count: 8 }
    ],
    locations: [
      { value: 'Mumbai', label: '🏙️ Mumbai', count: 8 },
      { value: 'Bangalore', label: '🌆 Bangalore', count: 12 },
      { value: 'Delhi NCR', label: '🏛️ Delhi NCR', count: 10 },
      { value: 'Hyderabad', label: '🌇 Hyderabad', count: 6 },
      { value: 'Pune', label: '🏢 Pune', count: 5 },
      { value: 'Chennai', label: '🏘️ Chennai', count: 4 },
      { value: 'Kolkata', label: '🌉 Kolkata', count: 3 },
      { value: 'Online', label: '💻 Online/Remote', count: 15 }
    ],
    deadlines: [
      { value: 'today', label: '⚡ Due Today', count: 2 },
      { value: 'thisweek', label: '🔥 This Week (7 days)', count: 5 },
      { value: 'thismonth', label: '📅 This Month', count: 12 },
      { value: 'next3months', label: '🗓️ Next 3 Months', count: 23 }
    ],
    difficulties: [
      { value: 'beginner', label: '🟢 Beginner', count: 8 },
      { value: 'intermediate', label: '🟡 Intermediate', count: 12 },
      { value: 'advanced', label: '🔴 Advanced', count: 6 }
    ],
    prizeRanges: [
      { value: 'under50k', label: '💰 Under ₹50,000', count: 5 },
      { value: '50kto1L', label: '💎 ₹50k - ₹1 Lakh', count: 8 },
      { value: '1Lto3L', label: '💵 ₹1L - ₹3 Lakhs', count: 7 },
      { value: 'above3L', label: '🏆 Above ₹3 Lakhs', count: 3 }
    ],
    modes: [
      { value: 'in-person', label: '🏢 In-Person', count: 15 },
      { value: 'online', label: '💻 Online', count: 10 },
      { value: 'hybrid', label: '🔄 Hybrid', count: 8 }
    ]
  };

  const handleFilterChange = (category, value) => {
    const newFilters = { ...filters };
    
    if (newFilters[category].includes(value)) {
      newFilters[category] = newFilters[category].filter(v => v !== value);
    } else {
      newFilters[category] = [...newFilters[category], value];
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      domains: [],
      locations: [],
      deadlines: [],
      difficulties: [],
      prizeRange: [],
      companies: [],
      mode: []
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className={`filter-panel ${isOpen ? 'open' : 'collapsed'}`}>
      {/* Filter Header */}
      <div className="filter-header">
        <div className="filter-title">
          <FiFilter size={20} />
          <h3>Filters</h3>
          {activeCount > 0 && (
            <span className="filter-count">{activeCount}</span>
          )}
        </div>
        <div className="filter-actions">
          {activeCount > 0 && (
            <button 
              className="clear-all-btn"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          )}
          <button 
            className="toggle-btn"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={20} /> : <FiChevronDown size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="filter-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Domain Filter */}
            <div className="filter-section">
              <button 
                className="filter-section-header"
                onClick={() => toggleSection('domain')}
              >
                <span>🎯 Engineering Domain</span>
                {expandedSections.domain ? 
                  <FiChevronUp size={18} /> : 
                  <FiChevronDown size={18} />
                }
              </button>
              
              <AnimatePresence>
                {expandedSections.domain && (
                  <motion.div
                    className="filter-options"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {filterOptions.domains.map(option => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={filters.domains.includes(option.value)}
                          onChange={() => handleFilterChange('domains', option.value)}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="option-label">{option.label}</span>
                        <span className="option-count">({option.count})</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Location Filter */}
            <div className="filter-section">
              <button 
                className="filter-section-header"
                onClick={() => toggleSection('location')}
              >
                <span>📍 Location</span>
                {expandedSections.location ? 
                  <FiChevronUp size={18} /> : 
                  <FiChevronDown size={18} />
                }
              </button>
              
              <AnimatePresence>
                {expandedSections.location && (
                  <motion.div
                    className="filter-options"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {filterOptions.locations.map(option => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={filters.locations.includes(option.value)}
                          onChange={() => handleFilterChange('locations', option.value)}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="option-label">{option.label}</span>
                        <span className="option-count">({option.count})</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Deadline Filter */}
            <div className="filter-section">
              <button 
                className="filter-section-header"
                onClick={() => toggleSection('deadline')}
              >
                <span>⏰ Deadline</span>
                {expandedSections.deadline ? 
                  <FiChevronUp size={18} /> : 
                  <FiChevronDown size={18} />
                }
              </button>
              
              <AnimatePresence>
                {expandedSections.deadline && (
                  <motion.div
                    className="filter-options"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {filterOptions.deadlines.map(option => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={filters.deadlines.includes(option.value)}
                          onChange={() => handleFilterChange('deadlines', option.value)}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="option-label">{option.label}</span>
                        <span className="option-count">({option.count})</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Difficulty Filter */}
            <div className="filter-section">
              <button 
                className="filter-section-header"
                onClick={() => toggleSection('difficulty')}
              >
                <span>📊 Difficulty</span>
                {expandedSections.difficulty ? 
                  <FiChevronUp size={18} /> : 
                  <FiChevronDown size={18} />
                }
              </button>
              
              <AnimatePresence>
                {expandedSections.difficulty && (
                  <motion.div
                    className="filter-options"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {filterOptions.difficulties.map(option => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={filters.difficulties.includes(option.value)}
                          onChange={() => handleFilterChange('difficulties', option.value)}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="option-label">{option.label}</span>
                        <span className="option-count">({option.count})</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Prize/Stipend Range (for hackathons/internships) */}
            {opportunityType !== 'events' && (
              <div className="filter-section">
                <button 
                  className="filter-section-header"
                  onClick={() => toggleSection('prize')}
                >
                  <span>💰 {opportunityType === 'internships' ? 'Stipend' : 'Prize'} Range</span>
                  {expandedSections.prize ? 
                    <FiChevronUp size={18} /> : 
                    <FiChevronDown size={18} />
                  }
                </button>
                
                <AnimatePresence>
                  {expandedSections.prize && (
                    <motion.div
                      className="filter-options"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {filterOptions.prizeRanges.map(option => (
                        <label key={option.value} className="filter-option">
                          <input
                            type="checkbox"
                            checked={filters.prizeRange.includes(option.value)}
                            onChange={() => handleFilterChange('prizeRange', option.value)}
                          />
                          <span className="checkbox-custom"></span>
                          <span className="option-label">{option.label}</span>
                          <span className="option-count">({option.count})</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mode Filter */}
            <div className="filter-section">
              <button 
                className="filter-section-header"
                onClick={() => toggleSection('mode')}
              >
                <span>🔄 Mode</span>
                {expandedSections.mode ? 
                  <FiChevronUp size={18} /> : 
                  <FiChevronDown size={18} />
                }
              </button>
              
              <AnimatePresence>
                {expandedSections.mode && (
                  <motion.div
                    className="filter-options"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {filterOptions.modes.map(option => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={filters.mode.includes(option.value)}
                          onChange={() => handleFilterChange('mode', option.value)}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="option-label">{option.label}</span>
                        <span className="option-count">({option.count})</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterPanel;

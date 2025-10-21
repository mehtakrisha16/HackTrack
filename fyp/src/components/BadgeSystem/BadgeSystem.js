import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiAward } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import Badge from '../Badge';
import './BadgeSystem.css';

const BadgeSystem = () => {
  const { user } = useContext(AppContext);
  const [badges, setBadges] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');

  // Define all available badges
  const allBadges = [
    // Coding Streak Badges
    {
      id: 'streak_beginner',
      type: 'streak',
      level: 1,
      title: 'Code Starter',
      description: 'Complete your first coding session',
      rarity: 'common',
      requirement: 1,
      category: 'coding'
    },
    {
      id: 'streak_week',
      type: 'streak',
      level: 2,
      title: 'Week Warrior',
      description: 'Maintain a 7-day coding streak',
      rarity: 'rare',
      requirement: 7,
      category: 'coding'
    },
    {
      id: 'streak_month',
      type: 'streak',
      level: 3,
      title: 'Monthly Master',
      description: 'Code for 30 consecutive days',
      rarity: 'epic',
      requirement: 30,
      category: 'coding'
    },
    {
      id: 'streak_100',
      type: 'streak',
      level: 4,
      title: 'Century Coder',
      description: 'Achieve a 100-day coding streak',
      rarity: 'legendary',
      requirement: 100,
      category: 'coding'
    },
    {
      id: 'streak_365',
      type: 'streak',
      level: 5,
      title: 'Legendary Streaker',
      description: 'Code every day for a full year',
      rarity: 'mythic',
      requirement: 365,
      category: 'coding'
    },

    // Event Participation Badges
    {
      id: 'event_first',
      type: 'event',
      level: 1,
      title: 'Event Explorer',
      description: 'Participate in your first event',
      rarity: 'common',
      requirement: 1,
      category: 'events'
    },
    {
      id: 'event_5',
      type: 'event',
      level: 2,
      title: 'Active Participant',
      description: 'Join 5 different events',
      rarity: 'rare',
      requirement: 5,
      category: 'events'
    },
    {
      id: 'event_10',
      type: 'event',
      level: 3,
      title: 'Event Enthusiast',
      description: 'Participate in 10+ events',
      rarity: 'epic',
      requirement: 10,
      category: 'events'
    },

    // Hackathon Badges
    {
      id: 'hack_first',
      type: 'achievement',
      level: 1,
      title: 'Hackathon Rookie',
      description: 'Complete your first hackathon',
      rarity: 'common',
      requirement: 1,
      category: 'hackathons'
    },
    {
      id: 'hack_winner',
      type: 'achievement',
      level: 3,
      title: 'Victory Achiever',
      description: 'Win a hackathon competition',
      rarity: 'legendary',
      requirement: 1,
      category: 'hackathons'
    },

    // Skill Badges
    {
      id: 'skill_js',
      type: 'skill',
      level: 2,
      title: 'JavaScript Ninja',
      description: 'Master JavaScript programming',
      rarity: 'rare',
      requirement: 1,
      category: 'skills'
    },
    {
      id: 'skill_react',
      type: 'skill',
      level: 2,
      title: 'React Developer',
      description: 'Build projects with React',
      rarity: 'rare',
      requirement: 1,
      category: 'skills'
    },
    {
      id: 'skill_python',
      type: 'skill',
      level: 2,
      title: 'Python Expert',
      description: 'Demonstrate Python proficiency',
      rarity: 'rare',
      requirement: 1,
      category: 'skills'
    },

    // Mumbai Special Badges
    {
      id: 'mumbai_local',
      type: 'achievement',
      level: 1,
      title: 'Mumbai Techie',
      description: 'Active in Mumbai tech community',
      rarity: 'rare',
      requirement: 1,
      category: 'location'
    },
    {
      id: 'iit_bombay',
      type: 'achievement',
      level: 3,
      title: 'IIT Bombay Champion',
      description: 'Excel in IIT Bombay events',
      rarity: 'epic',
      requirement: 1,
      category: 'college'
    }
  ];

  // Calculate user's badge progress and unlocked status
  useEffect(() => {
    const userBadges = allBadges.map(badge => {
      const unlocked = checkBadgeUnlocked(badge);
      const progress = calculateBadgeProgress(badge);
      
      return {
        ...badge,
        unlocked,
        progress: unlocked ? 100 : progress
      };
    });

    setBadges(userBadges);
    setFilteredBadges(userBadges);
  }, [user]);

  // Filter badges based on search and filters
  useEffect(() => {
    let filtered = badges;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(badge =>
        badge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'unlocked') {
        filtered = filtered.filter(badge => badge.unlocked);
      } else if (selectedFilter === 'locked') {
        filtered = filtered.filter(badge => !badge.unlocked);
      } else {
        filtered = filtered.filter(badge => badge.category === selectedFilter);
      }
    }

    // Rarity filter
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(badge => badge.rarity === selectedRarity);
    }

    setFilteredBadges(filtered);
  }, [badges, searchTerm, selectedFilter, selectedRarity]);

  const checkBadgeUnlocked = (badge) => {
    if (!user) return false;

    // Mock user data for demonstration
    const mockUserStats = {
      codingStreak: 15,
      eventsParticipated: 3,
      hackathonsWon: 0,
      skills: ['JavaScript', 'React'],
      location: 'Mumbai',
      college: 'IIT Bombay'
    };

    switch (badge.id) {
      case 'streak_beginner':
        return mockUserStats.codingStreak >= 1;
      case 'streak_week':
        return mockUserStats.codingStreak >= 7;
      case 'streak_month':
        return mockUserStats.codingStreak >= 30;
      case 'streak_100':
        return mockUserStats.codingStreak >= 100;
      case 'streak_365':
        return mockUserStats.codingStreak >= 365;
      case 'event_first':
        return mockUserStats.eventsParticipated >= 1;
      case 'event_5':
        return mockUserStats.eventsParticipated >= 5;
      case 'event_10':
        return mockUserStats.eventsParticipated >= 10;
      case 'hack_first':
        return mockUserStats.eventsParticipated >= 1;
      case 'hack_winner':
        return mockUserStats.hackathonsWon >= 1;
      case 'skill_js':
        return mockUserStats.skills.includes('JavaScript');
      case 'skill_react':
        return mockUserStats.skills.includes('React');
      case 'skill_python':
        return mockUserStats.skills.includes('Python');
      case 'mumbai_local':
        return mockUserStats.location === 'Mumbai';
      case 'iit_bombay':
        return mockUserStats.college === 'IIT Bombay';
      default:
        return false;
    }
  };

  const calculateBadgeProgress = (badge) => {
    if (!user) return 0;

    const mockUserStats = {
      codingStreak: 15,
      eventsParticipated: 3,
      hackathonsWon: 0
    };

    switch (badge.type) {
      case 'streak':
        return Math.min((mockUserStats.codingStreak / badge.requirement) * 100, 100);
      case 'event':
        return Math.min((mockUserStats.eventsParticipated / badge.requirement) * 100, 100);
      default:
        return 0;
    }
  };

  const getUnlockedCount = () => badges.filter(badge => badge.unlocked).length;
  const getTotalCount = () => badges.length;

  return (
    <div className="badge-system">
      <div className="badge-system-header">
        <div className="header-info">
          <FiAward className="header-icon" />
          <div>
            <h2>Achievement Badges</h2>
            <p>{getUnlockedCount()} / {getTotalCount()} badges unlocked</p>
          </div>
        </div>
        
        <div className="badge-stats">
          <div className="stat-item">
            <span className="stat-number">{getUnlockedCount()}</span>
            <span className="stat-label">Unlocked</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{getTotalCount() - getUnlockedCount()}</span>
            <span className="stat-label">To Unlock</span>
          </div>
        </div>
      </div>

      <div className="badge-filters">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search badges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="unlocked">Unlocked</option>
            <option value="locked">Locked</option>
            <option value="coding">Coding</option>
            <option value="events">Events</option>
            <option value="hackathons">Hackathons</option>
            <option value="skills">Skills</option>
            <option value="location">Location</option>
            <option value="college">College</option>
          </select>

          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
            <option value="mythic">Mythic</option>
          </select>
        </div>
      </div>

      <motion.div 
        className="badges-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {filteredBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Badge {...badge} />
          </motion.div>
        ))}
      </motion.div>

      {filteredBadges.length === 0 && (
        <div className="no-badges">
          <FiAward size={48} />
          <h3>No badges found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default BadgeSystem;
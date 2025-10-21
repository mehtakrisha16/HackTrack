import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiBarChart2, 
  FiGlobe, 
  FiMapPin, 
  FiClock,
  FiUsers,
  FiAward,
  FiBriefcase,
  FiExternalLink,
  FiFilter,
  FiSearch,
  FiStar,
  FiCalendar,
  FiHome,
  FiRefreshCw,
  FiLoader
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useOpportunities, useOpportunityStats, useFilterOptions, useScraper } from '../../hooks/useOpportunities';
import './FinTechHub.css';

const FinTechHub = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  // Use custom hooks for real data - get all opportunities for better filtering
  const { 
    opportunities, 
    loading, 
    error, 
    pagination, 
    updateFilters, 
    refresh 
  } = useOpportunities({
    type: '',
    category: '',
    limit: 200 // Get more opportunities for better filtering
  });

  const { stats, loading: statsLoading } = useOpportunityStats();
  const { filterOptions } = useFilterOptions();
  const { triggerScraping, scraping } = useScraper();

  // Auto-refresh data every 5 minutes to get latest scraped opportunities
  useEffect(() => {
    const intervalId = setInterval(() => {
      refresh(); // Refresh opportunities data
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [refresh]);

  // Enhanced static FinTech opportunities 
  const [staticOpportunities] = useState([
    // Add real opportunities that always show
    {
      id: 'fintech-live-1',
      title: 'Campus Ambassador Programme',
      company: 'Credila Financial Services Limited', 
      location: 'India',
      type: 'internship',
      category: 'finance',
      salary: 'Performance Based',
      experience: 'Any Level',
      skills: ['Marketing', 'Sales', 'Communication', 'Campus Relations'],
      description: 'Join Credila as a Campus Ambassador and help students with education loan solutions.',
      requirements: ['Active student', 'Good communication skills', 'Campus network'],
      benefits: ['Performance incentives', 'Certificate', 'Industry exposure', 'Networking'],
      deadline: '2025-12-31',
      postedDate: '2025-10-19',
      rating: 4.3,
      applicants: 245,
      urgent: false,
      remote: false,
      applicationLink: 'https://internshala.com/internship/detail/campus-ambassador-programme-at-credila-financial-services-limited1760426137'
    },
    {
      id: 1,
      title: 'Software Engineer - PayTech',
      company: 'Razorpay',
      location: 'Bengaluru/Mumbai',
      type: 'internship',
      category: 'payments',
      salary: '₹8-12 LPA',
      experience: '0-2 years',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
      description: 'Work on next-generation payment solutions and financial infrastructure.',
      requirements: ['Bachelor\'s in Computer Science', 'Strong programming skills', 'Knowledge of web technologies'],
      benefits: ['Health Insurance', 'Stock Options', 'Learning Budget', 'Flexible Work'],
      deadline: '2024-02-15',
      postedDate: '2024-01-15',
      rating: 4.8,
      applicants: 245,
      urgent: false,
      remote: true
    },
    {
      id: 2,
      title: 'Blockchain Developer',
      company: 'CoinDCX',
      location: 'Mumbai',
      type: 'job',
      category: 'blockchain',
      salary: '₹15-25 LPA',
      experience: '2-4 years',
      skills: ['Solidity', 'Web3.js', 'Ethereum', 'Smart Contracts'],
      description: 'Build and maintain blockchain infrastructure for cryptocurrency exchange.',
      requirements: ['Experience with blockchain technology', 'Smart contract development', 'Security best practices'],
      benefits: ['Crypto Bonuses', 'Health Insurance', 'Learning Opportunities', 'Flexible Hours'],
      deadline: '2024-02-20',
      postedDate: '2024-01-10',
      rating: 4.6,
      applicants: 156,
      urgent: true,
      remote: false
    },
    {
      id: 3,
      title: 'Data Science Hackathon',
      company: 'HDFC Bank',
      location: 'Mumbai',
      type: 'hackathon',
      category: 'data-science',
      salary: 'Prize Pool: ₹5 Lakhs',
      experience: 'All levels',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
      description: 'Build AI/ML solutions for financial services and banking innovations.',
      requirements: ['Team of 2-4 members', 'Background in AI/ML', 'Creative problem solving'],
      benefits: ['Cash Prizes', 'Job Opportunities', 'Mentorship', 'Certificates'],
      deadline: '2024-02-10',
      postedDate: '2024-01-05',
      rating: 4.9,
      applicants: 1250,
      urgent: true,
      remote: false
    },
    {
      id: 4,
      title: 'Product Manager - InsurTech',
      company: 'Policybazaar',
      location: 'Gurgaon/Mumbai',
      type: 'job',
      category: 'product',
      salary: '₹20-30 LPA',
      experience: '3-6 years',
      skills: ['Product Strategy', 'Analytics', 'User Research', 'Agile'],
      description: 'Lead product development for digital insurance solutions.',
      requirements: ['MBA or equivalent', 'Product management experience', 'InsurTech knowledge preferred'],
      benefits: ['Stock Options', 'Health Coverage', 'Learning Budget', 'Wellness Programs'],
      deadline: '2024-02-25',
      postedDate: '2024-01-12',
      rating: 4.4,
      applicants: 89,
      urgent: false,
      remote: true
    },
    {
      id: 5,
      title: 'FinTech Innovation Challenge',
      company: 'NASSCOM',
      location: 'Mumbai',
      type: 'hackathon',
      category: 'innovation',
      salary: 'Prize Pool: ₹10 Lakhs',
      experience: 'All levels',
      skills: ['FinTech', 'Innovation', 'Business Strategy', 'Technology'],
      description: 'National level competition to solve real-world financial challenges.',
      requirements: ['Original ideas', 'Working prototype', 'Business viability'],
      benefits: ['Funding Opportunities', 'Incubation Support', 'Industry Recognition', 'Networking'],
      deadline: '2024-03-01',
      postedDate: '2024-01-08',
      rating: 4.7,
      applicants: 890,
      urgent: false,
      remote: false
    },
    {
      id: 6,
      title: 'Cybersecurity Analyst',
      company: 'Paytm',
      location: 'Noida/Mumbai',
      type: 'internship',
      category: 'security',
      salary: '₹6-10 LPA',
      experience: '0-1 years',
      skills: ['Cybersecurity', 'Penetration Testing', 'SIEM', 'Risk Assessment'],
      description: 'Secure payment infrastructure and protect user data.',
      requirements: ['Cybersecurity certification', 'Knowledge of security frameworks', 'Analytical mindset'],
      benefits: ['Training Programs', 'Certifications', 'Career Growth', 'Health Benefits'],
      deadline: '2024-02-18',
      postedDate: '2024-01-14',
      rating: 4.3,
      applicants: 178,
      urgent: false,
      remote: true
    },
    {
      id: 7,
      title: 'UX Designer - Mobile Banking',
      company: 'PhonePe',
      location: 'Bengaluru/Mumbai',
      type: 'job',
      category: 'design',
      salary: '₹12-18 LPA',
      experience: '2-4 years',
      skills: ['UI/UX Design', 'Figma', 'User Research', 'Mobile Design'],
      description: 'Design intuitive mobile banking experiences for millions of users.',
      requirements: ['Design portfolio', 'Mobile app experience', 'User-centered design approach'],
      benefits: ['Design Tools License', 'Conference Attendance', 'Flexible Work', 'Team Events'],
      deadline: '2024-02-22',
      postedDate: '2024-01-11',
      rating: 4.5,
      applicants: 234,
      urgent: false,
      remote: true
    },
    {
      id: 8,
      title: 'RegTech Compliance Officer',
      company: 'Zerodha',
      location: 'Bengaluru',
      type: 'job',
      category: 'compliance',
      salary: '₹10-16 LPA',
      experience: '1-3 years',
      skills: ['Regulatory Compliance', 'Risk Management', 'Legal Knowledge', 'Process Improvement'],
      description: 'Ensure compliance with financial regulations and manage regulatory risks.',
      requirements: ['Law degree or finance background', 'Understanding of SEBI regulations', 'Attention to detail'],
      benefits: ['Learning Opportunities', 'Health Insurance', 'Professional Development', 'Work-Life Balance'],
      deadline: '2024-02-28',
      postedDate: '2024-01-16',
      rating: 4.6,
      applicants: 67,
      urgent: false,
      remote: false
    }
  ]);

  // Dynamic categories from real data
  const categories = [
    { id: 'all', name: 'All Opportunities', icon: FiGlobe },
    ...filterOptions.categories.map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' '),
      icon: getCategoryIcon(cat)
    }))
  ];

  // Helper function to get category icons
  function getCategoryIcon(category) {
    const iconMap = {
      'finance': FiDollarSign,
      'blockchain': FiTrendingUp,
      'data-science': FiBarChart2,
      'product': FiBriefcase,
      'security': FiAward,
      'design': FiUsers,
      'software': FiHome,
      'marketing': FiUsers
    };
    return iconMap[category] || FiHome;
  }

  const opportunityTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'internship', name: 'Internships' },
    { id: 'job', name: 'Full-time Jobs' },
    { id: 'hackathon', name: 'Hackathons' }
  ];



  // Enhanced filtering for FinTech opportunities
  const isFinTechRelated = (opp) => {
    const finTechKeywords = [
      'fintech', 'finance', 'financial', 'banking', 'payment', 'insurance', 'trading', 
      'cryptocurrency', 'blockchain', 'digital wallet', 'financial services',
      'lending', 'credit', 'debit', 'investment', 'wealth', 'fund', 'loan',
      'razorpay', 'paytm', 'phonepe', 'zerodha', 'policybazaar', 'cred', 'mobikwik',
      'bajaj', 'hdfc', 'icici', 'axis', 'sbi', 'kotak', 'yes bank',
      'mutual fund', 'stock', 'equity', 'derivative', 'forex', 'commodity',
      'digital banking', 'neobank', 'digital payment', 'upi', 'wallet',
      'insurtech', 'wealthtech', 'regtech', 'accounting', 'taxation',
      'credila', 'financial services', 'consulting', 'analytics',
      'business', 'sales', 'marketing', 'data' // Broader terms for finance-related roles
    ];
    
    const finTechCompanies = [
      'credila', 'razorpay', 'paytm', 'phonepe', 'zerodha', 'policybazaar', 'cred', 
      'mobikwik', 'bajaj', 'hdfc', 'icici', 'axis', 'sbi', 'kotak', 'yes bank',
      'l.e.k. consulting', 'lek consulting', 'consulting', 'financial'
    ];
    
    const text = `${opp.title} ${opp.company} ${opp.description || ''} ${(opp.skills || []).join(' ')}`.toLowerCase();
    
    // Check if it's a known FinTech company
    const isFinTechCompany = finTechCompanies.some(company => 
      opp.company.toLowerCase().includes(company)
    );
    
    // Check if content contains FinTech keywords
    const hasFinTechKeywords = finTechKeywords.some(keyword => text.includes(keyword));
    
    // Check category
    const isFinTechCategory = ['finance', 'fintech', 'banking', 'product', 'business', 'marketing'].includes(opp.category?.toLowerCase());
    
    return isFinTechCompany || hasFinTechKeywords || isFinTechCategory;
  };

  // Always show real scraped data first, then add static content if needed
  let allOpportunities = [];
  
  // Always include real opportunities (they're already loaded)
  const realFinTechOpportunities = opportunities.filter(isFinTechRelated);
  const generalOpportunities = opportunities.filter(opp => !isFinTechRelated(opp));
  
  // Prioritize FinTech opportunities, but also show some general ones
  allOpportunities = [
    ...realFinTechOpportunities,
    ...generalOpportunities.slice(0, Math.max(10, 20 - realFinTechOpportunities.length)),
    ...staticOpportunities // Always include featured static opportunities
  ];
  
  // Remove duplicates by title and company
  allOpportunities = allOpportunities.filter((opp, index, self) => 
    index === self.findIndex(o => o.title === opp.title && o.company === opp.company)
  );

  // Apply user filters
  const filteredOpportunities = allOpportunities.filter(opp => {
    const matchesFilter = activeFilter === 'all' || opp.category === activeFilter;
    const matchesSearch = searchTerm === '' || 
                         opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (opp.skills && opp.skills.some && opp.skills.some(skill => 
                           skill.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    return matchesFilter && matchesSearch;
  });

  // Handle filter changes
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    updateFilters({
      category: filterId === 'all' ? '' : filterId,
      search: searchTerm
    });
  };

  // Handle search changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      updateFilters({
        category: activeFilter === 'all' ? '' : activeFilter,
        search: value
      });
    }, 500);
  };

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      await triggerScraping();
      toast.success('Scraping initiated! Fresh opportunities will be available shortly.');
      setTimeout(() => {
        refresh();
      }, 5000);
    } catch (error) {
      toast.error('Failed to refresh opportunities');
    }
  };



  const applyToOpportunity = (opportunity) => {
    if (opportunity.applicationLink) {
      // Open the actual application link in a new tab
      window.open(opportunity.applicationLink, '_blank', 'noopener,noreferrer');
      toast.success(`Redirected to ${opportunity.company} application page!`);
    } else {
      toast.error('Application link not available');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'internship': '#3b82f6',
      'job': '#10b981',
      'hackathon': '#f59e0b'
    };
    return colors[type] || '#6b7280';
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <div className="fintech-hub">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fintech-header"
      >
        <div className="header-content">
          <div className="header-text">
            <h1>FinTech Hub Mumbai</h1>
            <p>Explore exclusive opportunities in India's financial technology sector</p>
          </div>
          <div className="header-stats">
            <div className="stat">
              <FiTrendingUp className="stat-icon" />
              <span className="stat-number">
                {loading ? '...' : allOpportunities.length}
              </span>
              <span className="stat-label">{opportunities.length > 0 ? 'Live' : 'Featured'} Opportunities</span>
            </div>
            <div className="stat">
              <FiHome className="stat-icon" />
              <span className="stat-number">
                {statsLoading ? '...' : (stats?.overview?.totalCompanies || new Set(allOpportunities.map(o => o.company)).size)}
              </span>
              <span className="stat-label">Top Companies</span>
            </div>
            <div className="stat">
              <FiUsers className="stat-icon" />
              <span className="stat-number">
                {statsLoading ? '...' : (stats?.overview?.recentOpportunities || allOpportunities.filter(o => 
                  new Date(o.postedDate || Date.now()) > new Date(Date.now() - 7*24*60*60*1000)
                ).length)}
              </span>
              <span className="stat-label">New This Week</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="fintech-content">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="filters-section"
        >
          <div className="search-controls">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search opportunities, companies, or skills..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            <button 
              className={`refresh-btn ${scraping ? 'loading' : ''}`}
              onClick={handleRefresh}
              disabled={scraping}
              title="Refresh opportunities from company websites"
            >
              {scraping ? <FiLoader className="spinning" /> : <FiRefreshCw />}
              {scraping ? 'Updating...' : 'Refresh'}
            </button>
          </div>

          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${activeFilter === category.id ? 'active' : ''}`}
                onClick={() => handleFilterChange(category.id)}
              >
                <category.icon size={16} />
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <FiLoader className="spinning" size={48} />
            <p>Loading FinTech opportunities...</p>
          </div>
        )}

        {/* Live Data Indicator */}
        {opportunities.length > 0 && (
          <div className="live-indicator" style={{ 
            padding: '8px 16px', 
            background: '#10b981', 
            color: 'white',
            borderRadius: '20px',
            margin: '10px 0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: 'white',
              animation: 'pulse 2s infinite'
            }}></div>
            Live data from {new Set(opportunities.map(o => o.company)).size} companies
          </div>
        )}



        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>Error loading opportunities: {error}</p>
            <button onClick={refresh} className="retry-btn">
              <FiRefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Opportunities Grid */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="opportunities-grid"
          >
          {filteredOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`opportunity-card ${opportunity.urgent ? 'urgent' : ''}`}
              onClick={() => setSelectedOpportunity(opportunity)}
            >
              {opportunity.urgent && (
                <div className="urgent-badge">
                  <FiClock size={12} />
                  Urgent
                </div>
              )}

              <div className="card-header">
                <div className="company-info">
                  <h3 className="opportunity-title">{opportunity.title}</h3>
                  <p className="company-name">{opportunity.company}</p>
                </div>
              </div>

              <div className="card-details">
                <div className="detail-item">
                  <FiMapPin size={14} />
                  <span>{opportunity.location || 'Remote'}</span>
                </div>
                <div className="detail-item">
                  <FiDollarSign size={14} />
                  <span>{opportunity.salary || 'Competitive'}</span>
                </div>
                <div className="detail-item">
                  <FiBriefcase size={14} />
                  <span>{opportunity.experience || 'Any Level'}</span>
                </div>
              </div>

              <div className="opportunity-type" style={{ backgroundColor: getTypeColor(opportunity.type) }}>
                {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
              </div>

              <div className="skills-preview">
                {(opportunity.skills && opportunity.skills.length > 0 ? opportunity.skills : ['Finance', 'Technology']).slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="skill-tag">{skill}</span>
                ))}
                {(opportunity.skills && opportunity.skills.length > 3) && (
                  <span className="more-skills">+{opportunity.skills.length - 3} more</span>
                )}
              </div>

              <div className="card-footer">
                <div className="deadline">
                  <FiCalendar size={12} />
                  <span className={formatDeadline(opportunity.deadline || opportunity.postedDate).includes('day') ? 'deadline-warning' : ''}>
                    {formatDeadline(opportunity.deadline || opportunity.postedDate)}
                  </span>
                </div>
                <div className="rating">
                  <FiStar size={12} />
                  <span>{opportunity.rating || '4.0'}</span>
                </div>
              </div>
            </motion.div>
          ))}
          </motion.div>
        )}

        {/* No Results State */}
        {!loading && !error && filteredOpportunities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="no-results"
          >
            <FiSearch size={48} />
            <h3>No opportunities found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="modal-overlay"
          onClick={() => setSelectedOpportunity(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="opportunity-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{selectedOpportunity.title}</h2>
                <p className="modal-company">{selectedOpportunity.company}</p>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedOpportunity(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="modal-details">
                <div className="detail-group">
                  <FiMapPin />
                  <span>{selectedOpportunity.location}</span>
                </div>
                <div className="detail-group">
                  <FiDollarSign />
                  <span>{selectedOpportunity.salary}</span>
                </div>
                <div className="detail-group">
                  <FiBriefcase />
                  <span>{selectedOpportunity.experience}</span>
                </div>
                <div className="detail-group">
                  <FiUsers />
                  <span>{selectedOpportunity.applicants} applicants</span>
                </div>
              </div>

              <div className="modal-section">
                <h3>Description</h3>
                <p>{selectedOpportunity.description}</p>
              </div>

              <div className="modal-section">
                <h3>Required Skills</h3>
                <div className="skills-list">
                  {selectedOpportunity.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h3>Requirements</h3>
                <ul>
                  {selectedOpportunity.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-section">
                <h3>Benefits</h3>
                <div className="benefits-list">
                  {selectedOpportunity.benefits.map((benefit, idx) => (
                    <span key={idx} className="benefit-tag">{benefit}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="apply-btn"
                onClick={() => {
                  applyToOpportunity(selectedOpportunity);
                  setSelectedOpportunity(null);
                }}
              >
                <FiExternalLink size={16} />
                Apply Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default FinTechHub;
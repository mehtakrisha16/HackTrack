const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Mock data for hackathons (replace with actual database model later)
const mockHackathons = [
  {
    id: 1,
    title: "Mumbai Fintech Hackathon 2025",
    description: "Build innovative fintech solutions for Mumbai's financial ecosystem",
    startDate: "2025-11-15",
    endDate: "2025-11-17",
    registrationDeadline: "2025-11-10",
    location: "IIT Bombay, Powai",
    venue: "Computer Science Building",
    organizer: "IIT Bombay & JPMorgan Chase",
    category: "Fintech",
    mode: "offline",
    teamSize: { min: 2, max: 4 },
    difficulty: "intermediate",
    prizes: {
      first: "₹2,00,000",
      second: "₹1,00,000",
      third: "₹50,000"
    },
    totalPrizePool: "₹5,00,000",
    technologies: ["React", "Node.js", "Python", "Blockchain", "AI/ML"],
    themes: ["Digital Payments", "Investment Tech", "Insurance", "Banking"],
    requirements: [
      "Students or professionals",
      "Basic programming knowledge",
      "Laptop required"
    ],
    schedule: [
      { day: "Day 1", time: "09:00", activity: "Registration & Team Formation" },
      { day: "Day 1", time: "10:00", activity: "Opening Ceremony" },
      { day: "Day 1", time: "11:00", activity: "Hacking Begins" },
      { day: "Day 2", time: "10:00", activity: "Mentor Sessions" },
      { day: "Day 3", time: "14:00", activity: "Final Presentations" },
      { day: "Day 3", time: "17:00", activity: "Awards Ceremony" }
    ],
    mentors: [
      { name: "Dr. Rajesh Kumar", expertise: "Blockchain", company: "IIT Bombay" },
      { name: "Priya Sharma", expertise: "Fintech", company: "JPMorgan Chase" }
    ],
    sponsors: ["JPMorgan Chase", "TCS", "Reliance Jio"],
    eligibility: "Open to all",
    capacity: 200,
    registered: 156,
    status: "upcoming",
    image: "/images/hackathons/fintech-mumbai.jpg",
    tags: ["Fintech", "Blockchain", "AI", "Banking"]
  },
  {
    id: 2,
    title: "Green Tech Mumbai Challenge",
    description: "Develop sustainable technology solutions for Mumbai's environmental challenges",
    startDate: "2025-12-05",
    endDate: "2025-12-07",
    registrationDeadline: "2025-11-30",
    location: "VJTI, Matunga",
    venue: "Innovation Center",
    organizer: "VJTI & Municipal Corporation of Greater Mumbai",
    category: "Environment",
    mode: "hybrid",
    teamSize: { min: 1, max: 5 },
    difficulty: "beginner",
    prizes: {
      first: "₹1,50,000",
      second: "₹75,000",
      third: "₹40,000"
    },
    totalPrizePool: "₹3,00,000",
    technologies: ["IoT", "Data Science", "Mobile Apps", "Web Development"],
    themes: ["Air Quality", "Waste Management", "Water Conservation", "Smart Transportation"],
    requirements: [
      "College students",
      "Environmental awareness",
      "Technical skills preferred but not mandatory"
    ],
    schedule: [
      { day: "Day 1", time: "09:00", activity: "Registration" },
      { day: "Day 1", time: "10:30", activity: "Problem Statement Release" },
      { day: "Day 1", time: "12:00", activity: "Hackathon Begins" },
      { day: "Day 2", time: "15:00", activity: "Progress Check" },
      { day: "Day 3", time: "16:00", activity: "Final Submissions" },
      { day: "Day 3", time: "18:00", activity: "Results & Closing" }
    ],
    mentors: [
      { name: "Dr. Anjali Desai", expertise: "Environmental Science", company: "VJTI" },
      { name: "Rahul Mehta", expertise: "IoT Solutions", company: "MCGM" }
    ],
    sponsors: ["MCGM", "Tata Consultancy Services", "L&T"],
    eligibility: "College students only",
    capacity: 150,
    registered: 89,
    status: "upcoming",
    image: "/images/hackathons/green-tech-mumbai.jpg",
    tags: ["Environment", "IoT", "Sustainability", "Smart City"]
  }
];

// @route   GET /api/hackathons
// @desc    Get all hackathons with filtering
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      mode,
      difficulty,
      status,
      search,
      limit = 12,
      page = 1,
      sort = 'startDate'
    } = req.query;

    let filteredHackathons = [...mockHackathons];

    // Apply filters
    if (category && category !== 'all') {
      filteredHackathons = filteredHackathons.filter(hackathon => 
        hackathon.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (mode && mode !== 'all') {
      filteredHackathons = filteredHackathons.filter(hackathon => 
        hackathon.mode === mode
      );
    }

    if (difficulty && difficulty !== 'all') {
      filteredHackathons = filteredHackathons.filter(hackathon => 
        hackathon.difficulty === difficulty
      );
    }

    if (status && status !== 'all') {
      filteredHackathons = filteredHackathons.filter(hackathon => 
        hackathon.status === status
      );
    }

    if (search) {
      filteredHackathons = filteredHackathons.filter(hackathon => 
        hackathon.title.toLowerCase().includes(search.toLowerCase()) ||
        hackathon.description.toLowerCase().includes(search.toLowerCase()) ||
        hackathon.technologies.some(tech => tech.toLowerCase().includes(search.toLowerCase())) ||
        hackathon.themes.some(theme => theme.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Sort hackathons
    filteredHackathons.sort((a, b) => {
      switch (sort) {
        case 'startDate':
          return new Date(a.startDate) - new Date(b.startDate);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'prizePool':
          return parseInt(b.totalPrizePool.replace(/[₹,]/g, '')) - parseInt(a.totalPrizePool.replace(/[₹,]/g, ''));
        case 'registrations':
          return b.registered - a.registered;
        default:
          return new Date(a.startDate) - new Date(b.startDate);
      }
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedHackathons = filteredHackathons.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: paginatedHackathons.length,
      total: filteredHackathons.length,
      page: parseInt(page),
      pages: Math.ceil(filteredHackathons.length / parseInt(limit)),
      hackathons: paginatedHackathons
    });

  } catch (error) {
    console.error('Get hackathons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/hackathons/:id
// @desc    Get single hackathon by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const hackathon = mockHackathons.find(h => h.id === parseInt(req.params.id));

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    res.status(200).json({
      success: true,
      hackathon
    });

  } catch (error) {
    console.error('Get hackathon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/hackathons/:id/register
// @desc    Register for a hackathon
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
  try {
    const { teamName, teamMembers } = req.body;
    const hackathon = mockHackathons.find(h => h.id === parseInt(req.params.id));

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    // Check registration deadline
    if (new Date() > new Date(hackathon.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check capacity
    if (hackathon.registered >= hackathon.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Hackathon is full'
      });
    }

    // Validate team size
    const teamSize = teamMembers ? teamMembers.length + 1 : 1; // +1 for the user
    if (teamSize < hackathon.teamSize.min || teamSize > hackathon.teamSize.max) {
      return res.status(400).json({
        success: false,
        message: `Team size must be between ${hackathon.teamSize.min} and ${hackathon.teamSize.max} members`
      });
    }

    // In a real implementation, you would save this to a database
    hackathon.registered += teamSize;

    res.status(200).json({
      success: true,
      message: 'Successfully registered for hackathon',
      registration: {
        hackathonId: hackathon.id,
        teamName: teamName || `Team ${req.user.name}`,
        teamSize,
        registrationDate: new Date()
      }
    });

  } catch (error) {
    console.error('Hackathon registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/hackathons/categories/list
// @desc    Get all hackathon categories
// @access  Public
router.get('/categories/list', (req, res) => {
  try {
    const categories = [
      'Fintech',
      'Environment',
      'Healthcare',
      'Education',
      'Social Impact',
      'Gaming',
      'IoT',
      'AI/ML',
      'Blockchain',
      'Web Development',
      'Mobile Development'
    ];

    res.status(200).json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/hackathons/stats/mumbai
// @desc    Get Mumbai hackathons statistics
// @access  Public
router.get('/stats/mumbai', (req, res) => {
  try {
    const stats = {
      totalHackathons: mockHackathons.length,
      upcomingHackathons: mockHackathons.filter(h => h.status === 'upcoming').length,
      totalRegistrations: mockHackathons.reduce((total, hackathon) => total + hackathon.registered, 0),
      totalPrizeValue: mockHackathons.reduce((total, hackathon) => {
        const prizeValue = parseInt(hackathon.totalPrizePool.replace(/[₹,]/g, ''));
        return total + prizeValue;
      }, 0),
      averageTeamSize: 3.2,
      popularCategories: [
        { category: 'Fintech', count: 1 },
        { category: 'Environment', count: 1 }
      ],
      popularTechnologies: [
        { technology: 'React', count: 1 },
        { technology: 'Node.js', count: 1 },
        { technology: 'IoT', count: 1 }
      ],
      topUniversities: [
        { university: 'IIT Bombay', count: 1 },
        { university: 'VJTI', count: 1 }
      ]
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get hackathons stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/hackathons/search/technologies
// @desc    Search hackathons by technology
// @access  Public
router.get('/search/technologies', (req, res) => {
  try {
    const { tech } = req.query;
    
    if (!tech) {
      return res.status(400).json({
        success: false,
        message: 'Technology parameter is required'
      });
    }

    const filteredHackathons = mockHackathons.filter(hackathon =>
      hackathon.technologies.some(technology =>
        technology.toLowerCase().includes(tech.toLowerCase())
      )
    );

    res.status(200).json({
      success: true,
      count: filteredHackathons.length,
      technology: tech,
      hackathons: filteredHackathons
    });

  } catch (error) {
    console.error('Search by technology error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
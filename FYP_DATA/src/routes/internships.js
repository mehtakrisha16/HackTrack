const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Mock data for internships (replace with actual database model later)
const mockInternships = [
  {
    id: 1,
    title: "Software Development Intern",
    company: "Tata Consultancy Services",
    location: "Mumbai, Maharashtra",
    office: "TCS Airoli Campus",
    type: "Full-time",
    duration: "3 months",
    stipend: "₹25,000/month",
    mode: "in-office",
    category: "Technology",
    description: "Join our software development team to work on cutting-edge projects using modern technologies. You'll be involved in full-stack development, testing, and deployment processes.",
    requirements: [
      "Currently pursuing BE/BTech in Computer Science or related field",
      "Strong programming skills in Java, Python, or JavaScript",
      "Understanding of web development frameworks",
      "Good problem-solving abilities",
      "Team player with good communication skills"
    ],
    skills: ["Java", "Python", "JavaScript", "React", "Spring Boot", "SQL"],
    responsibilities: [
      "Develop and maintain web applications",
      "Write clean, efficient, and well-documented code",
      "Participate in code reviews and team meetings",
      "Learn and implement new technologies",
      "Collaborate with senior developers on complex projects"
    ],
    benefits: [
      "Competitive stipend",
      "Learning opportunities",
      "Mentorship program",
      "Certificate of completion",
      "Possibility of full-time offer"
    ],
    applicationDeadline: "2025-10-30",
    startDate: "2025-11-15",
    endDate: "2026-02-15",
    eligibility: "3rd/4th year students",
    status: "active",
    applicationCount: 234,
    positions: 15,
    posted: "2025-09-15",
    contact: {
      email: "careers@tcs.com",
      phone: "+91-22-6778-9999"
    },
    tags: ["Software", "Full Stack", "Java", "Web Development"]
  },
  {
    id: 2,
    title: "Data Science Intern",
    company: "Reliance Jio",
    location: "Navi Mumbai, Maharashtra",
    office: "Reliance Corporate Park",
    type: "Full-time",
    duration: "6 months",
    stipend: "₹30,000/month",
    mode: "hybrid",
    category: "Data Science",
    description: "Work with our data science team to analyze large datasets, build machine learning models, and derive insights to drive business decisions in the telecom industry.",
    requirements: [
      "Currently pursuing BE/BTech/MSc in Computer Science, Data Science, or Statistics",
      "Strong knowledge of Python and data science libraries",
      "Experience with machine learning algorithms",
      "Understanding of statistical concepts",
      "Familiar with data visualization tools"
    ],
    skills: ["Python", "Machine Learning", "Pandas", "NumPy", "Scikit-learn", "Tableau", "SQL"],
    responsibilities: [
      "Analyze customer data to identify patterns and trends",
      "Develop predictive models for customer behavior",
      "Create data visualizations and dashboards",
      "Collaborate with product teams to implement data-driven solutions",
      "Present findings to stakeholders"
    ],
    benefits: [
      "High stipend",
      "Industry exposure",
      "Access to real telecom data",
      "Professional development workshops",
      "Networking opportunities"
    ],
    applicationDeadline: "2025-11-05",
    startDate: "2025-12-01",
    endDate: "2026-06-01",
    eligibility: "Final year students or fresh graduates",
    status: "active",
    applicationCount: 189,
    positions: 8,
    posted: "2025-09-20",
    contact: {
      email: "internships@jio.com",
      phone: "+91-22-7700-8888"
    },
    tags: ["Data Science", "Machine Learning", "Analytics", "Python"]
  },
  {
    id: 3,
    title: "Digital Marketing Intern",
    company: "Startup Mumbai",
    location: "Bandra Kurla Complex, Mumbai",
    office: "WeWork BKC",
    type: "Part-time",
    duration: "4 months",
    stipend: "₹15,000/month",
    mode: "hybrid",
    category: "Marketing",
    description: "Join our dynamic marketing team to create and execute digital marketing campaigns across various platforms. Perfect for creative minds who want to make an impact in the startup ecosystem.",
    requirements: [
      "Currently pursuing BBA, MBA, or any degree with marketing focus",
      "Basic understanding of digital marketing concepts",
      "Creativity and out-of-the-box thinking",
      "Good writing and communication skills",
      "Familiarity with social media platforms"
    ],
    skills: ["Digital Marketing", "Social Media", "Content Creation", "SEO", "Google Analytics", "Canva"],
    responsibilities: [
      "Create engaging content for social media platforms",
      "Manage social media accounts and communities",
      "Assist in planning and executing marketing campaigns",
      "Analyze marketing metrics and prepare reports",
      "Support event marketing and PR activities"
    ],
    benefits: [
      "Creative freedom",
      "Startup environment experience",
      "Portfolio building opportunities",
      "Performance-based incentives",
      "Flexible working hours"
    ],
    applicationDeadline: "2025-10-25",
    startDate: "2025-11-10",
    endDate: "2026-03-10",
    eligibility: "All year students",
    status: "active",
    applicationCount: 156,
    positions: 5,
    posted: "2025-09-18",
    contact: {
      email: "hiring@startupmumbai.com",
      phone: "+91-98765-43210"
    },
    tags: ["Marketing", "Social Media", "Content", "Startup"]
  }
];

// @route   GET /api/internships
// @desc    Get all internships with filtering
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      type,
      mode,
      company,
      location,
      stipend,
      search,
      limit = 12,
      page = 1,
      sort = 'posted'
    } = req.query;

    let filteredInternships = [...mockInternships];

    // Apply filters
    if (category && category !== 'all') {
      filteredInternships = filteredInternships.filter(internship => 
        internship.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (type && type !== 'all') {
      filteredInternships = filteredInternships.filter(internship => 
        internship.type.toLowerCase() === type.toLowerCase()
      );
    }

    if (mode && mode !== 'all') {
      filteredInternships = filteredInternships.filter(internship => 
        internship.mode === mode
      );
    }

    if (company) {
      filteredInternships = filteredInternships.filter(internship => 
        internship.company.toLowerCase().includes(company.toLowerCase())
      );
    }

    if (location) {
      filteredInternships = filteredInternships.filter(internship => 
        internship.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (stipend) {
      // Filter by stipend range (e.g., '20000-30000')
      const [min, max] = stipend.split('-').map(s => parseInt(s));
      filteredInternships = filteredInternships.filter(internship => {
        const internshipStipend = parseInt(internship.stipend.replace(/[₹,/month]/g, ''));
        return internshipStipend >= min && (max ? internshipStipend <= max : true);
      });
    }

    if (search) {
      filteredInternships = filteredInternships.filter(internship => 
        internship.title.toLowerCase().includes(search.toLowerCase()) ||
        internship.company.toLowerCase().includes(search.toLowerCase()) ||
        internship.description.toLowerCase().includes(search.toLowerCase()) ||
        internship.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Sort internships
    filteredInternships.sort((a, b) => {
      switch (sort) {
        case 'posted':
          return new Date(b.posted) - new Date(a.posted);
        case 'stipend':
          const stipendA = parseInt(a.stipend.replace(/[₹,/month]/g, ''));
          const stipendB = parseInt(b.stipend.replace(/[₹,/month]/g, ''));
          return stipendB - stipendA;
        case 'deadline':
          return new Date(a.applicationDeadline) - new Date(b.applicationDeadline);
        case 'company':
          return a.company.localeCompare(b.company);
        case 'applications':
          return b.applicationCount - a.applicationCount;
        default:
          return new Date(b.posted) - new Date(a.posted);
      }
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedInternships = filteredInternships.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: paginatedInternships.length,
      total: filteredInternships.length,
      page: parseInt(page),
      pages: Math.ceil(filteredInternships.length / parseInt(limit)),
      internships: paginatedInternships
    });

  } catch (error) {
    console.error('Get internships error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/internships/:id
// @desc    Get single internship by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const internship = mockInternships.find(i => i.id === parseInt(req.params.id));

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    res.status(200).json({
      success: true,
      internship
    });

  } catch (error) {
    console.error('Get internship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/internships/:id/apply
// @desc    Apply for an internship
// @access  Private
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const { coverLetter, resume, additionalInfo } = req.body;
    const internship = mockInternships.find(i => i.id === parseInt(req.params.id));

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    // Check application deadline
    if (new Date() > new Date(internship.applicationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if positions are available
    if (internship.applicationCount >= internship.positions * 10) { // Assume 10:1 application to position ratio
      return res.status(400).json({
        success: false,
        message: 'No more applications being accepted'
      });
    }

    // In a real implementation, you would save this to a database
    internship.applicationCount += 1;

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        internshipId: internship.id,
        applicantId: req.user._id,
        applicationDate: new Date(),
        status: 'submitted'
      }
    });

  } catch (error) {
    console.error('Internship application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/internships/categories/list
// @desc    Get all internship categories
// @access  Public
router.get('/categories/list', (req, res) => {
  try {
    const categories = [
      'Technology',
      'Data Science',
      'Marketing',
      'Finance',
      'Design',
      'Sales',
      'Operations',
      'HR',
      'Content Writing',
      'Business Development',
      'Research',
      'Consulting'
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

// @route   GET /api/internships/companies/list
// @desc    Get all companies offering internships
// @access  Public
router.get('/companies/list', (req, res) => {
  try {
    const companies = [...new Set(mockInternships.map(internship => internship.company))];

    res.status(200).json({
      success: true,
      companies
    });

  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/internships/stats/mumbai
// @desc    Get Mumbai internships statistics
// @access  Public
router.get('/stats/mumbai', (req, res) => {
  try {
    const stats = {
      totalInternships: mockInternships.length,
      activeInternships: mockInternships.filter(i => i.status === 'active').length,
      totalApplications: mockInternships.reduce((total, internship) => total + internship.applicationCount, 0),
      totalPositions: mockInternships.reduce((total, internship) => total + internship.positions, 0),
      averageStipend: Math.round(
        mockInternships.reduce((total, internship) => {
          const stipend = parseInt(internship.stipend.replace(/[₹,/month]/g, ''));
          return total + stipend;
        }, 0) / mockInternships.length
      ),
      popularCategories: [
        { category: 'Technology', count: 1 },
        { category: 'Data Science', count: 1 },
        { category: 'Marketing', count: 1 }
      ],
      topCompanies: [
        { company: 'Tata Consultancy Services', count: 1 },
        { company: 'Reliance Jio', count: 1 },
        { company: 'Startup Mumbai', count: 1 }
      ],
      modeDistribution: [
        { mode: 'in-office', count: 1 },
        { mode: 'hybrid', count: 2 },
        { mode: 'remote', count: 0 }
      ],
      durationDistribution: [
        { duration: '3 months', count: 1 },
        { duration: '4 months', count: 1 },
        { duration: '6 months', count: 1 }
      ]
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get internships stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/internships/search/skills
// @desc    Search internships by required skills
// @access  Public
router.get('/search/skills', (req, res) => {
  try {
    const { skill } = req.query;
    
    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill parameter is required'
      });
    }

    const filteredInternships = mockInternships.filter(internship =>
      internship.skills.some(s =>
        s.toLowerCase().includes(skill.toLowerCase())
      )
    );

    res.status(200).json({
      success: true,
      count: filteredInternships.length,
      skill: skill,
      internships: filteredInternships
    });

  } catch (error) {
    console.error('Search by skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/internships/deadlines/upcoming
// @desc    Get internships with upcoming deadlines
// @access  Public
router.get('/deadlines/upcoming', (req, res) => {
  try {
    const { days = 7 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + parseInt(days));

    const upcomingDeadlines = mockInternships.filter(internship => {
      const deadline = new Date(internship.applicationDeadline);
      return deadline >= new Date() && deadline <= cutoffDate && internship.status === 'active';
    }).sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline));

    res.status(200).json({
      success: true,
      count: upcomingDeadlines.length,
      days: parseInt(days),
      internships: upcomingDeadlines
    });

  } catch (error) {
    console.error('Get upcoming deadlines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
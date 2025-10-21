const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Mock data for events (replace with actual database model later)
const mockEvents = [
  {
    id: 1,
    title: "Tech Talk: AI in Mumbai",
    description: "Exploring the future of artificial intelligence in Mumbai's tech ecosystem",
    date: "2025-10-15",
    time: "18:00",
    location: "IIT Bombay, Powai",
    venue: "Victor Menezes Convention Centre",
    organizer: "IIT Bombay",
    category: "Tech Talk",
    tags: ["AI", "Machine Learning", "Tech"],
    capacity: 200,
    registered: 145,
    price: "Free",
    image: "/images/events/ai-mumbai.jpg",
    status: "upcoming"
  },
  {
    id: 2,
    title: "Mumbai Startup Networking",
    description: "Connect with fellow entrepreneurs and startup enthusiasts in Mumbai",
    date: "2025-10-20",
    time: "19:00",
    location: "BKC, Mumbai",
    venue: "WeWork BKC",
    organizer: "Mumbai Startup Community",
    category: "Networking",
    tags: ["Startups", "Networking", "Business"],
    capacity: 100,
    registered: 78,
    price: "₹500",
    image: "/images/events/startup-networking.jpg",
    status: "upcoming"
  }
];

// @route   GET /api/events
// @desc    Get all events with filtering
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      location,
      date,
      price,
      search,
      limit = 12,
      page = 1,
      sort = 'date'
    } = req.query;

    let filteredEvents = [...mockEvents];

    // Apply filters
    if (category && category !== 'all') {
      filteredEvents = filteredEvents.filter(event => 
        event.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (location) {
      filteredEvents = filteredEvents.filter(event => 
        event.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (date) {
      filteredEvents = filteredEvents.filter(event => 
        event.date === date
      );
    }

    if (price === 'free') {
      filteredEvents = filteredEvents.filter(event => 
        event.price.toLowerCase() === 'free'
      );
    }

    if (search) {
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Sort events
    filteredEvents.sort((a, b) => {
      switch (sort) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'popularity':
          return b.registered - a.registered;
        default:
          return new Date(a.date) - new Date(b.date);
      }
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: paginatedEvents.length,
      total: filteredEvents.length,
      page: parseInt(page),
      pages: Math.ceil(filteredEvents.length / parseInt(limit)),
      events: paginatedEvents
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/events/saved
// @desc    Get user's saved events
// @access  Private
// IMPORTANT: Must be before /:id route to avoid route conflict
router.get('/saved', protect, async (req, res) => {
  try {
    // In a real implementation, fetch saved events from database
    // For now, return empty array to prevent errors
    console.log('📌 GET /api/events/saved - Returning empty saved events');
    res.status(200).json({
      success: true,
      savedEvents: [],
      count: 0
    });

  } catch (error) {
    console.error('Get saved events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/events/categories/list
// @desc    Get all event categories
// @access  Public
// IMPORTANT: Must be before /:id route to avoid route conflict
router.get('/categories/list', (req, res) => {
  try {
    const categories = [
      'Tech Talk',
      'Networking',
      'Workshop',
      'Conference',
      'Seminar',
      'Competition',
      'Career Fair',
      'Cultural'
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

// @route   GET /api/events/stats/mumbai
// @desc    Get Mumbai events statistics
// @access  Public
// IMPORTANT: Must be before /:id route to avoid route conflict
router.get('/stats/mumbai', (req, res) => {
  try {
    const stats = {
      totalEvents: mockEvents.length,
      upcomingEvents: mockEvents.filter(e => e.status === 'upcoming').length,
      totalRegistrations: mockEvents.reduce((total, event) => total + event.registered, 0),
      averageCapacity: Math.round(mockEvents.reduce((total, event) => total + event.capacity, 0) / mockEvents.length),
      popularCategories: [
        { category: 'Tech Talk', count: 1 },
        { category: 'Networking', count: 1 }
      ],
      popularVenues: [
        { venue: 'IIT Bombay', count: 1 },
        { venue: 'WeWork BKC', count: 1 }
      ]
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get events stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
// IMPORTANT: This route must be LAST among GET routes as it's a catch-all for IDs
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const event = mockEvents.find(e => e.id === parseInt(req.params.id));

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      event
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = mockEvents.find(e => e.id === parseInt(req.params.id));

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.registered >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // In a real implementation, you would save this to a database
    event.registered += 1;

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      event
    });

  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
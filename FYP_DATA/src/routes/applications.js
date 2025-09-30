const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user applications
// @route   GET /api/applications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Demo applications data
    const applications = [
      {
        id: 'app-1',
        eventId: 'event-1',
        eventTitle: 'Mumbai TechFest 2025',
        eventType: 'hackathon',
        status: 'pending',
        appliedAt: new Date('2025-09-20'),
        venue: 'IIT Bombay'
      },
      {
        id: 'app-2',
        eventId: 'event-2',
        eventTitle: 'Internship Fair Mumbai',
        eventType: 'internship',
        status: 'accepted',
        appliedAt: new Date('2025-09-15'),
        venue: 'VJTI Mumbai'
      }
    ];

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting applications'
    });
  }
});

// @desc    Submit new application
// @route   POST /api/applications
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { eventId, eventTitle, eventType, additionalInfo } = req.body;

    // Create new application
    const newApplication = {
      id: 'app-' + Date.now(),
      eventId,
      eventTitle,
      eventType,
      status: 'pending',
      appliedAt: new Date(),
      additionalInfo,
      userId: req.user._id
    };

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: newApplication
    });

  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting application'
    });
  }
});

module.exports = router;
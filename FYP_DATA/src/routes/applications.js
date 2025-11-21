const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const Application = require('../models/Application');

// @desc    Get user applications
// @route   GET /api/applications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filters = {};
    // Optional query filters: status, type, limit, page
    if (req.query.status) filters.status = req.query.status;
    if (req.query.type) filters.opportunityType = req.query.type;

    const applications = await Application.getUserApplications(req.user._id, filters);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting applications. Please check the database connection.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Submit new application
// @route   POST /api/applications
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { opportunityId, opportunityType, title, company, location, deadline, salary, applicationLink, notes } = req.body;

    if (!opportunityId || !opportunityType || !title || !company) {
      return res.status(400).json({ success: false, message: 'Missing required application fields' });
    }

    // Prevent duplicate applications
    const already = await Application.hasUserApplied(req.user._id, opportunityId);
    if (already) {
      return res.status(409).json({ success: false, message: 'You have already applied to this opportunity' });
    }

    const newApp = new Application({
      userId: req.user._id,
      opportunityId,
      opportunityType,
      title,
      company,
      location,
      deadline: deadline ? new Date(deadline) : undefined,
      salary,
      applicationLink,
      notes
    });

    await newApp.save();

    res.status(201).json({ success: true, message: 'Application submitted successfully', data: newApp });

  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting application. Please check the database connection.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
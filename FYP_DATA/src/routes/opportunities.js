const express = require('express');
const router = express.Router();
const { Opportunity } = require('../services/opportunityScraper');

// Get all opportunities with filtering and pagination
router.get('/opportunities', async (req, res) => {
  try {
    const {
      type,           // internship, job, hackathon, event
      category,       // software, data-science, product, etc.
      company,        // specific company filter
      location,       // location filter
      skills,         // comma-separated skills
      remote,         // true/false for remote opportunities
      search,         // search term for title/description
      page = 1,       // pagination
      limit = 20,     // items per page
      sortBy = 'postedDate',  // sort field
      sortOrder = 'desc'      // asc or desc
    } = req.query;

    // Build filter query
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (company) filter.company = new RegExp(company, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (remote !== undefined) filter.remote = remote === 'true';

    // Skills filter
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillArray };
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }

    // Date filters for fresh opportunities
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    filter.postedDate = { $gte: thirtyDaysAgo };

    // Execute query with pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    const opportunities = await Opportunity.find(filter)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .lean();

    const total = await Opportunity.countDocuments(filter);

    // Add computed fields
    const enrichedOpportunities = opportunities.map(opp => ({
      ...opp,
      isNew: (now - new Date(opp.postedDate)) < (7 * 24 * 60 * 60 * 1000), // 7 days
      daysLeft: opp.deadline ? Math.ceil((new Date(opp.deadline) - now) / (24 * 60 * 60 * 1000)) : null,
      expired: opp.deadline ? new Date(opp.deadline) < now : false
    }));

    res.json({
      success: true,
      data: {
        opportunities: enrichedOpportunities,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(total / options.limit),
          totalItems: total,
          itemsPerPage: options.limit,
          hasNext: options.page < Math.ceil(total / options.limit),
          hasPrev: options.page > 1
        },
        filters: {
          type,
          category,
          company,
          location,
          skills,
          remote,
          search
        }
      }
    });

  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunities',
      error: error.message
    });
  }
});

// Get opportunity statistics
router.get('/opportunities/stats', async (req, res) => {
  try {
    const stats = await Opportunity.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalOpportunities: { $sum: 1 },
          totalCompanies: { $addToSet: '$company' },
          byType: {
            $push: {
              type: '$type',
              count: 1
            }
          },
          byCategory: {
            $push: {
              category: '$category',
              count: 1
            }
          },
          recentOpportunities: {
            $sum: {
              $cond: [
                { $gte: ['$postedDate', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          totalOpportunities: 1,
          totalCompanies: { $size: '$totalCompanies' },
          recentOpportunities: 1,
          byType: 1,
          byCategory: 1
        }
      }
    ]);

    // Get type distribution
    const typeStats = await Opportunity.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get category distribution
    const categoryStats = await Opportunity.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get company distribution
    const companyStats = await Opportunity.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalOpportunities: 0,
          totalCompanies: 0,
          recentOpportunities: 0
        },
        distributions: {
          types: typeStats,
          categories: categoryStats,
          topCompanies: companyStats
        }
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Get single opportunity by ID
router.get('/opportunities/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Add computed fields
    const now = new Date();
    const enrichedOpportunity = {
      ...opportunity.toObject(),
      isNew: (now - new Date(opportunity.postedDate)) < (7 * 24 * 60 * 60 * 1000),
      daysLeft: opportunity.deadline ? Math.ceil((new Date(opportunity.deadline) - now) / (24 * 60 * 60 * 1000)) : null,
      expired: opportunity.deadline ? new Date(opportunity.deadline) < now : false
    };

    res.json({
      success: true,
      data: enrichedOpportunity
    });

  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunity',
      error: error.message
    });
  }
});

// Get trending opportunities
router.get('/opportunities/trending', async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const trending = await Opportunity.find({
      isActive: true,
      postedDate: { $gte: sevenDaysAgo }
    })
    .sort({ postedDate: -1 })
    .limit(10)
    .lean();

    res.json({
      success: true,
      data: trending
    });

  } catch (error) {
    console.error('Error fetching trending opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending opportunities',
      error: error.message
    });
  }
});

// Manual trigger for scraping (admin only)
router.post('/opportunities/scrape', async (req, res) => {
  try {
    // This should be protected with admin authentication
    const { OpportunityScraper } = require('../services/opportunityScraper');
    const scraper = new OpportunityScraper();
    
    // Run scraping in background
    scraper.scrapeAllOpportunities()
      .then(() => {
        console.log('Manual scraping completed');
      })
      .catch(error => {
        console.error('Manual scraping failed:', error);
      });

    res.json({
      success: true,
      message: 'Scraping initiated successfully'
    });

  } catch (error) {
    console.error('Error initiating scraping:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate scraping',
      error: error.message
    });
  }
});

// Get available filters (for frontend dropdowns)
router.get('/opportunities/filters', async (req, res) => {
  try {
    const [types, categories, companies, locations] = await Promise.all([
      Opportunity.distinct('type', { isActive: true }),
      Opportunity.distinct('category', { isActive: true }),
      Opportunity.distinct('company', { isActive: true }),
      Opportunity.distinct('location', { isActive: true })
    ]);

    // Get all skills
    const skillsResult = await Opportunity.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    const skills = skillsResult.map(item => item._id);

    res.json({
      success: true,
      data: {
        types: types.sort(),
        categories: categories.sort(),
        companies: companies.sort(),
        locations: locations.sort(),
        skills: skills
      }
    });

  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options',
      error: error.message
    });
  }
});

module.exports = router;
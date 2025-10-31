const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import database configuration
const dbConnection = require('./config/database');
const dbInitializer = require('./config/dbInit');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/events');
const hackathonRoutes = require('./routes/hackathons');
const internshipRoutes = require('./routes/internships');
const applicationRoutes = require('./routes/applications');
const opportunityRoutes = require('./routes/opportunities');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import new comprehensive domain scraper
const DomainScraper = require('./services/domainScraper');
const cron = require('node-cron');

// Initialize domain scraper
const domainScraper = new DomainScraper();

// Auto-run scraper on server start (after 30 seconds delay)
setTimeout(() => {
  console.log('🚀 Starting initial domain-wise scraping...');
  domainScraper.scrapeAllDomains().catch(err => console.error('Scraping error:', err));
}, 30000);

// Schedule scraping every 6 hours
cron.schedule('0 */6 * * *', () => {
  console.log('⏰ Running scheduled domain-wise scraping...');
  domainScraper.scrapeAllDomains().catch(err => console.error('Scraping error:', err));
});

// Clean old opportunities daily at 2 AM
cron.schedule('0 2 * * *', () => {
  console.log('🗑️ Cleaning old opportunities...');
  domainScraper.cleanOldOpportunities(60).catch(err => console.error('Cleanup error:', err));
});

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration for frontend integration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware (for LinkedIn-style authentication)
app.use(cookieParser());

// Serve static files (uploaded profile photos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging middleware
app.use(morgan('combined'));

// Initialize database connection
const initializeApp = async () => {
  try {
    // Connect to MongoDB
    await dbConnection.connect();
    
    // Initialize database (create indexes, seed data)
    if (dbConnection.isMongoConnected()) {
      await dbInitializer.initializeDatabase();
    }
  } catch (error) {
    console.error('❌ App initialization error:', error);
  }
};

// Initialize the application
initializeApp();

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbInfo = dbConnection.getConnectionInfo();
  res.status(200).json({
    success: true,
    message: 'HackTrack Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbConnection.isMongoConnected(),
      info: dbInfo
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api', opportunityRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to HackTrack Backend API',
    version: '1.0.0',
    documentation: '/api/docs',
    status: 'operational'
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      '/api/auth',
      '/api/users', 
      '/api/events',
      '/api/hackathons',
      '/api/internships'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌟 HackTrack Backend server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
  console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  try {
    await dbConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('� SIGINT received, shutting down gracefully');
  try {
    await dbConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});

module.exports = app;
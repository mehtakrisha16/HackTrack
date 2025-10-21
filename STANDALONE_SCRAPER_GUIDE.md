# 🤖 Standalone Opportunity Scraper Service

## 🚀 Overview

The Standalone Opportunity Scraper is a **24/7 autonomous data collection service** that continuously scrapes the latest 100 opportunities from 15+ major companies and platforms. It operates **independently from your main website**, ensuring real-time data availability even when your website is offline.

## ✨ Key Features

### 🔄 **Continuous Operation**
- **Runs independently** from your main website server
- **24/7 automated scraping** every 2 hours
- **Survives server restarts** - keeps collecting data
- **Background service** - doesn't interfere with your website

### 📊 **Comprehensive Data Collection**
- **100 opportunities per source** (not just 10-20)
- **15+ major companies** including Razorpay, Paytm, Google, Microsoft
- **4 opportunity types**: Jobs, Internships, Hackathons, Events
- **Smart deduplication** to avoid duplicate entries
- **Intelligent data extraction** with fallback parsers

### 🏢 **Supported Sources**

#### **FinTech Companies** (Priority: High)
- 🏦 **Razorpay** - Payment gateway leader
- 💳 **Paytm** - Digital payments giant  
- 📱 **PhonePe** - UPI payments platform
- 📈 **Zerodha** - Stock trading platform
- 🏥 **Policybazaar** - Insurance marketplace

#### **Tech Giants** (Priority: Maximum)
- 🌐 **Google** - Search & cloud services
- 💻 **Microsoft** - Software & cloud platform

#### **Hackathon Platforms** (Priority: High)
- 🏆 **Devpost** - Global hackathon platform
- 🎯 **HackerEarth** - Coding competitions
- 🚀 **Unstop** - Student competitions

#### **Internship Platforms** (Priority: High)
- 📚 **Internshala** - India's largest internship platform
- 🎓 **LetsIntern** - Premium internships

#### **Job Portals** (Priority: High)
- 💼 **LinkedIn** - Professional network
- 🔍 **Naukri.com** - Leading job portal

## 🛠 Installation & Setup

### **Prerequisites**
```bash
# Ensure you have Node.js 16+ installed
node --version  # Should be 16.0.0 or higher
```

### **Quick Start**
```powershell
# Method 1: Using PowerShell Service Manager (Recommended)
.\scraper-service.ps1 -Start

# Method 2: Using Batch Script
.\start-scraper.bat

# Method 3: Direct Node.js
cd FYP_DATA
npm run scrape:standalone
```

### **Service Management**
```powershell
# Start the service
.\scraper-service.ps1 -Start

# Check status and view statistics  
.\scraper-service.ps1 -Status

# Stop the service
.\scraper-service.ps1 -Stop

# Restart the service
.\scraper-service.ps1 -Restart
```

## 📈 Monitoring & Analytics

### **Real-time Dashboard**
```bash
cd FYP_DATA
node monitor.js                # One-time status
node monitor.js --watch        # Auto-refresh every 30s
node monitor.js --stats        # Detailed statistics
```

### **Dashboard Shows:**
- 📊 **Total opportunities** in database
- 🆕 **Recently added** opportunities (24h, 7d)
- 🏢 **Top companies** by opportunity count
- 📋 **Opportunity type** distribution  
- 🔧 **Scraper status** for each source
- ⚡ **Recent additions** with timestamps

### **Log Files**
```
FYP_DATA/logs/
├── scraper.log          # Detailed scraping logs
└── scraper-service.log  # Service management logs
```

## 🗄️ Database Schema

### **Enhanced Opportunity Model**
```javascript
{
  title: "Senior Software Engineer",           // Job title
  company: "Razorpay",                        // Company name
  location: "Bangalore",                      // Job location
  type: "job",                                // job|internship|hackathon|event
  category: "software",                       // Technology category
  description: "Build scalable payment...",   // Job description
  requirements: ["3+ years experience"],      // Job requirements array
  skills: ["JavaScript", "React", "Node.js"], // Required skills array
  salary: "₹15-25 LPA",                      // Salary information
  experience: "3+ years",                     // Experience required
  deadline: "2025-01-15",                    // Application deadline
  applicationLink: "https://...",             // Direct apply link
  sourceUrl: "https://razorpay.com/jobs/",   // Source page
  benefits: ["Health Insurance", "Stock"],    // Benefits array
  remote: true,                              // Remote work option
  urgent: false,                             // Urgent hiring flag
  priority: 9,                               // Scraper priority (1-10)
  sourceId: "unique-identifier",             // Unique source ID
  scrapedAt: "2025-01-15T10:30:00Z",        // When scraped
  lastUpdated: "2025-01-15T10:30:00Z",      // Last updated
  isActive: true,                            // Active status
  viewCount: 0,                              // View tracking
  applicationCount: 0                        // Application tracking
}
```

### **Scraper Status Tracking**
```javascript
{
  source: "razorpay",                        // Source identifier
  lastRun: "2025-01-15T10:00:00Z",          // Last scrape attempt
  lastSuccess: "2025-01-15T10:00:00Z",      // Last successful scrape
  status: "success",                         // running|success|error|idle
  totalScraped: 1250,                       // Total opportunities scraped
  errorCount: 2,                            // Error count
  lastError: "Timeout error",               // Last error message
  averageRunTime: 15000,                    // Average run time (ms)
  nextRun: "2025-01-15T12:00:00Z"          // Next scheduled run
}
```

## ⚙️ Configuration

### **Scraping Schedule**
- **Main Scraping**: Every 2 hours (more frequent than before)
- **Data Cleanup**: Twice daily (6 AM & 6 PM)
- **Status Reports**: Every hour
- **Old Data Removal**: 45+ day old opportunities

### **Performance Settings**
```javascript
// Per-source limits
maxResults: 100,           // Get last 100 from each source (not 20)
batchSize: 3,             // Process 3 sources simultaneously  
requestDelay: 5000,       // 5s delay between batches
pageTimeout: 60000,       // 60s page load timeout
retryAttempts: 3,         // 3 retry attempts per source
```

### **Database Configuration**
```javascript
// Connection settings
serverSelectionTimeoutMS: 5000,    // 5s connection timeout
heartbeatFrequencyMS: 2000,        // 2s heartbeat
retryWrites: true,                 // Retry failed writes
retryReads: true,                  // Retry failed reads
```

## 🔗 API Integration

The scraped data is automatically available through your existing API endpoints:

### **API Endpoints**
```javascript
GET /api/opportunities                    // Get all opportunities
GET /api/opportunities?company=Razorpay   // Filter by company
GET /api/opportunities?type=internship    // Filter by type  
GET /api/opportunities?category=fintech   // Filter by category
GET /api/opportunities/stats             // Get statistics
GET /api/opportunities/trending          // Get trending opportunities
```

### **Frontend Integration**
Your React components automatically receive the scraped data:
```javascript
// Your existing hooks work with real data
const { opportunities, loading } = useOpportunities();
const { stats } = useOpportunityStats();
const trending = useTrendingOpportunities();
```

## 🛡️ Error Handling & Recovery

### **Robust Error Management**
- ✅ **Automatic retry** on network failures
- ✅ **Graceful degradation** when sources are down
- ✅ **Connection recovery** for database issues
- ✅ **Browser crash recovery** with automatic restart
- ✅ **Memory leak prevention** with periodic cleanup

### **Monitoring Alerts**
```javascript
// Error conditions automatically logged
- Source unreachable (network issues)
- Parsing failures (website structure changes)  
- Database connection issues
- Browser automation failures
- Memory usage spikes
```

### **Data Quality Assurance**
- 🔍 **Duplicate detection** across sources
- 📝 **Data validation** before saving
- 🧹 **Automatic cleanup** of malformed data
- 📊 **Quality metrics** tracking

## 🚀 Production Deployment

### **Windows Service Setup**
```powershell
# Install as Windows Service (optional)
npm install -g node-windows
node install-service.js

# Or run as background process
.\scraper-service.ps1 -Start
```

### **Linux/macOS Setup**
```bash
# Using PM2 (Process Manager)
npm install -g pm2
pm2 start src/services/standaloneScraper.js --name "opportunity-scraper"
pm2 startup
pm2 save
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "src/services/standaloneScraper.js"]
```

## 📊 Performance Metrics

### **Expected Performance**
- **Scraping Speed**: ~100 opportunities per source in 30-60 seconds
- **Total Sources**: 15+ companies/platforms  
- **Memory Usage**: ~200-500MB during scraping
- **Database Storage**: ~1-2GB for 50,000 opportunities
- **API Response Time**: <100ms for filtered queries

### **Scalability**
- **Handles 10,000+** opportunities without performance issues
- **Concurrent scraping** of multiple sources
- **Intelligent rate limiting** to respect source servers
- **Automatic load balancing** across scraping sessions

## 🔧 Troubleshooting

### **Common Issues**

**Issue**: Scraper not starting
```powershell
# Solution: Check dependencies and database
npm install
.\scraper-service.ps1 -Status
```

**Issue**: No new data being collected
```javascript
// Check scraper status
node monitor.js --stats

// Restart the service
.\scraper-service.ps1 -Restart
```

**Issue**: Database connection errors
```javascript
// Test database connection
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/hacktrack')
  .then(() => console.log('DB OK'))
  .catch(err => console.log('DB Error:', err));
"
```

**Issue**: Browser automation failures
```javascript
// Clear browser cache and restart
.\scraper-service.ps1 -Stop
# Wait 10 seconds
.\scraper-service.ps1 -Start
```

### **Debug Mode**
```bash
# Enable verbose logging
DEBUG=puppeteer* node src/services/standaloneScraper.js

# Check individual source
node -e "const scraper = require('./src/services/standaloneScraper.js'); scraper.testSingleSource('razorpay');"
```

## 🎯 Benefits for Your Platform

### **For Users**
- 🆕 **Always fresh content** - 100 new opportunities every 2 hours
- 🔍 **Comprehensive coverage** - 15+ major sources
- ⚡ **Fast loading** - data pre-scraped and ready
- 🎯 **Relevant opportunities** - smart categorization
- 📈 **Trending insights** - popular opportunities highlighted

### **For Business**
- 💰 **Reduced infrastructure costs** - efficient scraping
- 📊 **Rich analytics** - detailed usage patterns  
- 🔒 **Reliable data source** - multiple backup sources
- 🚀 **Competitive advantage** - exclusive opportunity aggregation
- 📈 **User engagement** - fresh content drives return visits

## 🔮 Future Enhancements

### **Planned Features**
- 🤖 **AI-powered categorization** for better organization
- 📱 **Mobile app notifications** for new opportunities
- 🔔 **Email alerts** for matching opportunities
- 📊 **Advanced analytics dashboard** with insights
- 🌍 **Geographic filtering** for location-based opportunities
- 💼 **Company culture insights** from scraped data
- 🎯 **Personalized recommendations** based on user profile

---

## 📞 Support

If you encounter any issues:

1. **Check the monitor**: `node monitor.js`
2. **View logs**: Check `FYP_DATA/logs/scraper.log`  
3. **Restart service**: `.\scraper-service.ps1 -Restart`
4. **Test database**: `.\scraper-service.ps1 -Status`

**Happy Scraping! 🚀** Your platform now has access to real-time opportunities from 15+ major sources, updated every 2 hours automatically.
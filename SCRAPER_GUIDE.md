# 🤖 HackTrack Opportunity Scraper System

## Overview
The HackTrack Opportunity Scraper is an automated system that fetches real-time opportunities from company websites, hackathon platforms, and job boards. It automatically updates your database with fresh opportunities and integrates seamlessly with your frontend.

## 🚀 Features

### ✨ **Automated Web Scraping**
- **Multi-Company Support**: Scrapes from 15+ major companies and platforms
- **Smart Parsing**: Intelligent extraction of job details, requirements, and metadata
- **Scheduled Updates**: Automatic scraping every 6 hours
- **Error Handling**: Robust error handling and retry mechanisms

### 🏢 **Supported Companies & Platforms**

#### **FinTech Companies**
- **Razorpay** - Payment solutions
- **Paytm** - Digital payments
- **PhonePe** - Mobile banking
- **Zerodha** - Investment platform
- **Policybazaar** - Insurance technology

#### **Tech Giants**
- **Google** - Software engineering roles
- **Microsoft** - Technology positions
- **Amazon** - Various tech roles

#### **Hackathon Platforms**
- **Devpost** - Global hackathons
- **HackerEarth** - Coding challenges
- **Unstop** - College competitions

#### **Internship Platforms**
- **Internshala** - Student internships
- **LetsIntern** - Professional internships

### 📊 **Real-time Data Processing**
- **Automatic Classification**: Categorizes opportunities by type and domain
- **Skill Extraction**: Identifies required skills from job descriptions
- **Location Detection**: Recognizes job locations and remote work options
- **Deadline Tracking**: Monitors application deadlines

## 🛠️ **Installation & Setup**

### 1. Install Dependencies
```bash
cd d:\FINAL\FYP_DATA
npm install puppeteer cheerio node-cron axios
```

### 2. Environment Setup
Add to your `.env` file:
```env
# Scraping Configuration
SCRAPING_ENABLED=true
SCRAPING_INTERVAL=6 # hours
MAX_CONCURRENT_SCRAPERS=3
SCRAPING_TIMEOUT=30000 # milliseconds

# Browser Configuration
HEADLESS_BROWSER=true
BROWSER_TIMEOUT=30000
```

### 3. Database Setup
The scraper automatically creates the `opportunities` collection in MongoDB with the following schema:

```javascript
{
  title: String,           // Job title
  company: String,         // Company name
  location: String,        // Job location
  type: String,           // 'internship', 'job', 'hackathon', 'event'
  category: String,       // 'software', 'data-science', 'product', etc.
  description: String,    // Job description
  requirements: [String], // Required qualifications
  skills: [String],       // Required skills
  salary: String,         // Salary/prize information
  experience: String,     // Experience level
  deadline: Date,         // Application deadline
  applicationLink: String, // Apply URL
  sourceUrl: String,      // Source website
  remote: Boolean,        // Remote work option
  isActive: Boolean,      // Active status
  scrapedAt: Date,       // Last scraped time
  lastUpdated: Date      // Last updated time
}
```

## 🚀 **Usage**

### **Automatic Scraping**
The scraper runs automatically when you start your server:
```bash
npm start
```

### **Manual Scraping**
```bash
# Run scraper once
npm run scrape

# Run with auto-restart
npm run scrape:dev
```

### **API Integration**
Use the REST API to access scraped opportunities:

```javascript
// Get all opportunities with filtering
GET /api/opportunities?type=internship&category=software&search=react

// Get opportunity statistics
GET /api/opportunities/stats

// Get trending opportunities
GET /api/opportunities/trending

// Get single opportunity
GET /api/opportunities/:id

// Manual scraping trigger (admin only)
POST /api/opportunities/scrape
```

## 🔧 **Frontend Integration**

### **React Hooks**
Use the provided custom hooks in your components:

```javascript
import { useOpportunities, useOpportunityStats } from '../hooks/useOpportunities';

function OpportunitiesPage() {
  const { 
    opportunities, 
    loading, 
    updateFilters, 
    refresh 
  } = useOpportunities();

  const { stats } = useOpportunityStats();

  return (
    <div>
      {/* Display opportunities */}
    </div>
  );
}
```

### **Filtering & Search**
```javascript
// Filter by type
updateFilters({ type: 'internship' });

// Filter by category
updateFilters({ category: 'software' });

// Search functionality
updateFilters({ search: 'react developer' });

// Combined filters
updateFilters({
  type: 'job',
  category: 'data-science',
  location: 'Mumbai',
  remote: true
});
```

## 📈 **Performance & Optimization**

### **Smart Caching**
- **Database Caching**: Avoids duplicate entries
- **Rate Limiting**: Respectful scraping with delays
- **Error Recovery**: Automatic retry on failures

### **Resource Management**
- **Browser Pools**: Efficient Puppeteer instance management
- **Memory Cleanup**: Automatic cleanup of old opportunities
- **Concurrent Limits**: Prevents server overload

## 🎯 **Monitoring & Analytics**

### **Real-time Statistics**
```javascript
{
  totalOpportunities: 1250,
  totalCompanies: 45,
  recentOpportunities: 89,
  distributions: {
    types: [
      { _id: 'job', count: 650 },
      { _id: 'internship', count: 400 },
      { _id: 'hackathon', count: 200 }
    ],
    categories: [
      { _id: 'software', count: 500 },
      { _id: 'data-science', count: 300 },
      { _id: 'product', count: 200 }
    ]
  }
}
```

### **Health Monitoring**
- **Scraping Success Rate**: Track successful vs failed scrapes
- **Data Quality**: Monitor parsed data accuracy
- **Performance Metrics**: Track scraping speed and efficiency

## 🛡️ **Security & Compliance**

### **Ethical Scraping**
- **Respectful Delays**: 2-second delays between requests
- **User-Agent Rotation**: Appears as regular browser traffic
- **Terms of Service**: Compliant with website policies
- **Rate Limiting**: Prevents server overload

### **Data Privacy**
- **No Personal Data**: Only scrapes public job postings
- **Anonymized Analytics**: No user tracking
- **GDPR Compliant**: Respects data privacy regulations

## 🔄 **Automation Features**

### **Scheduled Tasks**
```javascript
// Every 6 hours - Full scraping
cron.schedule('0 */6 * * *', () => {
  scraper.scrapeAllOpportunities();
});

// Daily at midnight - Cleanup old data
cron.schedule('0 0 * * *', () => {
  scraper.cleanOldOpportunities();
});
```

### **Auto-Updates**
- **Fresh Content**: Always shows latest opportunities
- **Deadline Management**: Automatically removes expired opportunities
- **Smart Deduplication**: Avoids duplicate entries

## 📊 **Dashboard Integration**

The scraper integrates with your admin dashboard to provide:

- **Real-time Metrics**: Live opportunity counts and statistics
- **Manual Controls**: Trigger scraping on-demand
- **Data Quality**: Monitor parsing accuracy and errors
- **Performance**: Track scraping success rates

## 🚀 **Production Deployment**

### **Server Requirements**
- **Node.js 16+**: Modern JavaScript support
- **MongoDB**: Database for storing opportunities
- **2GB+ RAM**: For Puppeteer browser instances
- **Chrome/Chromium**: Headless browser dependency

### **Environment Variables**
```env
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/hacktrack
SCRAPING_ENABLED=true
BROWSER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### **Docker Support**
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## 📚 **API Documentation**

### **Endpoints**

#### `GET /api/opportunities`
**Description**: Get filtered opportunities with pagination  
**Parameters**:
- `type`: internship|job|hackathon|event
- `category`: software|data-science|product|design|etc
- `company`: Company name filter
- `location`: Location filter
- `skills`: Comma-separated skills
- `search`: Search term
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### `GET /api/opportunities/stats`
**Description**: Get opportunity statistics and distributions

#### `POST /api/opportunities/scrape`
**Description**: Manually trigger scraping (admin only)

## 🎉 **Benefits**

### **For Users**
- ✅ **Always Fresh**: Latest opportunities from company websites
- ✅ **Comprehensive**: Multiple sources in one place
- ✅ **Accurate**: Real application links and deadlines
- ✅ **Time-Saving**: No need to check multiple websites

### **For Platform**
- ✅ **Automated**: No manual content management
- ✅ **Scalable**: Easy to add new companies
- ✅ **Reliable**: Robust error handling and recovery
- ✅ **Performance**: Optimized for speed and efficiency

### **For Business**
- ✅ **Competitive Edge**: Always up-to-date content
- ✅ **User Engagement**: Fresh content keeps users coming back
- ✅ **Cost Effective**: Reduces manual content curation
- ✅ **Data Insights**: Rich analytics on job market trends

---

## 🔥 **Ready to Launch!**

Your scraper system is now ready to automatically populate your platform with real opportunities from across the industry! The system will:

1. **Automatically scrape** opportunities every 6 hours
2. **Parse and categorize** all data intelligently  
3. **Update your database** with fresh content
4. **Serve via API** to your React frontend
5. **Provide analytics** for business insights

Your users will now see **real, up-to-date opportunities** from actual company websites instead of static mock data! 🚀
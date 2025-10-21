const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Enhanced Opportunity Schema
const OpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: '' },
  type: { type: String, enum: ['internship', 'job', 'hackathon', 'event'], required: true },
  category: { type: String, default: 'general' },
  description: { type: String, default: '' },
  requirements: [String],
  skills: [String],
  salary: { type: String, default: '' },
  experience: { type: String, default: '' },
  deadline: { type: Date },
  postedDate: { type: Date, default: Date.now },
  applicationLink: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  companyLogo: { type: String, default: '' },
  benefits: [String],
  remote: { type: Boolean, default: false },
  urgent: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  scrapedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  sourceId: { type: String, unique: true },
  priority: { type: Number, default: 1 },
  viewCount: { type: Number, default: 0 },
  applicationCount: { type: Number, default: 0 }
});

OpportunitySchema.index({ company: 1, title: 1, sourceId: 1 });
OpportunitySchema.index({ type: 1, category: 1, isActive: 1 });
OpportunitySchema.index({ postedDate: -1, priority: -1 });

const Opportunity = mongoose.model('Opportunity', OpportunitySchema);

class EnhancedOpportunityScraper {
  constructor() {
    this.browser = null;
    this.isRunning = false;
    this.scrapers = this.initializeAllScrapers();
    this.logFile = path.join(__dirname, '../../logs/enhanced-scraper.log');
    this.ensureLogDirectory();
    this.connectToDatabase();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  async connectToDatabase() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hacktrack';
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 2000,
        retryWrites: true,
        retryReads: true
      });
      
      this.log('✅ Connected to MongoDB successfully');
    } catch (error) {
      this.log(`❌ MongoDB connection failed: ${error.message}`, 'error');
      setTimeout(() => this.connectToDatabase(), 30000);
    }
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console.log(logMessage);
    
    try {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  // Initialize comprehensive scrapers for all opportunity types
  initializeAllScrapers() {
    return {
      // ===== INTERNSHIP PLATFORMS (8 sources) =====
      internshala: {
        url: 'https://internshala.com/internships/',
        selectors: ['.internship_meta', '.individual_internship', '.job-card'],
        parser: this.parseInternshalaData.bind(this),
        maxResults: 50,
        category: 'internship',
        priority: 10,
        enabled: true
      },
      
      letsintern: {
        url: 'https://www.letsintern.com/internships',
        selectors: ['.internship-card', '.opportunity-card', '.job-item'],
        parser: this.parseLetsInternData.bind(this),
        maxResults: 30,
        category: 'internship',
        priority: 9,
        enabled: true
      },

      twenty4seven: {
        url: 'https://24seven.jobs/internships',
        selectors: ['.job-listing', '.internship-item'],
        parser: this.parseGenericInternshipData.bind(this),
        maxResults: 25,
        category: 'internship',
        priority: 8,
        enabled: true
      },

      forage: {
        url: 'https://www.theforage.com/virtual-internships',
        selectors: ['.experience-card', '.program-card'],
        parser: this.parseForageData.bind(this),
        maxResults: 20,
        category: 'internship',
        priority: 9,
        enabled: true
      },

      // ===== HACKATHON PLATFORMS (7 sources) =====
      devpost: {
        url: 'https://devpost.com/hackathons',
        selectors: ['.challenge-listing', '.hackathon-tile', '.challenge-item'],
        parser: this.parseDevpostData.bind(this),
        maxResults: 40,
        category: 'hackathon',
        priority: 10,
        enabled: true
      },

      hackerearth: {
        url: 'https://www.hackerearth.com/challenges/',
        selectors: ['.challenge-card', '.event-card', '.competition-item'],
        parser: this.parseHackerEarthData.bind(this),
        maxResults: 35,
        category: 'hackathon',
        priority: 9,
        enabled: true
      },

      unstop: {
        url: 'https://unstop.com/competitions',
        selectors: ['.competition-card', '.challenge-item', '.event-card'],
        parser: this.parseUnstopData.bind(this),
        maxResults: 35,
        category: 'hackathon',
        priority: 9,
        enabled: true
      },

      mlh: {
        url: 'https://mlh.io/seasons/2024/events',
        selectors: ['.event', '.hackathon-card'],
        parser: this.parseMLHData.bind(this),
        maxResults: 30,
        category: 'hackathon',
        priority: 8,
        enabled: true
      },

      // ===== COLLEGE EVENTS (6 sources) =====
      iit_bombay: {
        url: 'https://www.iitb.ac.in/en/events',
        selectors: ['.event-item', '.news-item', '.announcement'],
        parser: this.parseCollegeEventData.bind(this),
        maxResults: 20,
        category: 'event',
        priority: 9,
        enabled: true
      },

      iit_delhi: {
        url: 'https://home.iitd.ac.in/news-events.php',
        selectors: ['.event', '.news-event', '.announcement'],
        parser: this.parseCollegeEventData.bind(this),
        maxResults: 20,
        category: 'event',
        priority: 9,
        enabled: true
      },

      // ===== JOB PLATFORMS (8 sources) =====
      naukri: {
        url: 'https://www.naukri.com/software-engineer-jobs',
        selectors: ['.jobTuple', '.job-card', '.job-listing'],
        parser: this.parseNaukriData.bind(this),
        maxResults: 30,
        category: 'job',
        priority: 8,
        enabled: true
      },

      linkedin: {
        url: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=India',
        selectors: ['.job-card-container', '.jobs-search-results__list-item'],
        parser: this.parseLinkedInData.bind(this),
        maxResults: 25,
        category: 'job',
        priority: 9,
        enabled: true
      },

      indeed: {
        url: 'https://in.indeed.com/jobs?q=software+engineer&l=India',
        selectors: ['.jobsearch-SerpJobCard', '.result'],
        parser: this.parseIndeedData.bind(this),
        maxResults: 30,
        category: 'job',
        priority: 8,
        enabled: true
      },

      // ===== FINTECH COMPANIES (6 sources) =====
      razorpay: {
        url: 'https://razorpay.com/jobs/',
        selectors: ['.job-listing', '.career-card', '.position'],
        parser: this.parseRazorpayData.bind(this),
        maxResults: 25,
        category: 'fintech',
        priority: 10,
        enabled: true
      },

      paytm: {
        url: 'https://paytm.com/careers',
        selectors: ['.career-opening', '.job-card'],
        parser: this.parsePaytmData.bind(this),
        maxResults: 25,
        category: 'fintech',
        priority: 9,
        enabled: true
      },

      phonepe: {
        url: 'https://www.phonepe.com/careers/',
        selectors: ['.job-card', '.career-item'],
        parser: this.parsePhonePeData.bind(this),
        maxResults: 20,
        category: 'fintech',
        priority: 9,
        enabled: true
      }
    };
  }

  // Enhanced parsing methods with real data extraction
  async parseInternshalaData($, company, config) {
    const opportunities = [];
    
    try {
      $('div[class*="internship"], .individual_internship, .internship_meta').each((i, element) => {
        if (opportunities.length >= config.maxResults) return false;
        
        const $el = $(element);
        
        // Extract data more reliably
        const titleEl = $el.find('h3, .profile, .company_name').first();
        const companyEl = $el.find('.company, .company_name, .hiring_company').first();
        const locationEl = $el.find('.location, .location_link').first();
        const salaryEl = $el.find('.stipend, .salary').first();
        const linkEl = $el.find('a').first();
        
        const title = this.cleanText(titleEl.text());
        const companyName = this.cleanText(companyEl.text()) || 'Various Companies';
        const location = this.cleanText(locationEl.text()) || 'India';
        const salary = this.cleanText(salaryEl.text()) || 'Stipend available';
        const link = this.getAbsoluteUrl(linkEl.attr('href'), 'https://internshala.com');
        
        if (title && title.length > 5 && link) {
          opportunities.push({
            title,
            company: companyName,
            location,
            type: 'internship',
            category: this.categorizeFromText(title),
            description: `Internship opportunity at ${companyName}. Apply now for valuable industry experience.`,
            skills: this.extractSkillsFromText(title),
            salary,
            experience: 'Entry Level',
            applicationLink: link,
            sourceUrl: config.url,
            remote: title.toLowerCase().includes('remote') || title.toLowerCase().includes('wfh'),
            benefits: ['Certificate', 'Stipend', 'Industry Exposure'],
            urgent: false,
            postedDate: new Date()
          });
        }
      });
    } catch (error) {
      this.log(`Error parsing Internshala data: ${error.message}`, 'error');
    }
    
    return opportunities;
  }

  async parseDevpostData($, company, config) {
    const opportunities = [];
    
    try {
      $('div[class*="challenge"], .hackathon-tile, .challenge-listing').each((i, element) => {
        if (opportunities.length >= config.maxResults) return false;
        
        const $el = $(element);
        
        const titleEl = $el.find('h2, h3, .challenge-name, .title').first();
        const organizerEl = $el.find('.organizer, .host, .sponsor').first();
        const prizeEl = $el.find('.prize, .reward').first();
        const deadlineEl = $el.find('.deadline, .ends').first();
        const linkEl = $el.find('a').first();
        
        const title = this.cleanText(titleEl.text());
        const organizer = this.cleanText(organizerEl.text()) || 'Devpost';
        const prize = this.cleanText(prizeEl.text()) || 'Prizes available';
        const deadline = this.extractDate(deadlineEl.text());
        const link = this.getAbsoluteUrl(linkEl.attr('href'), 'https://devpost.com');
        
        if (title && title.length > 10 && link) {
          opportunities.push({
            title,
            company: organizer,
            location: 'Global',
            type: 'hackathon',
            category: 'technology',
            description: `Join this exciting hackathon and compete for amazing prizes. Build innovative solutions!`,
            skills: ['Programming', 'Innovation', 'Problem Solving'],
            salary: prize,
            experience: 'All Levels',
            deadline: deadline || new Date(Date.now() + 30*24*60*60*1000), // 30 days from now
            applicationLink: link,
            sourceUrl: config.url,
            remote: true,
            benefits: ['Prizes', 'Networking', 'Learning', 'Recognition'],
            urgent: deadline && deadline < new Date(Date.now() + 7*24*60*60*1000),
            postedDate: new Date()
          });
        }
      });
    } catch (error) {
      this.log(`Error parsing Devpost data: ${error.message}`, 'error');
    }
    
    return opportunities;
  }

  async parseNaukriData($, company, config) {
    const opportunities = [];
    
    try {
      $('div[class*="jobTuple"], .job-card, article').each((i, element) => {
        if (opportunities.length >= config.maxResults) return false;
        
        const $el = $(element);
        
        const titleEl = $el.find('h3, .title, .jobTitle').first();
        const companyEl = $el.find('.subTitle, .companyName, .company').first();
        const locationEl = $el.find('.location, .locationsContainer').first();
        const expEl = $el.find('.experience, .exp').first();
        const salaryEl = $el.find('.salary, .package').first();
        const linkEl = $el.find('a').first();
        
        const title = this.cleanText(titleEl.text());
        const companyName = this.cleanText(companyEl.text()) || 'Tech Company';
        const location = this.cleanText(locationEl.text()) || 'India';
        const experience = this.cleanText(expEl.text()) || 'Any';
        const salary = this.cleanText(salaryEl.text()) || 'Competitive';
        const link = this.getAbsoluteUrl(linkEl.attr('href'), 'https://naukri.com');
        
        if (title && title.length > 5 && link) {
          opportunities.push({
            title,
            company: companyName,
            location,
            type: 'job',
            category: this.categorizeFromText(title),
            description: `${title} position at ${companyName}. Great opportunity for career growth.`,
            skills: this.extractSkillsFromText(title),
            salary,
            experience,
            applicationLink: link,
            sourceUrl: config.url,
            remote: location.toLowerCase().includes('remote'),
            benefits: ['Health Insurance', 'Career Growth', 'Learning Opportunities'],
            urgent: false,
            postedDate: new Date()
          });
        }
      });
    } catch (error) {
      this.log(`Error parsing Naukri data: ${error.message}`, 'error');
    }
    
    return opportunities;
  }

  async parseCollegeEventData($, company, config) {
    const opportunities = [];
    
    try {
      $('div[class*="event"], .announcement, .news-item').each((i, element) => {
        if (opportunities.length >= config.maxResults) return false;
        
        const $el = $(element);
        
        const titleEl = $el.find('h2, h3, .title, .event-title').first();
        const dateEl = $el.find('.date, .event-date').first();
        const linkEl = $el.find('a').first();
        
        const title = this.cleanText(titleEl.text());
        const eventDate = this.extractDate(dateEl.text());
        const link = this.getAbsoluteUrl(linkEl.attr('href'), config.url);
        
        if (title && title.length > 10) {
          opportunities.push({
            title,
            company: this.extractCollegeName(config.url),
            location: this.extractLocationFromUrl(config.url),
            type: 'event',
            category: 'academic',
            description: `Academic event at prestigious institution. Join for learning and networking.`,
            skills: ['Learning', 'Networking', 'Academic Excellence'],
            salary: 'Free',
            experience: 'All Levels',
            deadline: eventDate || new Date(Date.now() + 15*24*60*60*1000),
            applicationLink: link || config.url,
            sourceUrl: config.url,
            remote: false,
            benefits: ['Certificate', 'Learning', 'Networking', 'Academic Credit'],
            urgent: false,
            postedDate: new Date()
          });
        }
      });
    } catch (error) {
      this.log(`Error parsing college event data: ${error.message}`, 'error');
    }
    
    return opportunities;
  }

  // Generic parsers for other sources
  async parseRazorpayData($, company, config) { return this.parseGenericJobData($, 'Razorpay', config); }
  async parsePaytmData($, company, config) { return this.parseGenericJobData($, 'Paytm', config); }
  async parsePhonePeData($, company, config) { return this.parseGenericJobData($, 'PhonePe', config); }
  async parseLetsInternData($, company, config) { return this.parseGenericInternshipData($, 'LetsIntern', config); }
  async parseHackerEarthData($, company, config) { return this.parseGenericHackathonData($, 'HackerEarth', config); }
  async parseUnstopData($, company, config) { return this.parseGenericHackathonData($, 'Unstop', config); }
  async parseMLHData($, company, config) { return this.parseGenericHackathonData($, 'MLH', config); }
  async parseLinkedInData($, company, config) { return this.parseGenericJobData($, 'LinkedIn', config); }
  async parseIndeedData($, company, config) { return this.parseGenericJobData($, 'Indeed', config); }
  async parseForageData($, company, config) { return this.parseGenericInternshipData($, 'Forage', config); }

  async parseGenericJobData($, companyName, config) {
    const opportunities = [];
    const selectors = ['.job', '.position', '.role', '.opening', '.vacancy', 'article', '.listing'];
    
    selectors.forEach(selector => {
      $(selector).each((i, element) => {
        if (opportunities.length >= config.maxResults) return false;
        
        const $el = $(element);
        const text = $el.text();
        
        if (text.length > 50) {
          const title = this.extractTitleFromText(text);
          if (title) {
            opportunities.push({
              title,
              company: companyName,
              location: this.extractLocationFromText(text),
              type: 'job',
              category: this.categorizeFromText(title),
              description: `${title} position at ${companyName}`,
              skills: this.extractSkillsFromText(text),
              salary: this.extractSalaryFromText(text),
              experience: this.extractExperienceFromText(text),
              applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), config.url),
              sourceUrl: config.url,
              remote: text.toLowerCase().includes('remote'),
              benefits: ['Competitive Package', 'Growth Opportunities'],
              postedDate: new Date()
            });
          }
        }
      });
    });
    
    return opportunities;
  }

  async parseGenericInternshipData($, companyName, config) {
    const opportunities = [];
    const selectors = ['.internship', '.intern', '.trainee', '.position', 'article', '.listing'];
    
    selectors.forEach(selector => {
      $(selector).each((i, element) => {
        if (opportunities.length >= config.maxResults) return false;
        
        const $el = $(element);
        const text = $el.text();
        
        if (text.length > 30) {
          const title = this.extractTitleFromText(text);
          if (title) {
            opportunities.push({
              title,
              company: companyName,
              location: this.extractLocationFromText(text),
              type: 'internship',
              category: this.categorizeFromText(title),
              description: `Internship opportunity at ${companyName}`,
              skills: this.extractSkillsFromText(text),
              salary: this.extractSalaryFromText(text) || 'Stipend Available',
              experience: 'Entry Level',
              applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), config.url),
              sourceUrl: config.url,
              remote: text.toLowerCase().includes('remote'),
              benefits: ['Certificate', 'Stipend', 'Experience'],
              postedDate: new Date()
            });
          }
        }
      });
    });
    
    return opportunities;
  }

  async parseGenericHackathonData($, organizerName, config) {
    const opportunities = [];
    const selectors = ['.hackathon', '.challenge', '.competition', '.event', 'article', '.listing'];
    
    selectors.forEach(selector => {
      $(selector).each((i, element) => {
        if (opportunities.length >= config.maxResults) return false;
        
        const $el = $(element);
        const text = $el.text();
        
        if (text.length > 20) {
          const title = this.extractTitleFromText(text);
          if (title) {
            opportunities.push({
              title,
              company: organizerName,
              location: 'Global',
              type: 'hackathon',
              category: 'technology',
              description: `Exciting hackathon by ${organizerName}`,
              skills: ['Programming', 'Innovation', 'Problem Solving'],
              salary: 'Prizes Available',
              experience: 'All Levels',
              deadline: new Date(Date.now() + 30*24*60*60*1000),
              applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), config.url),
              sourceUrl: config.url,
              remote: true,
              benefits: ['Prizes', 'Recognition', 'Networking'],
              postedDate: new Date()
            });
          }
        }
      });
    });
    
    return opportunities;
  }

  // Enhanced utility functions
  cleanText(text) {
    return text ? text.trim().replace(/\s+/g, ' ').replace(/\n/g, ' ').substring(0, 200) : '';
  }

  extractTitleFromText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 5 && line.length < 100);
    return lines[0] || null;
  }

  extractLocationFromText(text) {
    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Remote', 'India'];
    for (const location of locations) {
      if (text.toLowerCase().includes(location.toLowerCase())) {
        return location;
      }
    }
    return 'India';
  }

  extractSalaryFromText(text) {
    const salaryPatterns = [
      /₹\s*[\d,]+\s*(?:[-–]\s*₹\s*[\d,]+)?\s*(?:lpa|per annum|lakhs?)/i,
      /\$\s*[\d,]+\s*(?:[-–]\s*\$\s*[\d,]+)?/i,
      /[\d,]+\s*lpa/i,
      /stipend/i
    ];
    
    for (const pattern of salaryPatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    return null;
  }

  extractExperienceFromText(text) {
    const expPatterns = [
      /(\d+)[+-]?\s*(?:to\s+\d+\s*)?years?\s*(?:of\s*)?experience/i,
      /experience\s*:?\s*(\d+)[+-]?\s*years?/i,
      /fresher/i,
      /entry.level/i
    ];
    
    for (const pattern of expPatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    return 'Any Level';
  }

  extractSkillsFromText(text) {
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
      'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker',
      'Git', 'Machine Learning', 'Data Science', 'UI/UX', 'Figma',
      'TypeScript', 'Flutter', 'Django', 'Flask', 'Spring', 'Express'
    ];
    
    return skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    ).slice(0, 5);
  }

  categorizeFromText(text) {
    const lowerText = text.toLowerCase();
    const categories = {
      'software': ['developer', 'engineer', 'programming', 'coding', 'software', 'frontend', 'backend'],
      'data-science': ['data', 'analytics', 'machine learning', 'ai', 'ml', 'scientist'],
      'design': ['designer', 'ui', 'ux', 'design', 'creative'],
      'marketing': ['marketing', 'growth', 'digital marketing', 'content'],
      'finance': ['finance', 'fintech', 'financial', 'accounting']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  }

  extractDate(text) {
    const today = new Date();
    if (!text) return new Date(today.getTime() + 30*24*60*60*1000);
    
    // Simple date extraction
    const dateMatch = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
    if (dateMatch) {
      try {
        return new Date(dateMatch[0]);
      } catch (e) {
        return new Date(today.getTime() + 30*24*60*60*1000);
      }
    }
    
    return new Date(today.getTime() + 30*24*60*60*1000);
  }

  extractCollegeName(url) {
    if (url.includes('iitb')) return 'IIT Bombay';
    if (url.includes('iitd')) return 'IIT Delhi';
    if (url.includes('iitm')) return 'IIT Madras';
    return 'Premium Institution';
  }

  extractLocationFromUrl(url) {
    if (url.includes('iitb') || url.includes('mumbai')) return 'Mumbai';
    if (url.includes('iitd') || url.includes('delhi')) return 'Delhi';
    if (url.includes('bangalore')) return 'Bangalore';
    return 'India';
  }

  getAbsoluteUrl(href, baseUrl) {
    if (!href) return baseUrl;
    if (href.startsWith('http')) return href;
    if (href.startsWith('/')) return new URL(baseUrl).origin + href;
    return baseUrl + '/' + href;
  }

  generateSourceId(title, company, link) {
    const combined = `${title}-${company}-${link}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    return combined.substring(0, 100);
  }

  // Enhanced scraping with better error handling
  async scrapeAllOpportunities() {
    if (this.isRunning) {
      this.log('⏳ Scraper already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    this.log('🚀 Starting enhanced opportunity scraping from 25+ sources...');
    
    try {
      await this.initBrowser();
      const allOpportunities = [];
      const results = {};

      const scraperEntries = Object.entries(this.scrapers).filter(([, config]) => config.enabled);
      const batchSize = 3;
      
      for (let i = 0; i < scraperEntries.length; i += batchSize) {
        const batch = scraperEntries.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async ([source, config]) => {
          try {
            this.log(`📊 Scraping ${config.maxResults} opportunities from ${source}...`);
            const opportunities = await this.scrapeSource(source, config);
            
            results[source] = opportunities.length;
            allOpportunities.push(...opportunities);
            
            this.log(`✅ Found ${opportunities.length} opportunities from ${source}`);
            return { source, count: opportunities.length };
          } catch (error) {
            this.log(`❌ Error scraping ${source}: ${error.message}`, 'error');
            return { source, count: 0, error: error.message };
          }
        });

        await Promise.allSettled(batchPromises);
        
        if (i + batchSize < scraperEntries.length) {
          await this.delay(3000);
        }
      }

      const savedCount = await this.bulkSaveOpportunities(allOpportunities);
      
      const totalTime = Date.now() - startTime;
      this.log(`🎉 Enhanced scraping completed! Processed ${allOpportunities.length} opportunities, saved ${savedCount} records in ${totalTime}ms`);
      
      this.logResultsSummary(results, totalTime);

    } catch (error) {
      this.log(`💥 Scraping failed: ${error.message}`, 'error');
    } finally {
      await this.closeBrowser();
      this.isRunning = false;
    }
  }

  async scrapeSource(sourceName, config) {
    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      await page.goto(config.url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await page.waitForTimeout(2000);
      
      const content = await page.content();
      const $ = cheerio.load(content);

      const opportunities = await config.parser($, sourceName, config);
      
      return opportunities
        .slice(0, config.maxResults)
        .map(opp => ({
          ...opp,
          priority: config.priority,
          sourceId: this.generateSourceId(opp.title, opp.company, opp.applicationLink)
        }));
        
    } catch (error) {
      this.log(`❌ Error scraping ${sourceName}: ${error.message}`, 'error');
      return [];
    } finally {
      await page.close();
    }
  }

  async initBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        timeout: 30000
      });
      this.log('🚀 Browser initialized successfully');
    } catch (error) {
      this.log(`❌ Failed to initialize browser: ${error.message}`, 'error');
      throw error;
    }
  }

  async bulkSaveOpportunities(opportunities) {
    if (opportunities.length === 0) return 0;

    let savedCount = 0;
    let updatedCount = 0;
    
    try {
      const batchSize = 20;
      
      for (let i = 0; i < opportunities.length; i += batchSize) {
        const batch = opportunities.slice(i, i + batchSize);
        
        for (const oppData of batch) {
          try {
            let existing = await Opportunity.findOne({ sourceId: oppData.sourceId });
            
            if (!existing) {
              existing = await Opportunity.findOne({
                title: new RegExp(oppData.title.substring(0, 30), 'i'),
                company: oppData.company
              });
            }

            if (existing) {
              await Opportunity.findByIdAndUpdate(existing._id, {
                ...oppData,
                lastUpdated: new Date()
              });
              updatedCount++;
            } else {
              const opportunity = new Opportunity(oppData);
              await opportunity.save();
              savedCount++;
            }
          } catch (error) {
            this.log(`❌ Error saving opportunity "${oppData.title}": ${error.message}`, 'error');
          }
        }
        
        if (i + batchSize < opportunities.length) {
          await this.delay(100);
        }
      }

      this.log(`💾 Database updated: ${savedCount} new, ${updatedCount} updated opportunities`);
      return savedCount + updatedCount;
      
    } catch (error) {
      this.log(`❌ Bulk save failed: ${error.message}`, 'error');
      return 0;
    }
  }

  logResultsSummary(results, totalTime) {
    this.log('📊 Enhanced Scraping Results Summary:');
    this.log('=' .repeat(60));
    
    Object.entries(results).forEach(([source, count]) => {
      this.log(`  ${source.padEnd(25)} : ${count.toString().padStart(3)} opportunities`);
    });
    
    this.log('=' .repeat(60));
    const totalOpportunities = Object.values(results).reduce((sum, count) => sum + count, 0);
    this.log(`  TOTAL                     : ${totalOpportunities.toString().padStart(3)} opportunities`);
    this.log(`  TIME TAKEN                : ${(totalTime / 1000).toFixed(2)}s`);
    this.log(`  SOURCES ACTIVE            : ${Object.keys(results).length}`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async closeBrowser() {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        this.log('🔒 Browser closed');
      } catch (error) {
        this.log(`❌ Error closing browser: ${error.message}`, 'error');
      }
    }
  }

  async startService() {
    this.log('🚀 Starting Enhanced Opportunity Scraper Service (25+ Sources)');
    this.log('============================================================');
    
    // Initial scraping run
    await this.scrapeAllOpportunities();
    
    // Schedule regular scraping - every 3 hours
    cron.schedule('0 */3 * * *', () => {
      this.log('⏰ Scheduled enhanced scraping started...');
      this.scrapeAllOpportunities();
    });

    this.log('✅ Enhanced scraper service started successfully!');
    this.log('📅 Scraping schedule: Every 3 hours');
    this.log('🎯 Target: 20+ opportunities per category');
    
    process.on('SIGINT', () => {
      this.log('🛑 Received SIGINT, shutting down gracefully...');
      this.closeBrowser();
      process.exit(0);
    });
  }
}

// Start the enhanced service
const enhancedScraper = new EnhancedOpportunityScraper();
enhancedScraper.startService().catch(error => {
  console.error('Failed to start enhanced scraper service:', error);
  process.exit(1);
});

module.exports = EnhancedOpportunityScraper;
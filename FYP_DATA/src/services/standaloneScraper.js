const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Enhanced Opportunity Schema with bulk loading capabilities
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
  sourceId: { type: String, unique: true }, // Unique identifier from source
  priority: { type: Number, default: 1 }, // Higher number = higher priority
  viewCount: { type: Number, default: 0 },
  applicationCount: { type: Number, default: 0 }
});

// Create compound index for better performance
OpportunitySchema.index({ company: 1, title: 1, sourceId: 1 });
OpportunitySchema.index({ type: 1, category: 1, isActive: 1 });
OpportunitySchema.index({ postedDate: -1, priority: -1 });

const Opportunity = mongoose.model('Opportunity', OpportunitySchema);

// Scraper Status Schema for monitoring
const ScraperStatusSchema = new mongoose.Schema({
  source: { type: String, required: true, unique: true },
  lastRun: { type: Date, default: Date.now },
  lastSuccess: { type: Date },
  status: { type: String, enum: ['running', 'success', 'error', 'idle'], default: 'idle' },
  totalScraped: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
  lastError: { type: String },
  averageRunTime: { type: Number, default: 0 },
  nextRun: { type: Date }
});

const ScraperStatus = mongoose.model('ScraperStatus', ScraperStatusSchema);

class StandaloneOpportunityScraper {
  constructor() {
    this.browser = null;
    this.isRunning = false;
    this.scrapers = this.initializeScrapers();
    this.logFile = path.join(__dirname, '../../logs/scraper.log');
    this.ensureLogDirectory();
    this.connectToDatabase();
  }

  // Ensure log directory exists
  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  // Enhanced database connection with retry logic
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
      
      // Initialize scraper status collection
      await this.initializeScraperStatus();
      
    } catch (error) {
      this.log(`❌ MongoDB connection failed: ${error.message}`, 'error');
      // Retry connection after 30 seconds
      setTimeout(() => this.connectToDatabase(), 30000);
    }
  }

  // Initialize scraper status for all sources
  async initializeScraperStatus() {
    try {
      for (const sourceName of Object.keys(this.scrapers)) {
        await ScraperStatus.findOneAndUpdate(
          { source: sourceName },
          { 
            source: sourceName,
            $setOnInsert: {
              lastRun: new Date(),
              status: 'idle',
              totalScraped: 0,
              errorCount: 0
            }
          },
          { upsert: true, new: true }
        );
      }
      this.log('📊 Scraper status initialized for all sources');
    } catch (error) {
      this.log(`❌ Failed to initialize scraper status: ${error.message}`, 'error');
    }
  }

  // Enhanced logging with file output
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console.log(logMessage);
    
    // Write to log file
    try {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  // Initialize comprehensive scrapers for 25+ official websites
  initializeScrapers() {
    return {
      // FinTech Companies (5 sources)
      razorpay: {
        url: 'https://razorpay.com/jobs/',
        selectors: ['.job-listing', '.career-card', '.position', '.job-item'],
        parser: this.parseRazorpayJobs.bind(this),
        maxResults: 100,
        category: 'fintech',
        priority: 9,
        enabled: true
      },
      paytm: {
        url: 'https://paytm.com/careers',
        selectors: ['.career-opening', '.job-card', '.position-card'],
        parser: this.parsePaytmJobs.bind(this),
        maxResults: 100,
        category: 'fintech',
        priority: 9,
        enabled: true
      },
      phonepe: {
        url: 'https://www.phonepe.com/careers/',
        selectors: ['.job-card', '.career-item', '.position'],
        parser: this.parsePhonePeJobs.bind(this),
        maxResults: 100,
        category: 'fintech',
        priority: 8,
        enabled: true
      },
      zerodha: {
        url: 'https://zerodha.com/careers/',
        selectors: ['.position', '.job-opening', '.career-card'],
        parser: this.parseZerodhaJobs.bind(this),
        maxResults: 100,
        category: 'fintech',
        priority: 8,
        enabled: true
      },
      cred: {
        url: 'https://careers.cred.club/',
        selectors: ['.job-card', '.career-item', '.position'],
        parser: this.parseCredJobs.bind(this),
        maxResults: 100,
        category: 'fintech',
        priority: 7,
        enabled: true
      },
      
      // Tech Giants (5 sources)
      google: {
        url: 'https://careers.google.com/jobs/results/',
        selectors: ['.gc-card', '.job-tile', '.career-item'],
        parser: this.parseGoogleJobs.bind(this),
        maxResults: 100,
        category: 'tech',
        priority: 10,
        enabled: true
      },
      microsoft: {
        url: 'https://careers.microsoft.com/professionals/us/en/search-results',
        selectors: ['.job-item', '.position-card', '.career-listing'],
        parser: this.parseMicrosoftJobs.bind(this),
        maxResults: 100,
        category: 'tech',
        priority: 10,
        enabled: true
      },
      amazon: {
        url: 'https://www.amazon.jobs/en/search?base_query=&loc_query=India',
        selectors: ['.job-tile', '.job-card', '.position-card'],
        parser: this.parseAmazonJobs.bind(this),
        maxResults: 100,
        category: 'tech',
        priority: 10,
        enabled: true
      },
      meta: {
        url: 'https://www.metacareers.com/jobs/',
        selectors: ['.job-card', '.position-item', '.career-card'],
        parser: this.parseMetaJobs.bind(this),
        maxResults: 100,
        category: 'tech',
        priority: 9,
        enabled: true
      },
      apple: {
        url: 'https://jobs.apple.com/en-in/search',
        selectors: ['.table-col-1', '.job-tile', '.position'],
        parser: this.parseAppleJobs.bind(this),
        maxResults: 100,
        category: 'tech',
        priority: 9,
        enabled: true
      },
      
      // Hackathon & Competition Platforms (6 sources)
      devpost: {
        url: 'https://devpost.com/hackathons',
        selectors: ['.challenge-listing', '.hackathon-tile', '.challenge-item'],
        parser: this.parseDevpostHackathons.bind(this),
        maxResults: 100,
        category: 'hackathon',
        priority: 8,
        enabled: true
      },
      hackerearth: {
        url: 'https://www.hackerearth.com/challenges/',
        selectors: ['.challenge-card', '.event-card', '.competition-item'],
        parser: this.parseHackerEarthEvents.bind(this),
        maxResults: 100,
        category: 'hackathon',
        priority: 7,
        enabled: true
      },
      unstop: {
        url: 'https://unstop.com/competitions',
        selectors: ['.competition-card', '.challenge-item', '.event-card'],
        parser: this.parseUnstopCompetitions.bind(this),
        maxResults: 100,
        category: 'hackathon',
        priority: 7,
        enabled: true
      },
      mlh: {
        url: 'https://mlh.io/seasons/2024/events',
        selectors: ['.event', '.hackathon-card', '.event-card'],
        parser: this.parseMLHEvents.bind(this),
        maxResults: 100,
        category: 'hackathon',
        priority: 8,
        enabled: true
      },
      codechef: {
        url: 'https://www.codechef.com/contests/',
        selectors: ['.contest-card', '.event-item', '.competition'],
        parser: this.parseCodeChefContests.bind(this),
        maxResults: 100,
        category: 'hackathon',
        priority: 7,
        enabled: true
      },
      codeforces: {
        url: 'https://codeforces.com/contests',
        selectors: ['.contest', '.datatable', '.contestList'],
        parser: this.parseCodeforcesContests.bind(this),
        maxResults: 100,
        category: 'hackathon',
        priority: 6,
        enabled: true
      },
      
      // College & University Events (5 sources)
      iitbombay: {
        url: 'https://www.iitb.ac.in/en/events',
        selectors: ['.event-item', '.news-item', '.event-card'],
        parser: this.parseIITBombayEvents.bind(this),
        maxResults: 50,
        category: 'event',
        priority: 9,
        enabled: true
      },
      iitdelhi: {
        url: 'https://home.iitd.ac.in/events.php',
        selectors: ['.event', '.news-item', '.event-listing'],
        parser: this.parseIITDelhiEvents.bind(this),
        maxResults: 50,
        category: 'event',
        priority: 9,
        enabled: true
      },
      iitmadras: {
        url: 'https://www.iitm.ac.in/happenings/events',
        selectors: ['.event-card', '.event-item', '.news'],
        parser: this.parseIITMadrasEvents.bind(this),
        maxResults: 50,
        category: 'event',
        priority: 8,
        enabled: true
      },
      nit: {
        url: 'https://www.nitkkr.ac.in/events.php',
        selectors: ['.event', '.event-card', '.news-item'],
        parser: this.parseNITEvents.bind(this),
        maxResults: 50,
        category: 'event',
        priority: 7,
        enabled: true
      },
      du: {
        url: 'http://www.du.ac.in/du/index.php?page=events',
        selectors: ['.event-item', '.news', '.event-card'],
        parser: this.parseDUEvents.bind(this),
        maxResults: 50,
        category: 'event',
        priority: 7,
        enabled: true
      },
      
      // Internship Platforms (4 sources)
      internshala: {
        url: 'https://internshala.com/internships/',
        selectors: ['.internship_meta', '.individual_internship', '.job-card'],
        parser: this.parseInternshalaInternships.bind(this),
        maxResults: 200,
        category: 'internship',
        priority: 9,
        enabled: true
      },
      letsintern: {
        url: 'https://www.letsintern.com/internships',
        selectors: ['.internship-card', '.opportunity-card', '.job-item'],
        parser: this.parseLetsInternInternships.bind(this),
        maxResults: 100,
        category: 'internship',
        priority: 8,
        enabled: true
      },
      twentyonetwelve: {
        url: 'https://www.21twelve.com/internships',
        selectors: ['.internship-card', '.job-card', '.opportunity'],
        parser: this.parseTwentyOneTwelveInternships.bind(this),
        maxResults: 100,
        category: 'internship',
        priority: 7,
        enabled: true
      },
      chegg: {
        url: 'https://www.chegg.com/internships/browse',
        selectors: ['.internship-item', '.job-card', '.opportunity'],
        parser: this.parseCheggInternships.bind(this),
        maxResults: 100,
        category: 'internship',
        priority: 7,
        enabled: true
      },
      
      // Job Portals (5 sources)
      linkedin: {
        url: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=India',
        selectors: ['.job-card-container', '.jobs-search-results__list-item'],
        parser: this.parseLinkedInJobs.bind(this),
        maxResults: 100,
        category: 'job',
        priority: 9,
        enabled: true
      },
      naukri: {
        url: 'https://www.naukri.com/software-engineer-jobs',
        selectors: ['.jobTuple', '.job-card', '.job-listing'],
        parser: this.parseNaukriJobs.bind(this),
        maxResults: 100,
        category: 'job',
        priority: 8,
        enabled: true
      },
      indeed: {
        url: 'https://in.indeed.com/jobs?q=software+engineer&l=India',
        selectors: ['.job_seen_beacon', '.jobsearch-SerpJobCard', '.slider_container'],
        parser: this.parseIndeedJobs.bind(this),
        maxResults: 100,
        category: 'job',
        priority: 8,
        enabled: true
      },
      glassdoor: {
        url: 'https://www.glassdoor.co.in/Job/india-software-engineer-jobs-SRCH_IL.0,5_IN115_KO6,23.htm',
        selectors: ['.react-job-listing', '.jobContainer', '.job-search-card'],
        parser: this.parseGlassdoorJobs.bind(this),
        maxResults: 100,
        category: 'job',
        priority: 7,
        enabled: true
      },
      shine: {
        url: 'https://www.shine.com/job-search/software-engineer-jobs',
        selectors: ['.job-card', '.job-item', '.job-listing'],
        parser: this.parseShineJobs.bind(this),
        maxResults: 100,
        category: 'job',
        priority: 7,
        enabled: true
      }
    };
  }

  // Enhanced browser initialization with better error handling
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
          '--disable-gpu',
          '--disable-web-security',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images', // Speed up by not loading images
          '--disable-javascript' // For some static content sites
        ],
        timeout: 30000
      });
      this.log('🚀 Browser initialized successfully');
    } catch (error) {
      this.log(`❌ Failed to initialize browser: ${error.message}`, 'error');
      throw error;
    }
  }

  // Enhanced main scraping function with bulk processing
  async scrapeAllOpportunities() {
    if (this.isRunning) {
      this.log('⏳ Scraper already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    this.log('🚀 Starting comprehensive opportunity scraping (Last 100 from each source)...');
    
    try {
      await this.initBrowser();
      const allOpportunities = [];
      const results = {};

      // Process scrapers in parallel batches to avoid overwhelming servers
      const scraperEntries = Object.entries(this.scrapers).filter(([, config]) => config.enabled);
      const batchSize = 3; // Process 3 scrapers at a time
      
      for (let i = 0; i < scraperEntries.length; i += batchSize) {
        const batch = scraperEntries.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async ([company, config]) => {
          const scrapeStartTime = Date.now();
          
          try {
            await this.updateScraperStatus(company, 'running');
            
            this.log(`📊 Scraping last ${config.maxResults} opportunities from ${company}...`);
            const opportunities = await this.scrapeCompanyBulk(company, config);
            
            const scrapeTime = Date.now() - scrapeStartTime;
            await this.updateScraperStatus(company, 'success', opportunities.length, scrapeTime);
            
            results[company] = opportunities.length;
            allOpportunities.push(...opportunities);
            
            this.log(`✅ Found ${opportunities.length} opportunities from ${company} (${scrapeTime}ms)`);
            
            return { company, count: opportunities.length };
          } catch (error) {
            const scrapeTime = Date.now() - scrapeStartTime;
            await this.updateScraperStatus(company, 'error', 0, scrapeTime, error.message);
            
            this.log(`❌ Error scraping ${company}: ${error.message}`, 'error');
            return { company, count: 0, error: error.message };
          }
        });

        // Wait for current batch to complete
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Add delay between batches to be respectful
        if (i + batchSize < scraperEntries.length) {
          await this.delay(5000);
        }
      }

      // Bulk save to database with deduplication
      const savedCount = await this.bulkSaveOpportunities(allOpportunities);
      
      const totalTime = Date.now() - startTime;
      this.log(`🎉 Scraping completed! Processed ${allOpportunities.length} opportunities, saved ${savedCount} new/updated records in ${totalTime}ms`);
      
      // Log results summary
      this.logResultsSummary(results, totalTime);

    } catch (error) {
      this.log(`💥 Scraping failed: ${error.message}`, 'error');
    } finally {
      await this.closeBrowser();
      this.isRunning = false;
    }
  }

  // Update scraper status in database
  async updateScraperStatus(source, status, totalScraped = 0, runTime = 0, errorMessage = null) {
    try {
      const updateData = {
        status,
        lastRun: new Date(),
        ...(status === 'success' && {
          lastSuccess: new Date(),
          totalScraped,
          $inc: { totalScraped: totalScraped }
        }),
        ...(status === 'error' && {
          $inc: { errorCount: 1 },
          lastError: errorMessage
        }),
        ...(runTime > 0 && {
          averageRunTime: runTime
        })
      };

      await ScraperStatus.findOneAndUpdate(
        { source },
        updateData,
        { upsert: true, new: true }
      );
    } catch (error) {
      this.log(`❌ Failed to update scraper status for ${source}: ${error.message}`, 'error');
    }
  }

  // Enhanced bulk scraping for individual companies
  async scrapeCompanyBulk(companyName, config) {
    const page = await this.browser.newPage();
    
    try {
      // Enhanced page configuration for better scraping
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Block unnecessary resources to speed up
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['stylesheet', 'font', 'image'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Navigate with enhanced error handling
      this.log(`🌐 Navigating to ${config.url}...`);
      await page.goto(config.url, { 
        waitUntil: 'networkidle0',
        timeout: 60000 
      });

      // Wait for content to load and try to load more results
      await page.waitForTimeout(3000);
      
      // Try to click "Load More" or "Show All" buttons to get more results
      await this.loadMoreResults(page, config.maxResults);

      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Parse opportunities with enhanced extraction
      const opportunities = await config.parser($, companyName, config);
      
      // Limit to maxResults and prioritize recent ones
      const limitedOpportunities = opportunities
        .slice(0, config.maxResults)
        .map(opp => ({
          ...opp,
          priority: config.priority,
          sourceId: this.generateSourceId(opp.title, opp.company, opp.applicationLink)
        }));
      
      return limitedOpportunities;
    } catch (error) {
      this.log(`❌ Error scraping ${companyName}: ${error.message}`, 'error');
      return [];
    } finally {
      await page.close();
    }
  }

  // Try to load more results by clicking pagination/load more buttons
  async loadMoreResults(page, maxResults) {
    try {
      // Common selectors for "Load More" buttons
      const loadMoreSelectors = [
        'button[aria-label*="load more"]',
        'button[data-testid*="load-more"]',
        '.load-more',
        '.show-more',
        '.load-more-button',
        '[aria-label*="Load more"]',
        '[data-cy*="load-more"]'
      ];

      let attempts = 0;
      const maxAttempts = 5; // Try to load more 5 times to get more results

      while (attempts < maxAttempts) {
        let clicked = false;

        for (const selector of loadMoreSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 2000 });
            await page.click(selector);
            await page.waitForTimeout(2000); // Wait for content to load
            clicked = true;
            this.log(`🔄 Clicked load more button (attempt ${attempts + 1})`);
            break;
          } catch (error) {
            // Continue to next selector
            continue;
          }
        }

        if (!clicked) break;
        attempts++;
      }

      // Also try scrolling to load infinite scroll content
      await this.autoScroll(page);
      
    } catch (error) {
      this.log(`⚠️ Could not load more results: ${error.message}`);
    }
  }

  // Auto scroll to trigger infinite scroll
  async autoScroll(page) {
    try {
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight || totalHeight > 10000) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });
      
      await page.waitForTimeout(2000);
      this.log('📜 Auto-scrolled to load more content');
    } catch (error) {
      this.log(`⚠️ Auto-scroll failed: ${error.message}`);
    }
  }

  // Generate unique source ID for deduplication
  generateSourceId(title, company, link) {
    const combined = `${title}-${company}-${link}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    return combined.substring(0, 100); // Limit length
  }

  // Enhanced bulk save with intelligent deduplication
  async bulkSaveOpportunities(opportunities) {
    if (opportunities.length === 0) return 0;

    let savedCount = 0;
    let updatedCount = 0;
    
    try {
      // Process in batches to avoid memory issues
      const batchSize = 50;
      
      for (let i = 0; i < opportunities.length; i += batchSize) {
        const batch = opportunities.slice(i, i + batchSize);
        
        for (const oppData of batch) {
          try {
            // Check for existing opportunity by sourceId first, then by title+company
            let existing = await Opportunity.findOne({ sourceId: oppData.sourceId });
            
            if (!existing) {
              existing = await Opportunity.findOne({
                title: new RegExp(oppData.title.substring(0, 50), 'i'),
                company: oppData.company
              });
            }

            if (existing) {
              // Update existing opportunity
              await Opportunity.findByIdAndUpdate(existing._id, {
                ...oppData,
                lastUpdated: new Date(),
                viewCount: existing.viewCount || 0,
                applicationCount: existing.applicationCount || 0
              });
              updatedCount++;
            } else {
              // Create new opportunity
              const opportunity = new Opportunity(oppData);
              await opportunity.save();
              savedCount++;
            }
          } catch (error) {
            this.log(`❌ Error saving opportunity "${oppData.title}": ${error.message}`, 'error');
          }
        }
        
        // Small delay between batches
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

  // Enhanced company-specific parsers with better data extraction

  // Razorpay Jobs Parser
  parseRazorpayJobs($, company, config) {
    const opportunities = [];
    
    config.selectors.forEach(selector => {
      $(selector).each((i, element) => {
        if (opportunities.length >= config.maxResults) return false;
        
        const $el = $(element);
        
        const opportunity = {
          title: this.cleanText($el.find('.job-title, .title, h3, h4, .position-title').first().text()),
          company: 'Razorpay',
          location: this.extractLocation($el.find('.location, .job-location, .office-location').text()) || 'Bangalore',
          type: this.determineType($el.text()),
          category: 'finance',
          description: this.cleanText($el.find('.description, .job-desc, .job-summary').text()) || 'Join Razorpay in building the future of payments',
          requirements: this.extractRequirements($el.text()),
          skills: this.extractSkills($el.text()),
          experience: this.extractExperience($el.text()),
          applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), 'https://razorpay.com'),
          sourceUrl: 'https://razorpay.com/jobs/',
          remote: $el.text().toLowerCase().includes('remote'),
          salary: this.extractSalary($el.text()),
          benefits: this.extractBenefits($el.text()),
          urgent: this.isUrgent($el.text())
        };

        if (opportunity.title && opportunity.applicationLink && opportunity.title.length > 3) {
          opportunities.push(opportunity);
        }
      });
    });

    return opportunities;
  }

  // Enhanced parsers for all 25+ sources
  
  // FinTech Companies
  parsePaytmJobs($, company, config) { return this.genericJobParser($, 'Paytm', 'https://paytm.com', config, 'fintech'); }
  parsePhonePeJobs($, company, config) { return this.genericJobParser($, 'PhonePe', 'https://phonepe.com', config, 'fintech'); }
  parseZerodhaJobs($, company, config) { return this.genericJobParser($, 'Zerodha', 'https://zerodha.com', config, 'fintech'); }
  parseCredJobs($, company, config) { return this.genericJobParser($, 'CRED', 'https://careers.cred.club', config, 'fintech'); }
  
  // Tech Giants
  parseGoogleJobs($, company, config) { return this.genericJobParser($, 'Google', 'https://careers.google.com', config, 'tech'); }
  parseMicrosoftJobs($, company, config) { return this.genericJobParser($, 'Microsoft', 'https://careers.microsoft.com', config, 'tech'); }
  parseAmazonJobs($, company, config) { return this.genericJobParser($, 'Amazon', 'https://amazon.jobs', config, 'tech'); }
  parseMetaJobs($, company, config) { return this.genericJobParser($, 'Meta', 'https://metacareers.com', config, 'tech'); }
  parseAppleJobs($, company, config) { return this.genericJobParser($, 'Apple', 'https://jobs.apple.com', config, 'tech'); }
  
  // Hackathon Platforms
  parseDevpostHackathons($, company, config) { return this.genericHackathonParser($, 'Devpost', 'https://devpost.com', config); }
  parseHackerEarthEvents($, company, config) { return this.genericHackathonParser($, 'HackerEarth', 'https://hackerearth.com', config); }
  parseUnstopCompetitions($, company, config) { return this.genericHackathonParser($, 'Unstop', 'https://unstop.com', config); }
  parseMLHEvents($, company, config) { return this.genericHackathonParser($, 'Major League Hacking', 'https://mlh.io', config); }
  parseCodeChefContests($, company, config) { return this.genericHackathonParser($, 'CodeChef', 'https://codechef.com', config); }
  parseCodeforcesContests($, company, config) { return this.genericHackathonParser($, 'Codeforces', 'https://codeforces.com', config); }
  
  // College Events
  parseIITBombayEvents($, company, config) { return this.genericEventParser($, 'IIT Bombay', 'https://iitb.ac.in', config); }
  parseIITDelhiEvents($, company, config) { return this.genericEventParser($, 'IIT Delhi', 'https://iitd.ac.in', config); }
  parseIITMadrasEvents($, company, config) { return this.genericEventParser($, 'IIT Madras', 'https://iitm.ac.in', config); }
  parseNITEvents($, company, config) { return this.genericEventParser($, 'NIT Kurukshetra', 'https://nitkkr.ac.in', config); }
  parseDUEvents($, company, config) { return this.genericEventParser($, 'Delhi University', 'https://du.ac.in', config); }
  
  // Internship Platforms  
  parseInternshalaInternships($, company, config) { return this.genericInternshipParser($, 'Internshala', 'https://internshala.com', config); }
  parseLetsInternInternships($, company, config) { return this.genericInternshipParser($, 'LetsIntern', 'https://letsintern.com', config); }
  parseTwentyOneTwelveInternships($, company, config) { return this.genericInternshipParser($, 'TwentyOne12', 'https://21twelve.com', config); }
  parseCheggInternships($, company, config) { return this.genericInternshipParser($, 'Chegg', 'https://chegg.com', config); }
  
  // Job Portals
  parseLinkedInJobs($, company, config) { return this.genericJobParser($, 'LinkedIn', 'https://linkedin.com', config, 'job'); }
  parseNaukriJobs($, company, config) { return this.genericJobParser($, 'Naukri.com', 'https://naukri.com', config, 'job'); }
  parseIndeedJobs($, company, config) { return this.genericJobParser($, 'Indeed', 'https://indeed.com', config, 'job'); }
  parseGlassdoorJobs($, company, config) { return this.genericJobParser($, 'Glassdoor', 'https://glassdoor.co.in', config, 'job'); }
  parseShineJobs($, company, config) { return this.genericJobParser($, 'Shine.com', 'https://shine.com', config, 'job'); }

  // Enhanced generic parser with better data extraction
  genericJobParser($, companyName, baseUrl, config, categoryOverride = null) {
    const opportunities = [];
    
    config.selectors.forEach(selector => {
      $(selector).each((i, element) => {
        if (opportunities.length >= config.maxResults) return false;
        
        const $el = $(element);
        const text = $el.text().toLowerCase();
        
        // Enhanced filtering for job-like content
        const jobIndicators = ['experience', 'apply', 'position', 'role', 'salary', 'job', 'career', 'opening'];
        if (!jobIndicators.some(indicator => text.includes(indicator))) {
          return true; // Continue to next element
        }
        
        const titleSelectors = [
          'h1', 'h2', 'h3', 'h4', 'h5',
          '.title', '.job-title', '.position-title', '.role-title',
          '.card-title', '.listing-title', '[data-cy*="title"]'
        ];
        
        let title = '';
        for (const titleSelector of titleSelectors) {
          const titleText = this.cleanText($el.find(titleSelector).first().text());
          if (titleText.length > 5 && titleText.length < 150) {
            title = titleText;
            break;
          }
        }
        
        // Fallback: try to extract title from link text or strong elements
        if (!title) {
          const linkText = this.cleanText($el.find('a').first().text());
          const strongText = this.cleanText($el.find('strong').first().text());
          title = linkText.length > strongText.length ? linkText : strongText;
        }
        
        if (title && title.length > 3) {
          const opportunity = {
            title,
            company: companyName,
            location: this.extractLocation($el.text()),
            type: categoryOverride === 'fintech' ? 'job' : this.determineType($el.text()),
            category: categoryOverride || this.determineCategory($el.text()),
            description: this.cleanText($el.text().substring(0, 500)),
            requirements: this.extractRequirements($el.text()),
            skills: this.extractSkills($el.text()),
            salary: this.extractSalary($el.text()),
            experience: this.extractExperience($el.text()),
            applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), baseUrl),
            sourceUrl: baseUrl,
            remote: text.includes('remote'),
            benefits: this.extractBenefits($el.text()),
            urgent: this.isUrgent($el.text())
          };
          
          opportunities.push(opportunity);
        }
      });
    });

    return opportunities.slice(0, config.maxResults);
  }

  // Generic hackathon parser for competition platforms
  genericHackathonParser($, companyName, baseUrl, config) {
    const opportunities = [];
    
    config.selectors.forEach(selector => {
      $(selector).each((i, element) => {
        if (opportunities.length >= config.maxResults) return false;
        
        const $el = $(element);
        const text = $el.text().toLowerCase();
        
        // Enhanced filtering for hackathon/competition content
        const hackathonIndicators = ['hackathon', 'competition', 'contest', 'challenge', 'event', 'coding', 'programming', 'innovation', 'startup', 'tech'];
        if (!hackathonIndicators.some(indicator => text.includes(indicator))) {
          return true; // Continue to next element
        }
        
        const titleSelectors = [
          'h1', 'h2', 'h3', 'h4', 'h5',
          '.title', '.challenge-title', '.hackathon-title', '.contest-name',
          '.card-title', '.event-title', '[data-cy*="title"]'
        ];
        
        let title = '';
        for (const titleSelector of titleSelectors) {
          const titleText = this.cleanText($el.find(titleSelector).first().text());
          if (titleText.length > 5 && titleText.length < 200) {
            title = titleText;
            break;
          }
        }
        
        // Fallback: try to extract title from link text or strong elements
        if (!title) {
          const linkText = this.cleanText($el.find('a').first().text());
          const strongText = this.cleanText($el.find('strong').first().text());
          title = linkText.length > strongText.length ? linkText : strongText;
        }
        
        if (title && title.length > 5) {
          const opportunity = {
            title,
            company: companyName,
            location: this.extractLocation($el.text()) || 'Global/Online',
            type: 'hackathon',
            category: this.determineHackathonCategory($el.text()),
            description: this.cleanText($el.text().substring(0, 500)),
            requirements: this.extractRequirements($el.text()),
            skills: this.extractSkills($el.text()),
            salary: this.extractPrize($el.text()) || 'Prizes Available',
            experience: 'All Levels',
            applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), baseUrl),
            sourceUrl: baseUrl,
            remote: true,
            benefits: this.extractHackathonBenefits($el.text()),
            urgent: this.isUrgent($el.text()),
            deadline: this.extractDeadline($el.text())
          };
          
          opportunities.push(opportunity);
        }
      });
    });

    return opportunities.slice(0, config.maxResults);
  }

  // Generic event parser for college/university events
  genericEventParser($, companyName, baseUrl, config) {
    const opportunities = [];
    
    config.selectors.forEach(selector => {
      $(selector).each((i, element) => {
        if (opportunities.length >= config.maxResults) return false;
        
        const $el = $(element);
        const text = $el.text().toLowerCase();
        
        // Enhanced filtering for event content
        const eventIndicators = ['event', 'workshop', 'seminar', 'conference', 'symposium', 'lecture', 'competition', 'fest', 'cultural', 'technical'];
        if (!eventIndicators.some(indicator => text.includes(indicator))) {
          return true; // Continue to next element
        }
        
        const titleSelectors = [
          'h1', 'h2', 'h3', 'h4', 'h5',
          '.title', '.event-title', '.workshop-title', '.seminar-title',
          '.card-title', '.news-title', '[data-cy*="title"]'
        ];
        
        let title = '';
        for (const titleSelector of titleSelectors) {
          const titleText = this.cleanText($el.find(titleSelector).first().text());
          if (titleText.length > 5 && titleText.length < 200) {
            title = titleText;
            break;
          }
        }
        
        if (!title) {
          const linkText = this.cleanText($el.find('a').first().text());
          const strongText = this.cleanText($el.find('strong').first().text());
          title = linkText.length > strongText.length ? linkText : strongText;
        }
        
        if (title && title.length > 5) {
          const opportunity = {
            title,
            company: companyName,
            location: this.extractLocation($el.text()) || 'Campus',
            type: 'event',
            category: this.determineEventCategory($el.text()),
            description: this.cleanText($el.text().substring(0, 500)),
            requirements: this.extractRequirements($el.text()),
            skills: this.extractSkills($el.text()),
            salary: 'Free/Paid',
            experience: 'Students/Faculty',
            applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), baseUrl),
            sourceUrl: baseUrl,
            remote: text.includes('online') || text.includes('virtual'),
            benefits: this.extractEventBenefits($el.text()),
            urgent: this.isUrgent($el.text()),
            deadline: this.extractDeadline($el.text())
          };
          
          opportunities.push(opportunity);
        }
      });
    });

    return opportunities.slice(0, config.maxResults);
  }

  // Generic internship parser enhanced for multiple platforms
  genericInternshipParser($, companyName, baseUrl, config) {
    const opportunities = [];
    
    config.selectors.forEach(selector => {
      $(selector).each((i, element) => {
        if (opportunities.length >= config.maxResults) return false;
        
        const $el = $(element);
        const text = $el.text().toLowerCase();
        
        // Enhanced filtering for internship content
        const internshipIndicators = ['intern', 'trainee', 'apprentice', 'student', 'graduate', 'fresher', 'entry level'];
        if (!internshipIndicators.some(indicator => text.includes(indicator))) {
          return true;
        }
        
        const titleSelectors = [
          'h1', 'h2', 'h3', 'h4', 'h5',
          '.title', '.internship-title', '.job-title', '.position-title',
          '.card-title', '.listing-title', '[data-cy*="title"]'
        ];
        
        let title = '';
        for (const titleSelector of titleSelectors) {
          const titleText = this.cleanText($el.find(titleSelector).first().text());
          if (titleText.length > 5 && titleText.length < 200) {
            title = titleText;
            break;
          }
        }
        
        if (!title) {
          const linkText = this.cleanText($el.find('a').first().text());
          const strongText = this.cleanText($el.find('strong').first().text());
          title = linkText.length > strongText.length ? linkText : strongText;
        }
        
        if (title && title.length > 5) {
          const opportunity = {
            title,
            company: companyName === 'Internshala' ? this.extractCompany($el.text()) : companyName,
            location: this.extractLocation($el.text()) || 'India',
            type: 'internship',
            category: this.determineCategory($el.text()),
            description: this.cleanText($el.text().substring(0, 500)),
            requirements: this.extractRequirements($el.text()),
            skills: this.extractSkills($el.text()),
            salary: this.extractSalary($el.text()) || 'Stipend Available',
            experience: 'Fresher/Student',
            applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), baseUrl),
            sourceUrl: baseUrl,
            remote: text.includes('remote') || text.includes('work from home'),
            benefits: this.extractBenefits($el.text()),
            urgent: this.isUrgent($el.text()),
            deadline: this.extractDeadline($el.text())
          };
          
          opportunities.push(opportunity);
        }
      });
    });

    return opportunities.slice(0, config.maxResults);
  }

  // Enhanced utility functions with better extraction
  extractSalary(text) {
    const salaryPatterns = [
      /₹\s*[\d,]+\s*(?:[-–]\s*₹\s*[\d,]+)?\s*(?:lpa|per annum|lakhs?)/i,
      /\$\s*[\d,]+\s*(?:[-–]\s*\$\s*[\d,]+)?/i,
      /salary\s*:?\s*₹\s*[\d,]+/i,
      /[\d,]+\s*lpa/i
    ];
    
    for (const pattern of salaryPatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    return '';
  }

  extractBenefits(text) {
    const benefitKeywords = [
      'health insurance', 'medical', 'dental', 'vision',
      'stock options', 'equity', 'esop',
      'flexible', 'work from home', 'remote',
      'learning budget', 'training', 'certification',
      'free meals', 'food', 'cafeteria',
      'gym', 'fitness', 'wellness',
      'vacation', 'pto', 'leave'
    ];
    
    return benefitKeywords.filter(benefit => 
      text.toLowerCase().includes(benefit)
    ).slice(0, 5);
  }

  isUrgent(text) {
    const urgentKeywords = ['urgent', 'immediate', 'asap', 'closing soon', 'last date'];
    return urgentKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  // Clean old opportunities more aggressively
  async cleanOldOpportunities() {
    try {
      const cutoffDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days
      
      const result = await Opportunity.deleteMany({
        $or: [
          { lastUpdated: { $lt: cutoffDate } },
          { deadline: { $lt: new Date() } }, // Remove expired opportunities
          { isActive: false }
        ]
      });
      
      this.log(`🗑️ Cleaned ${result.deletedCount} old/expired opportunities`);
      
      // Also clean old scraper status entries
      await ScraperStatus.deleteMany({
        lastRun: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days
      });
      
    } catch (error) {
      this.log(`❌ Failed to clean old opportunities: ${error.message}`, 'error');
    }
  }

  // Log detailed results summary
  logResultsSummary(results, totalTime) {
    this.log('📊 Scraping Results Summary:');
    this.log('=' .repeat(50));
    
    Object.entries(results).forEach(([company, count]) => {
      this.log(`  ${company.padEnd(20)} : ${count.toString().padStart(3)} opportunities`);
    });
    
    this.log('=' .repeat(50));
    const totalOpportunities = Object.values(results).reduce((sum, count) => sum + count, 0);
    this.log(`  TOTAL                : ${totalOpportunities.toString().padStart(3)} opportunities`);
    this.log(`  TIME TAKEN           : ${(totalTime / 1000).toFixed(2)}s`);
    this.log(`  AVERAGE PER SOURCE   : ${(totalOpportunities / Object.keys(results).length).toFixed(1)} opportunities`);
  }

  // Start the standalone service
  async startService() {
    this.log('🚀 Starting Standalone Opportunity Scraper Service');
    this.log('================================================');
    
    // Initial scraping run
    await this.scrapeAllOpportunities();
    
    // Schedule regular scraping - every 2 hours for more frequent updates
    cron.schedule('0 */2 * * *', () => {
      this.log('⏰ Scheduled scraping started (every 2 hours)...');
      this.scrapeAllOpportunities();
    });

    // Clean old opportunities twice daily
    cron.schedule('0 6,18 * * *', () => {
      this.log('🧹 Cleaning old opportunities...');
      this.cleanOldOpportunities();
    });

    // Status report every hour
    cron.schedule('0 * * * *', async () => {
      await this.logServiceStatus();
    });

    this.log('✅ Scraper service started successfully!');
    this.log('📅 Scraping schedule: Every 2 hours');
    this.log('🧹 Cleanup schedule: Twice daily (6 AM & 6 PM)');
    this.log('📊 Status reports: Every hour');
    
    // Keep the service running
    process.on('SIGINT', () => {
      this.log('🛑 Received SIGINT, shutting down gracefully...');
      this.closeBrowser();
      process.exit(0);
    });
  }

  // Log service status
  async logServiceStatus() {
    try {
      const totalOpportunities = await Opportunity.countDocuments({ isActive: true });
      const recentOpportunities = await Opportunity.countDocuments({
        isActive: true,
        scrapedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      this.log(`📊 Service Status: ${totalOpportunities} total opportunities, ${recentOpportunities} added in last 24h`);
    } catch (error) {
      this.log(`❌ Failed to get service status: ${error.message}`, 'error');
    }
  }

  // Other utility functions remain the same...
  cleanText(text) {
    return text ? text.trim().replace(/\s+/g, ' ').replace(/\n/g, ' ').substring(0, 1000) : '';
  }

  extractLocation(text) {
    const locationKeywords = [
      'Mumbai', 'Delhi', 'NCR', 'Bangalore', 'Bengaluru', 'Hyderabad', 
      'Chennai', 'Pune', 'Kolkata', 'Gurugram', 'Gurgaon', 'Noida',
      'Remote', 'Work from Home', 'WFH', 'India', 'Anywhere'
    ];
    
    for (const location of locationKeywords) {
      if (text.toLowerCase().includes(location.toLowerCase())) {
        return location;
      }
    }
    return 'India';
  }

  determineType(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('intern')) return 'internship';
    if (lowerText.includes('hackathon') || lowerText.includes('competition')) return 'hackathon';
    if (lowerText.includes('event') || lowerText.includes('workshop')) return 'event';
    return 'job';
  }

  determineCategory(text) {
    const lowerText = text.toLowerCase();
    const categories = {
      'software': ['developer', 'engineer', 'programming', 'coding', 'software', 'frontend', 'backend', 'fullstack'],
      'data-science': ['data', 'analytics', 'machine learning', 'ai', 'ml', 'scientist', 'analyst'],
      'product': ['product manager', 'pm', 'product', 'strategy'],
      'design': ['designer', 'ui', 'ux', 'design', 'creative'],
      'marketing': ['marketing', 'growth', 'digital marketing', 'content'],
      'finance': ['finance', 'fintech', 'financial', 'accounting'],
      'blockchain': ['blockchain', 'crypto', 'web3', 'defi']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  }

  extractSkills(text) {
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
      'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker',
      'Git', 'Machine Learning', 'Data Science', 'UI/UX', 'Figma', 'Sketch',
      'TypeScript', 'Go', 'Rust', 'Kotlin', 'Swift', 'Flutter', 'Django',
      'Flask', 'Spring', 'Express', 'GraphQL', 'REST', 'API', 'Microservices'
    ];
    
    return skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    ).slice(0, 8);
  }

  extractRequirements(text) {
    const sentences = text.split(/[.\n!]/).filter(sentence => {
      const lower = sentence.toLowerCase();
      return (
        lower.includes('experience') || 
        lower.includes('required') ||
        lower.includes('must have') ||
        lower.includes('qualification') ||
        lower.includes('degree') ||
        lower.includes('skill')
      );
    });
    
    return sentences.slice(0, 5).map(sentence => this.cleanText(sentence));
  }

  extractExperience(text) {
    const expPatterns = [
      /(\d+)[+-]?\s*(?:to\s+\d+\s*)?years?\s*(?:of\s*)?experience/i,
      /experience\s*:?\s*(\d+)[+-]?\s*years?/i,
      /(\d+)[+-]?\s*yrs?\s*exp/i
    ];
    
    for (const pattern of expPatterns) {
      const match = text.match(pattern);
      if (match) return `${match[1]}+ years`;
    }
    
    if (text.toLowerCase().includes('fresher') || text.toLowerCase().includes('0 years')) {
      return 'Fresher';
    }
    
    return 'Not specified';
  }

  // Enhanced helper functions for new categories

  determineHackathonCategory(text) {
    const lowerText = text.toLowerCase();
    const categories = {
      'ai-ml': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural network'],
      'blockchain': ['blockchain', 'crypto', 'web3', 'defi', 'nft', 'smart contract'],
      'fintech': ['fintech', 'finance', 'banking', 'payment', 'trading'],
      'healthcare': ['health', 'medical', 'healthcare', 'biotech', 'pharma'],
      'iot': ['iot', 'internet of things', 'sensors', 'embedded'],
      'gaming': ['game', 'gaming', 'vr', 'ar', 'virtual reality'],
      'social-impact': ['social', 'education', 'environment', 'sustainability', 'ngo'],
      'general': ['programming', 'coding', 'software', 'app', 'web']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  }

  determineEventCategory(text) {
    const lowerText = text.toLowerCase();
    const categories = {
      'workshop': ['workshop', 'hands-on', 'training', 'bootcamp'],
      'conference': ['conference', 'summit', 'symposium', 'convention'],
      'seminar': ['seminar', 'lecture', 'talk', 'presentation'],
      'cultural': ['cultural', 'fest', 'celebration', 'performance', 'art'],
      'technical': ['technical', 'tech', 'coding', 'programming', 'hackathon'],
      'career': ['career', 'placement', 'job', 'internship', 'recruitment'],
      'research': ['research', 'paper', 'publication', 'journal', 'study']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  }

  extractPrize(text) {
    const prizePatterns = [
      /prize\s*:?\s*₹\s*[\d,]+/i,
      /₹\s*[\d,]+\s*(?:prize|reward|cash)/i,
      /\$\s*[\d,]+\s*(?:prize|reward)/i,
      /prize\s*pool\s*:?\s*₹\s*[\d,]+/i,
      /cash\s*prize\s*:?\s*₹\s*[\d,]+/i
    ];
    
    for (const pattern of prizePatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    return null;
  }

  extractHackathonBenefits(text) {
    const benefitKeywords = [
      'cash prize', 'prizes', 'certificates', 'trophy', 'medals',
      'internship', 'job opportunity', 'mentorship', 'networking',
      'swag', 'goodies', 'workshop', 'training', 'recognition'
    ];
    
    return benefitKeywords.filter(benefit => 
      text.toLowerCase().includes(benefit)
    ).slice(0, 5);
  }

  extractEventBenefits(text) {
    const benefitKeywords = [
      'certificate', 'cme points', 'networking', 'learning',
      'free food', 'accommodation', 'transport', 'materials',
      'industry exposure', 'expert sessions', 'hands-on experience'
    ];
    
    return benefitKeywords.filter(benefit => 
      text.toLowerCase().includes(benefit)
    ).slice(0, 5);
  }

  extractDeadline(text) {
    const deadlinePatterns = [
      /deadline\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /last\s*date\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /submit\s*by\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{2,4})/i
    ];
    
    for (const pattern of deadlinePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return new Date(match[1]);
        } catch (e) {
          continue;
        }
      }
    }
    
    // Default to 30 days from now
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  extractCompany(text) {
    // Extract company name from internship listings
    const companyPatterns = [
      /at\s+([A-Za-z0-9\s&.,]+?)(?:\s+in|\s+for|\s*$)/i,
      /company\s*:?\s*([A-Za-z0-9\s&.,]+)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 2) {
        return match[1].trim();
      }
    }
    return 'Various Companies';
  }

  getAbsoluteUrl(href, baseUrl) {
    if (!href) return baseUrl;
    if (href.startsWith('http')) return href;
    if (href.startsWith('/')) return baseUrl + href;
    return `${baseUrl}/${href}`;
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
}

// Start the standalone service
const scraper = new StandaloneOpportunityScraper();
scraper.startService().catch(error => {
  console.error('Failed to start scraper service:', error);
  process.exit(1);
});

module.exports = StandaloneOpportunityScraper;
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');

// Opportunity Schema for Database
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
  lastUpdated: { type: Date, default: Date.now }
});

const Opportunity = mongoose.model('Opportunity', OpportunitySchema);

class OpportunityScraper {
  constructor() {
    this.browser = null;
    this.scrapers = this.initializeScrapers();
  }

  // Initialize all company-specific scrapers
  initializeScrapers() {
    return {
      // FinTech Companies
      razorpay: {
        url: 'https://razorpay.com/jobs/',
        selector: '.job-listing',
        parser: this.parseRazorpayJobs.bind(this)
      },
      paytm: {
        url: 'https://paytm.com/careers',
        selector: '.career-opening',
        parser: this.parsePaytmJobs.bind(this)
      },
      phonepe: {
        url: 'https://www.phonepe.com/careers/',
        selector: '.job-card',
        parser: this.parsePhonePeJobs.bind(this)
      },
      zerodha: {
        url: 'https://zerodha.com/careers/',
        selector: '.position',
        parser: this.parseZerodhaJobs.bind(this)
      },
      policybazaar: {
        url: 'https://www.policybazaar.com/careers/',
        selector: '.job-opening',
        parser: this.parsePolicybazaarJobs.bind(this)
      },
      
      // Tech Companies
      google: {
        url: 'https://careers.google.com/jobs/results/',
        selector: '.gc-card',
        parser: this.parseGoogleJobs.bind(this)
      },
      microsoft: {
        url: 'https://careers.microsoft.com/professionals/us/en/search-results',
        selector: '.job-item',
        parser: this.parseMicrosoftJobs.bind(this)
      },
      amazon: {
        url: 'https://www.amazon.jobs/en/search',
        selector: '.job-tile',
        parser: this.parseAmazonJobs.bind(this)
      },
      
      // Hackathon Platforms
      devpost: {
        url: 'https://devpost.com/hackathons',
        selector: '.challenge-listing',
        parser: this.parseDevpostHackathons.bind(this)
      },
      hackerearth: {
        url: 'https://www.hackerearth.com/challenges/',
        selector: '.challenge-card',
        parser: this.parseHackerEarthEvents.bind(this)
      },
      unstop: {
        url: 'https://unstop.com/competitions',
        selector: '.competition-card',
        parser: this.parseUnstopCompetitions.bind(this)
      },
      
      // Internship Platforms
      internshala: {
        url: 'https://internshala.com/internships/',
        selector: '.internship_meta',
        parser: this.parseInternshalaInternships.bind(this)
      },
      letsintern: {
        url: 'https://www.letsintern.com/internships',
        selector: '.internship-card',
        parser: this.parseLetsInternInternships.bind(this)
      }
    };
  }

  // Initialize browser
  async initBrowser() {
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
      ]
    });
  }

  // Close browser
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Main scraping function
  async scrapeAllOpportunities() {
    console.log('🚀 Starting opportunity scraping...');
    
    try {
      await this.initBrowser();
      const allOpportunities = [];

      for (const [company, config] of Object.entries(this.scrapers)) {
        console.log(`📊 Scraping ${company}...`);
        
        try {
          const opportunities = await this.scrapeCompany(company, config);
          allOpportunities.push(...opportunities);
          console.log(`✅ Found ${opportunities.length} opportunities from ${company}`);
          
          // Add delay between requests to be respectful
          await this.delay(2000);
        } catch (error) {
          console.error(`❌ Error scraping ${company}:`, error.message);
        }
      }

      // Save to database
      await this.saveOpportunities(allOpportunities);
      console.log(`🎉 Successfully scraped ${allOpportunities.length} total opportunities!`);

    } catch (error) {
      console.error('💥 Scraping failed:', error);
    } finally {
      await this.closeBrowser();
    }
  }

  // Scrape individual company
  async scrapeCompany(companyName, config) {
    const page = await this.browser.newPage();
    
    try {
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // Navigate to company careers page
      await page.goto(config.url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for content to load
      await page.waitForTimeout(3000);

      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Parse opportunities using company-specific parser
      const opportunities = config.parser($, companyName);
      
      return opportunities;
    } catch (error) {
      console.error(`Error scraping ${companyName}:`, error.message);
      return [];
    } finally {
      await page.close();
    }
  }

  // Company-specific parsers
  parseRazorpayJobs($, company) {
    const opportunities = [];
    
    $('.job-listing, .career-card, .position').each((i, element) => {
      const $el = $(element);
      
      const opportunity = {
        title: this.cleanText($el.find('.job-title, .title, h3, h4').first().text()),
        company: 'Razorpay',
        location: this.extractLocation($el.find('.location, .job-location').text()),
        type: this.determineType($el.text()),
        category: this.determineCategory($el.text()),
        description: this.cleanText($el.find('.description, .job-desc').text()),
        requirements: this.extractRequirements($el.text()),
        skills: this.extractSkills($el.text()),
        experience: this.extractExperience($el.text()),
        applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), 'https://razorpay.com'),
        sourceUrl: 'https://razorpay.com/jobs/',
        remote: $el.text().toLowerCase().includes('remote')
      };

      if (opportunity.title && opportunity.applicationLink) {
        opportunities.push(opportunity);
      }
    });

    return opportunities;
  }

  parsePaytmJobs($, company) {
    const opportunities = [];
    
    $('.career-opening, .job-card, .position-card').each((i, element) => {
      const $el = $(element);
      
      const opportunity = {
        title: this.cleanText($el.find('.position-title, .job-title, h3').first().text()),
        company: 'Paytm',
        location: this.extractLocation($el.find('.location').text()),
        type: 'job',
        category: this.determineCategory($el.text()),
        description: this.cleanText($el.find('.description').text()),
        applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), 'https://paytm.com'),
        sourceUrl: 'https://paytm.com/careers'
      };

      if (opportunity.title && opportunity.applicationLink) {
        opportunities.push(opportunity);
      }
    });

    return opportunities;
  }

  parseDevpostHackathons($, company) {
    const opportunities = [];
    
    $('.challenge-listing, .hackathon-tile').each((i, element) => {
      const $el = $(element);
      
      const opportunity = {
        title: this.cleanText($el.find('.challenge-title, h3').text()),
        company: this.cleanText($el.find('.sponsor, .organizer').text()) || 'Various',
        type: 'hackathon',
        category: 'hackathon',
        description: this.cleanText($el.find('.challenge-description').text()),
        deadline: this.parseDate($el.find('.deadline, .submission-deadline').text()),
        applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), 'https://devpost.com'),
        sourceUrl: 'https://devpost.com/hackathons',
        salary: this.extractPrize($el.text())
      };

      if (opportunity.title && opportunity.applicationLink) {
        opportunities.push(opportunity);
      }
    });

    return opportunities;
  }

  parseInternshalaInternships($, company) {
    const opportunities = [];
    
    $('.internship_meta, .individual_internship').each((i, element) => {
      const $el = $(element);
      
      const opportunity = {
        title: this.cleanText($el.find('.job-internship-name, .profile').text()),
        company: this.cleanText($el.find('.company-name').text()),
        location: this.extractLocation($el.find('.location').text()),
        type: 'internship',
        category: this.determineCategory($el.text()),
        salary: this.cleanText($el.find('.stipend').text()),
        duration: this.cleanText($el.find('.duration').text()),
        applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), 'https://internshala.com'),
        sourceUrl: 'https://internshala.com/internships/'
      };

      if (opportunity.title && opportunity.applicationLink) {
        opportunities.push(opportunity);
      }
    });

    return opportunities;
  }

  // Generic parsers for other companies
  parseGoogleJobs($, company) { return this.genericJobParser($, 'Google', 'https://careers.google.com'); }
  parseMicrosoftJobs($, company) { return this.genericJobParser($, 'Microsoft', 'https://careers.microsoft.com'); }
  parseAmazonJobs($, company) { return this.genericJobParser($, 'Amazon', 'https://amazon.jobs'); }
  parsePhonePeJobs($, company) { return this.genericJobParser($, 'PhonePe', 'https://phonepe.com'); }
  parseZerodhaJobs($, company) { return this.genericJobParser($, 'Zerodha', 'https://zerodha.com'); }
  parsePolicybazaarJobs($, company) { return this.genericJobParser($, 'Policybazaar', 'https://policybazaar.com'); }
  parseHackerEarthEvents($, company) { return this.genericEventParser($, 'HackerEarth', 'https://hackerearth.com'); }
  parseUnstopCompetitions($, company) { return this.genericEventParser($, 'Unstop', 'https://unstop.com'); }
  parseLetsInternInternships($, company) { return this.genericInternshipParser($, 'LetsIntern', 'https://letsintern.com'); }

  // Generic parser for job listings
  genericJobParser($, companyName, baseUrl) {
    const opportunities = [];
    
    $('div, article, li').each((i, element) => {
      const $el = $(element);
      const text = $el.text().toLowerCase();
      
      // Skip if doesn't look like a job posting
      if (!text.includes('experience') && !text.includes('apply') && !text.includes('position')) {
        return;
      }
      
      const titleSelectors = ['h1', 'h2', 'h3', 'h4', '.title', '.job-title', '.position-title'];
      let title = '';
      
      for (const selector of titleSelectors) {
        const titleText = this.cleanText($el.find(selector).first().text());
        if (titleText.length > 5 && titleText.length < 100) {
          title = titleText;
          break;
        }
      }
      
      if (title) {
        const opportunity = {
          title,
          company: companyName,
          location: this.extractLocation($el.text()),
          type: this.determineType($el.text()),
          category: this.determineCategory($el.text()),
          description: this.cleanText($el.text().substring(0, 500)),
          applicationLink: this.getAbsoluteUrl($el.find('a').attr('href'), baseUrl),
          sourceUrl: baseUrl
        };
        
        opportunities.push(opportunity);
      }
    });

    return opportunities.slice(0, 20); // Limit to prevent spam
  }

  // Generic parser for events/hackathons
  genericEventParser($, organizerName, baseUrl) {
    const opportunities = [];
    // Similar implementation for events
    return opportunities;
  }

  // Generic parser for internships
  genericInternshipParser($, companyName, baseUrl) {
    const opportunities = [];
    // Similar implementation for internships
    return opportunities;
  }

  // Utility functions
  cleanText(text) {
    return text ? text.trim().replace(/\s+/g, ' ').replace(/\n/g, ' ') : '';
  }

  extractLocation(text) {
    const locationKeywords = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Remote', 'India'];
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
      'software': ['developer', 'engineer', 'programming', 'coding', 'software'],
      'data-science': ['data', 'analytics', 'machine learning', 'ai', 'ml'],
      'product': ['product manager', 'pm', 'product'],
      'design': ['designer', 'ui', 'ux', 'design'],
      'marketing': ['marketing', 'growth', 'digital marketing'],
      'finance': ['finance', 'fintech', 'financial'],
      'blockchain': ['blockchain', 'crypto', 'web3']
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
      'Git', 'Machine Learning', 'Data Science', 'UI/UX', 'Figma'
    ];
    
    return skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
  }

  extractRequirements(text) {
    const requirements = [];
    const lines = text.split(/[.\n]/).filter(line => 
      line.toLowerCase().includes('experience') || 
      line.toLowerCase().includes('required') ||
      line.toLowerCase().includes('must have')
    );
    
    return lines.slice(0, 5).map(line => this.cleanText(line));
  }

  extractExperience(text) {
    const expMatch = text.match(/(\d+)[+-]?\s*years?\s*(?:of\s*)?experience/i);
    return expMatch ? `${expMatch[1]} years` : 'Not specified';
  }

  extractPrize(text) {
    const prizeMatch = text.match(/₹[\d,]+|prize.*₹[\d,]+|\$[\d,]+/i);
    return prizeMatch ? prizeMatch[0] : '';
  }

  parseDate(dateText) {
    try {
      const date = new Date(dateText);
      return date.getTime() ? date : null;
    } catch {
      return null;
    }
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

  // Save opportunities to database
  async saveOpportunities(opportunities) {
    let saved = 0;
    let updated = 0;
    
    for (const oppData of opportunities) {
      try {
        // Check if opportunity already exists
        const existing = await Opportunity.findOne({
          title: oppData.title,
          company: oppData.company
        });

        if (existing) {
          // Update existing opportunity
          await Opportunity.findByIdAndUpdate(existing._id, {
            ...oppData,
            lastUpdated: new Date()
          });
          updated++;
        } else {
          // Create new opportunity
          const opportunity = new Opportunity(oppData);
          await opportunity.save();
          saved++;
        }
      } catch (error) {
        console.error('Error saving opportunity:', error.message);
      }
    }

    console.log(`💾 Database updated: ${saved} new, ${updated} updated opportunities`);
  }

  // Clean old opportunities
  async cleanOldOpportunities() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Opportunity.deleteMany({
      lastUpdated: { $lt: thirtyDaysAgo }
    });
    console.log(`🗑️ Cleaned ${result.deletedCount} old opportunities`);
  }
}

// Initialize and schedule scraper
const scraper = new OpportunityScraper();

// Run scraper immediately on startup
scraper.scrapeAllOpportunities();

// Schedule scraper to run every 6 hours
cron.schedule('0 */6 * * *', () => {
  console.log('⏰ Scheduled scraping started...');
  scraper.scrapeAllOpportunities();
});

// Clean old opportunities daily at midnight
cron.schedule('0 0 * * *', () => {
  console.log('🧹 Cleaning old opportunities...');
  scraper.cleanOldOpportunities();
});

module.exports = { OpportunityScraper, Opportunity };
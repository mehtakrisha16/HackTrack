const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');

// Enhanced Opportunity Schema with Domains
const OpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  company: { type: String, required: true, index: true },
  location: { 
    type: mongoose.Schema.Types.Mixed, // Can be string or object {city, venue, mode}
    default: 'Remote' 
  },
  type: { 
    type: String, 
    enum: ['internship', 'job', 'hackathon', 'event', 'workshop'], 
    required: true,
    index: true 
  },
  
  // Domain Classification
  domain: { 
    type: String, 
    enum: [
      'Computer Science', 'Web Development', 'Mobile Development', 'AI/ML',
      'Data Science', 'Cybersecurity', 'Cloud Computing', 'DevOps',
      'Blockchain', 'IoT', 'Game Development', 'AR/VR',
      'Electronics', 'Mechanical', 'Civil', 'Chemical',
      'Electrical', 'Aerospace', 'Biotechnology', 'Environmental',
      'Management', 'Finance', 'Marketing', 'Design',
      'Content Writing', 'General'
    ],
    default: 'General',
    index: true
  },
  
  category: { type: String, default: 'general' },
  description: { type: String, default: '' },
  requirements: [String],
  skills: [String],
  domains: [String], // Multiple domains if applicable
  
  salary: { type: String, default: '' },
  stipend: { type: String, default: '' },
  experience: { type: String, default: 'Any Level' },
  
  deadline: { type: Date, index: true },
  postedDate: { type: Date, default: Date.now, index: true },
  startDate: { type: Date },
  endDate: { type: Date },
  
  applicationLink: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  registrationLink: { type: String },
  
  companyLogo: { type: String, default: '' },
  benefits: [String],
  
  remote: { type: Boolean, default: false, index: true },
  urgent: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, index: true },
  
  // Metadata
  scrapedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  source: { type: String, default: '' },
  rating: { type: Number, default: 4.0 }
});

// Indexes for faster queries
OpportunitySchema.index({ type: 1, domain: 1, isActive: 1 });
OpportunitySchema.index({ deadline: 1, isActive: 1 });
OpportunitySchema.index({ postedDate: -1 });

// Prevent model overwrite error
const Opportunity = mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);

class DomainScraper {
  constructor() {
    this.browser = null;
    this.domains = this.initializeDomains();
  }

  // Initialize all engineering domains with their sources
  initializeDomains() {
    return {
      // Computer Science & Software Engineering
      'Web Development': {
        keywords: ['frontend', 'backend', 'full stack', 'react', 'angular', 'vue', 'nodejs', 'web developer', 'html', 'css', 'javascript'],
        sources: [
          'https://internshala.com/internships/web-development-internship',
          'https://www.linkedin.com/jobs/web-developer-jobs',
          'https://devfolio.co/hackathons'
        ]
      },
      
      'Mobile Development': {
        keywords: ['android', 'ios', 'flutter', 'react native', 'mobile app', 'swift', 'kotlin', 'mobile developer'],
        sources: [
          'https://internshala.com/internships/mobile-app-development-internship',
          'https://www.linkedin.com/jobs/mobile-developer-jobs'
        ]
      },
      
      'AI/ML': {
        keywords: ['artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'ai', 'ml', 'nlp', 'computer vision', 'tensorflow', 'pytorch'],
        sources: [
          'https://internshala.com/internships/artificial-intelligence-ai-internship',
          'https://www.linkedin.com/jobs/machine-learning-jobs',
          'https://mlh.io/events',
          'https://kaggle.com/competitions'
        ]
      },
      
      'Data Science': {
        keywords: ['data science', 'data analyst', 'data engineer', 'big data', 'analytics', 'python', 'r', 'sql', 'tableau', 'power bi'],
        sources: [
          'https://internshala.com/internships/data-science-internship',
          'https://www.linkedin.com/jobs/data-science-jobs'
        ]
      },
      
      'Cybersecurity': {
        keywords: ['cybersecurity', 'security', 'ethical hacking', 'penetration testing', 'infosec', 'security analyst', 'ctf'],
        sources: [
          'https://internshala.com/internships/cyber-security-internship',
          'https://www.linkedin.com/jobs/cybersecurity-jobs',
          'https://ctftime.org/event/list/'
        ]
      },
      
      'Cloud Computing': {
        keywords: ['cloud', 'aws', 'azure', 'gcp', 'cloud engineer', 'cloud architect', 'devops', 'kubernetes', 'docker'],
        sources: [
          'https://internshala.com/internships/cloud-computing-internship',
          'https://www.linkedin.com/jobs/cloud-engineer-jobs'
        ]
      },
      
      'DevOps': {
        keywords: ['devops', 'ci/cd', 'jenkins', 'terraform', 'ansible', 'kubernetes', 'docker', 'linux'],
        sources: [
          'https://www.linkedin.com/jobs/devops-jobs',
          'https://internshala.com/internships/devops-internship'
        ]
      },
      
      'Blockchain': {
        keywords: ['blockchain', 'web3', 'cryptocurrency', 'smart contract', 'ethereum', 'solidity', 'nft'],
        sources: [
          'https://internshala.com/internships/blockchain-internship',
          'https://devfolio.co/hackathons?themes=Web3',
          'https://www.linkedin.com/jobs/blockchain-jobs'
        ]
      },
      
      'IoT': {
        keywords: ['iot', 'internet of things', 'embedded', 'arduino', 'raspberry pi', 'sensors'],
        sources: [
          'https://internshala.com/internships/iot-internship',
          'https://www.linkedin.com/jobs/iot-jobs'
        ]
      },
      
      'Game Development': {
        keywords: ['game development', 'unity', 'unreal', 'game design', 'game developer'],
        sources: [
          'https://internshala.com/internships/game-development-internship',
          'https://itch.io/jams'
        ]
      },
      
      'AR/VR': {
        keywords: ['augmented reality', 'virtual reality', 'ar', 'vr', 'metaverse', 'unity', 'unreal'],
        sources: [
          'https://internshala.com/internships/ar-vr-internship'
        ]
      },
      
      // Core Engineering Branches
      'Electronics': {
        keywords: ['electronics', 'ece', 'vlsi', 'embedded systems', 'circuit design', 'pcb'],
        sources: [
          'https://internshala.com/internships/electronics-internship',
          'https://www.linkedin.com/jobs/electronics-engineer-jobs'
        ]
      },
      
      'Mechanical': {
        keywords: ['mechanical', 'cad', 'solidworks', 'autocad', 'manufacturing', 'automobile'],
        sources: [
          'https://internshala.com/internships/mechanical-engineering-internship',
          'https://www.linkedin.com/jobs/mechanical-engineer-jobs'
        ]
      },
      
      'Civil': {
        keywords: ['civil engineering', 'construction', 'structural', 'architecture', 'surveying'],
        sources: [
          'https://internshala.com/internships/civil-engineering-internship'
        ]
      },
      
      'Electrical': {
        keywords: ['electrical', 'power systems', 'electrical engineering', 'eee'],
        sources: [
          'https://internshala.com/internships/electrical-engineering-internship'
        ]
      },
      
      // Business & Management
      'Management': {
        keywords: ['management', 'mba', 'business', 'operations', 'project management', 'product management'],
        sources: [
          'https://internshala.com/internships/mba-internship',
          'https://www.linkedin.com/jobs/management-trainee-jobs'
        ]
      },
      
      'Finance': {
        keywords: ['finance', 'accounting', 'investment', 'banking', 'financial analyst'],
        sources: [
          'https://internshala.com/internships/finance-internship'
        ]
      },
      
      'Marketing': {
        keywords: ['marketing', 'digital marketing', 'social media', 'seo', 'content marketing'],
        sources: [
          'https://internshala.com/internships/digital-marketing-internship'
        ]
      },
      
      'Design': {
        keywords: ['design', 'ui', 'ux', 'graphic design', 'product design', 'figma'],
        sources: [
          'https://internshala.com/internships/graphic-design-internship',
          'https://www.linkedin.com/jobs/ui-ux-designer-jobs'
        ]
      }
    };
  }

  // Start browser
  async startBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  // Close browser
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Detect domain from title, description, and skills
  detectDomain(title, description = '', skills = []) {
    const text = `${title} ${description} ${skills.join(' ')}`.toLowerCase();
    
    const domainScores = {};
    
    for (const [domain, config] of Object.entries(this.domains)) {
      let score = 0;
      for (const keyword of config.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      if (score > 0) {
        domainScores[domain] = score;
      }
    }
    
    // Return domain with highest score, or 'General' if no match
    if (Object.keys(domainScores).length === 0) {
      return 'General';
    }
    
    return Object.keys(domainScores).reduce((a, b) => 
      domainScores[a] > domainScores[b] ? a : b
    );
  }

  // Scrape Internshala
  async scrapeInternshala(domain, url) {
    console.log(`🔍 Scraping Internshala for ${domain}...`);
    const opportunities = [];
    
    try {
      const browser = await this.startBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      await page.waitForSelector('.internship_meta, .individual_internship', { timeout: 10000 });
      
      const data = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('.internship_meta, .individual_internship').forEach(item => {
          try {
            const titleEl = item.querySelector('.job-internship-name, .profile');
            const companyEl = item.querySelector('.company-name, .company_name');
            const locationEl = item.querySelector('.location_link, .location');
            const stipendEl = item.querySelector('.stipend, .salary');
            const durationEl = item.querySelector('.duration, .internship_other_details_container');
            const linkEl = item.querySelector('a.view_detail_button, .view-details');
            
            if (titleEl && companyEl) {
              items.push({
                title: titleEl.textContent.trim(),
                company: companyEl.textContent.trim(),
                location: locationEl ? locationEl.textContent.trim() : 'Remote',
                stipend: stipendEl ? stipendEl.textContent.trim() : 'Unpaid',
                duration: durationEl ? durationEl.textContent.trim() : '3 months',
                link: linkEl ? linkEl.href : window.location.href
              });
            }
          } catch (e) {
            console.error('Error parsing item:', e);
          }
        });
        return items;
      });
      
      for (const item of data) {
        opportunities.push({
          title: item.title,
          company: item.company,
          location: item.location,
          type: 'internship',
          domain: domain,
          domains: [domain],
          description: `${domain} internship at ${item.company}`,
          salary: item.stipend,
          stipend: item.stipend,
          experience: 'Entry Level',
          applicationLink: item.link,
          sourceUrl: url,
          source: 'Internshala',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          postedDate: new Date(),
          remote: item.location.toLowerCase().includes('remote'),
          isActive: true
        });
      }
      
      await page.close();
      console.log(`✅ Found ${opportunities.length} opportunities from Internshala`);
      
    } catch (error) {
      console.error(`❌ Error scraping Internshala for ${domain}:`, error.message);
    }
    
    return opportunities;
  }

  // Scrape LinkedIn (Limited due to authentication)
  async scrapeLinkedIn(domain, url) {
    console.log(`🔍 Scraping LinkedIn for ${domain}...`);
    const opportunities = [];
    
    try {
      // LinkedIn requires authentication, so we'll use a simpler approach
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      
      // LinkedIn job cards
      $('.base-card').each((i, elem) => {
        try {
          const title = $(elem).find('.base-search-card__title').text().trim();
          const company = $(elem).find('.base-search-card__subtitle').text().trim();
          const location = $(elem).find('.job-search-card__location').text().trim();
          const link = $(elem).find('a').attr('href');
          
          if (title && company) {
            opportunities.push({
              title,
              company,
              location: location || 'Remote',
              type: url.includes('internship') ? 'internship' : 'job',
              domain: domain,
              domains: [domain],
              description: `${domain} opportunity at ${company}`,
              experience: 'Any Level',
              applicationLink: link || url,
              sourceUrl: url,
              source: 'LinkedIn',
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              postedDate: new Date(),
              isActive: true
            });
          }
        } catch (e) {
          console.error('Error parsing LinkedIn item:', e);
        }
      });
      
      console.log(`✅ Found ${opportunities.length} opportunities from LinkedIn`);
      
    } catch (error) {
      console.error(`❌ Error scraping LinkedIn for ${domain}:`, error.message);
    }
    
    return opportunities;
  }

  // Scrape Devfolio for Hackathons
  async scrapeDevfolio(domain) {
    console.log(`🔍 Scraping Devfolio for ${domain} hackathons...`);
    const opportunities = [];
    
    try {
      const browser = await this.startBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto('https://devfolio.co/hackathons', { waitUntil: 'networkidle2', timeout: 30000 });
      
      await page.waitForSelector('.hackathon-card, [class*="HackathonCard"]', { timeout: 10000 });
      
      const data = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('.hackathon-card, [class*="HackathonCard"]').forEach(item => {
          try {
            const titleEl = item.querySelector('h3, h2, [class*="title"]');
            const organizerEl = item.querySelector('[class*="organizer"], .organizer');
            const prizeEl = item.querySelector('[class*="prize"], .prize');
            const dateEl = item.querySelector('[class*="date"], .date');
            const linkEl = item.querySelector('a');
            
            if (titleEl) {
              items.push({
                title: titleEl.textContent.trim(),
                organizer: organizerEl ? organizerEl.textContent.trim() : 'Various',
                prize: prizeEl ? prizeEl.textContent.trim() : 'Prizes Available',
                date: dateEl ? dateEl.textContent.trim() : '',
                link: linkEl ? linkEl.href : ''
              });
            }
          } catch (e) {
            console.error('Error parsing devfolio item:', e);
          }
        });
        return items;
      });
      
      for (const item of data) {
        const detectedDomain = this.detectDomain(item.title, '', [domain]);
        
        opportunities.push({
          title: item.title,
          company: item.organizer,
          location: 'Online',
          type: 'hackathon',
          domain: detectedDomain,
          domains: [detectedDomain],
          description: `Hackathon by ${item.organizer}`,
          salary: item.prize,
          experience: 'Any Level',
          applicationLink: item.link || 'https://devfolio.co/hackathons',
          sourceUrl: 'https://devfolio.co/hackathons',
          source: 'Devfolio',
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          postedDate: new Date(),
          remote: true,
          isActive: true
        });
      }
      
      await page.close();
      console.log(`✅ Found ${opportunities.length} hackathons from Devfolio`);
      
    } catch (error) {
      console.error(`❌ Error scraping Devfolio:`, error.message);
    }
    
    return opportunities;
  }

  // Scrape MLH for Hackathons
  async scrapeMLH() {
    console.log(`🔍 Scraping MLH for hackathons...`);
    const opportunities = [];
    
    try {
      const response = await axios.get('https://mlh.io/seasons/2025/events', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      
      $('.event').each((i, elem) => {
        try {
          const title = $(elem).find('.event-name').text().trim();
          const date = $(elem).find('.event-date').text().trim();
          const location = $(elem).find('.event-location').text().trim();
          const link = $(elem).find('a').attr('href');
          
          if (title) {
            const domain = this.detectDomain(title);
            
            opportunities.push({
              title,
              company: 'Major League Hacking',
              location: location || 'Online',
              type: 'hackathon',
              domain: domain,
              domains: [domain],
              description: `MLH hackathon - ${title}`,
              experience: 'Any Level',
              applicationLink: link || 'https://mlh.io/seasons/2025/events',
              sourceUrl: 'https://mlh.io/seasons/2025/events',
              source: 'MLH',
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              postedDate: new Date(),
              remote: location.toLowerCase().includes('online'),
              isActive: true
            });
          }
        } catch (e) {
          console.error('Error parsing MLH item:', e);
        }
      });
      
      console.log(`✅ Found ${opportunities.length} hackathons from MLH`);
      
    } catch (error) {
      console.error(`❌ Error scraping MLH:`, error.message);
    }
    
    return opportunities;
  }

  // Main scraping function for all domains
  async scrapeAllDomains() {
    console.log('🚀 Starting comprehensive domain-wise scraping...');
    const allOpportunities = [];
    
    try {
      await this.startBrowser();
      
      // Scrape each domain
      for (const [domain, config] of Object.entries(this.domains)) {
        console.log(`\n📚 Processing domain: ${domain}`);
        
        // Scrape Internshala for this domain
        if (config.sources[0] && config.sources[0].includes('internshala')) {
          const internshalaOpps = await this.scrapeInternshala(domain, config.sources[0]);
          allOpportunities.push(...internshalaOpps);
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Scrape hackathon platforms
      console.log('\n🎯 Scraping Hackathon Platforms...');
      const devfolioHacks = await this.scrapeDevfolio('Computer Science');
      allOpportunities.push(...devfolioHacks);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mlhHacks = await this.scrapeMLH();
      allOpportunities.push(...mlhHacks);
      
      // Save to database
      console.log(`\n💾 Saving ${allOpportunities.length} opportunities to database...`);
      await this.saveOpportunities(allOpportunities);
      
      console.log(`\n✅ Successfully scraped ${allOpportunities.length} total opportunities!`);
      console.log(`📊 Domain breakdown:`);
      const domainCounts = {};
      allOpportunities.forEach(opp => {
        domainCounts[opp.domain] = (domainCounts[opp.domain] || 0) + 1;
      });
      console.log(domainCounts);
      
    } catch (error) {
      console.error('❌ Error in scrapeAllDomains:', error);
    } finally {
      await this.closeBrowser();
    }
    
    return allOpportunities;
  }

  // Save opportunities to database
  async saveOpportunities(opportunities) {
    const saved = [];
    const skipped = [];
    
    for (const opp of opportunities) {
      try {
        // Check if already exists
        const existing = await Opportunity.findOne({
          title: opp.title,
          company: opp.company,
          isActive: true
        });
        
        if (existing) {
          // Update existing
          await Opportunity.findByIdAndUpdate(existing._id, {
            ...opp,
            lastUpdated: new Date()
          });
          skipped.push(opp);
        } else {
          // Create new
          await Opportunity.create(opp);
          saved.push(opp);
        }
      } catch (error) {
        console.error(`Error saving opportunity ${opp.title}:`, error.message);
      }
    }
    
    console.log(`✅ Saved: ${saved.length} new, Updated: ${skipped.length} existing`);
    return { saved, skipped };
  }

  // Clean old opportunities
  async cleanOldOpportunities(days = 60) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await Opportunity.updateMany(
      { scrapedAt: { $lt: cutoffDate } },
      { isActive: false }
    );
    console.log(`🗑️ Deactivated ${result.modifiedCount} old opportunities`);
  }
}

// Export for use in server
module.exports = DomainScraper;

// Run if executed directly
if (require.main === module) {
  const scraper = new DomainScraper();
  
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hacktrack', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('📦 Connected to MongoDB');
    return scraper.scrapeAllDomains();
  })
  .then(() => {
    console.log('✅ Scraping completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

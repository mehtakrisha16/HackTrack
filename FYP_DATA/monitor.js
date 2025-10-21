const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Opportunity Schema (simplified for monitoring)
const OpportunitySchema = new mongoose.Schema({
  title: String,
  company: String,
  type: String,
  category: String,
  scrapedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const Opportunity = mongoose.model('Opportunity', OpportunitySchema);

// Scraper Status Schema
const ScraperStatusSchema = new mongoose.Schema({
  source: String,
  lastRun: Date,
  lastSuccess: Date,
  status: String,
  totalScraped: Number,
  errorCount: Number,
  lastError: String
});

const ScraperStatus = mongoose.model('ScraperStatus', ScraperStatusSchema);

class ScraperMonitor {
  constructor() {
    this.connectToDatabase();
  }

  async connectToDatabase() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hacktrack';
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.log('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  async getOverallStats() {
    try {
      const stats = await Opportunity.aggregate([
        { 
          $match: { isActive: true }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            lastDay: {
              $sum: {
                $cond: [
                  { $gte: ["$scrapedAt", new Date(Date.now() - 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            },
            lastWeek: {
              $sum: {
                $cond: [
                  { $gte: ["$scrapedAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      return stats[0] || { total: 0, lastDay: 0, lastWeek: 0 };
    } catch (error) {
      console.log('❌ Error getting stats:', error.message);
      return { total: 0, lastDay: 0, lastWeek: 0 };
    }
  }

  async getCompanyStats() {
    try {
      const companyStats = await Opportunity.aggregate([
        { 
          $match: { 
            isActive: true,
            scrapedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: "$company",
            count: { $sum: 1 },
            latestScrape: { $max: "$scrapedAt" }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ]);

      return companyStats;
    } catch (error) {
      console.log('❌ Error getting company stats:', error.message);
      return [];
    }
  }

  async getTypeStats() {
    try {
      const typeStats = await Opportunity.aggregate([
        { 
          $match: { 
            isActive: true,
            scrapedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return typeStats;
    } catch (error) {
      console.log('❌ Error getting type stats:', error.message);
      return [];
    }
  }

  async getScraperStatus() {
    try {
      const scraperStats = await ScraperStatus.find({})
        .sort({ lastRun: -1 })
        .limit(20);
      
      return scraperStats;
    } catch (error) {
      console.log('❌ Error getting scraper status:', error.message);
      return [];
    }
  }

  async getRecentOpportunities(limit = 10) {
    try {
      const recent = await Opportunity.find({ isActive: true })
        .sort({ scrapedAt: -1 })
        .limit(limit)
        .select('title company type category scrapedAt');
      
      return recent;
    } catch (error) {
      console.log('❌ Error getting recent opportunities:', error.message);
      return [];
    }
  }

  formatDate(date) {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  async displayDashboard() {
    console.clear();
    console.log('🤖 Standalone Scraper Dashboard');
    console.log('================================');
    console.log(`📊 Status as of: ${new Date().toLocaleString()}\n`);

    // Overall Statistics
    const stats = await this.getOverallStats();
    console.log('📈 Overall Statistics:');
    console.log(`   Total Opportunities: ${stats.total.toLocaleString()}`);
    console.log(`   Added Last 24h:     ${stats.lastDay.toLocaleString()}`);
    console.log(`   Added Last Week:     ${stats.lastWeek.toLocaleString()}\n`);

    // Company Statistics
    const companyStats = await this.getCompanyStats();
    console.log('🏢 Top Companies (Last Week):');
    companyStats.forEach(company => {
      const name = (company._id || 'Unknown').padEnd(15);
      const count = company.count.toString().padStart(4);
      const lastScrape = this.formatDate(company.latestScrape).padStart(8);
      console.log(`   ${name}: ${count} opportunities (${lastScrape})`);
    });
    console.log('');

    // Type Distribution
    const typeStats = await this.getTypeStats();
    console.log('📋 Opportunity Types (Last Week):');
    typeStats.forEach(type => {
      const typeName = (type._id || 'Unknown').padEnd(12);
      const count = type.count.toString().padStart(4);
      console.log(`   ${typeName}: ${count} opportunities`);
    });
    console.log('');

    // Scraper Status
    const scraperStatus = await this.getScraperStatus();
    if (scraperStatus.length > 0) {
      console.log('🔧 Scraper Status by Source:');
      scraperStatus.forEach(scraper => {
        const name = (scraper.source || 'Unknown').padEnd(15);
        const status = (scraper.status || 'unknown').padEnd(8);
        const lastRun = this.formatDate(scraper.lastRun).padStart(8);
        const errors = (scraper.errorCount || 0).toString().padStart(3);
        console.log(`   ${name}: ${status} | Last: ${lastRun} | Errors: ${errors}`);
      });
      console.log('');
    }

    // Recent Opportunities
    const recent = await this.getRecentOpportunities(8);
    if (recent.length > 0) {
      console.log('🆕 Recent Opportunities:');
      recent.forEach((opp, i) => {
        const title = (opp.title || 'Untitled').substring(0, 40).padEnd(40);
        const company = (opp.company || 'Unknown').padEnd(15);
        const type = (opp.type || 'job').padEnd(10);
        const time = this.formatDate(opp.scrapedAt).padStart(8);
        console.log(`   ${(i + 1).toString().padStart(2)}. ${title} | ${company} | ${type} | ${time}`);
      });
      console.log('');
    }

    console.log('💡 Commands:');
    console.log('   node monitor.js          - Show this dashboard');
    console.log('   node monitor.js --watch  - Auto-refresh every 30 seconds');
    console.log('   node monitor.js --stats  - Show detailed statistics only');
    console.log('   .\scraper-service.ps1 -Status  - Check service status');
    console.log('');
  }

  async displayStats() {
    const stats = await this.getOverallStats();
    const companyStats = await this.getCompanyStats();
    const typeStats = await this.getTypeStats();

    console.log('📊 Detailed Statistics');
    console.log('=====================');
    console.log(`Total Active Opportunities: ${stats.total.toLocaleString()}`);
    console.log(`New in Last 24 Hours: ${stats.lastDay.toLocaleString()}`);
    console.log(`New in Last Week: ${stats.lastWeek.toLocaleString()}`);
    console.log('');
    
    console.log('Company Breakdown:');
    companyStats.forEach(company => {
      console.log(`  ${company._id}: ${company.count} opportunities`);
    });
    console.log('');
    
    console.log('Type Breakdown:');
    typeStats.forEach(type => {
      console.log(`  ${type._id}: ${type.count} opportunities`);
    });
  }

  async startWatchMode() {
    console.log('👀 Starting watch mode (refreshing every 30 seconds)...');
    console.log('Press Ctrl+C to exit\n');
    
    const refresh = async () => {
      await this.displayDashboard();
      console.log('🔄 Refreshing in 30 seconds... (Ctrl+C to exit)');
    };

    await refresh();
    const interval = setInterval(refresh, 30000);

    process.on('SIGINT', () => {
      clearInterval(interval);
      console.log('\n👋 Exiting watch mode...');
      process.exit(0);
    });
  }
}

// Main execution
async function main() {
  const monitor = new ScraperMonitor();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--watch')) {
    await monitor.startWatchMode();
  } else if (args.includes('--stats')) {
    await monitor.displayStats();
    process.exit(0);
  } else {
    await monitor.displayDashboard();
    process.exit(0);
  }
}

main().catch(error => {
  console.error('❌ Monitor failed:', error.message);
  process.exit(1);
});

module.exports = ScraperMonitor;
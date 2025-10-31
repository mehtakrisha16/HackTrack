require('dotenv').config();
const mongoose = require('mongoose');
const DomainScraper = require('./src/services/domainScraper');

async function testDomainScraper() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hacktrack', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    const scraper = new DomainScraper();
    
    console.log('📚 Available Domains:');
    Object.keys(scraper.domains).forEach((domain, index) => {
      console.log(`${index + 1}. ${domain} - ${scraper.domains[domain].keywords.slice(0, 3).join(', ')}...`);
    });
    
    console.log('\n🚀 Starting domain-wise scraping...\n');
    const opportunities = await scraper.scrapeAllDomains();
    
    console.log('\n✅ Scraping completed!');
    console.log(`Total opportunities found: ${opportunities.length}`);
    
    // Show domain breakdown
    console.log('\n📊 Domain Breakdown:');
    const domainCounts = {};
    opportunities.forEach(opp => {
      domainCounts[opp.domain] = (domainCounts[opp.domain] || 0) + 1;
    });
    
    Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([domain, count]) => {
        console.log(`  ${domain}: ${count} opportunities`);
      });
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testDomainScraper();

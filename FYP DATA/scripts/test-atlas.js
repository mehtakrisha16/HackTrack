/**
 * MongoDB Atlas Connection Setup Helper
 * Run this script to test your Atlas connection
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Test Atlas connection
async function testAtlasConnection() {
  console.log('🚀 Testing MongoDB Atlas Connection...\n');

  try {
    // Check if MongoDB URI is provided
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI;
    
    if (!mongoUri) {
      console.log('❌ No MongoDB URI found in environment variables');
      console.log('📝 Please set MONGODB_URI in your .env file');
      console.log('\nExample for Atlas:');
      console.log('MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/hacktrack-mumbai?retryWrites=true&w=majority');
      return;
    }

    if (mongoUri.includes('localhost')) {
      console.log('🏠 Detected local MongoDB URI');
      console.log('💡 For Atlas setup, use a connection string like:');
      console.log('   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/hacktrack-mumbai');
      console.log('\n📋 Steps to set up Atlas:');
      console.log('1. Go to https://cloud.mongodb.com');
      console.log('2. Create free account and cluster');
      console.log('3. Create database user');
      console.log('4. Whitelist IP address');
      console.log('5. Get connection string');
      console.log('6. Update .env file');
      return;
    }

    console.log('🔗 Attempting to connect to Atlas...');
    console.log(`📍 URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

    // Connect with timeout
    const connection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });

    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log(`📊 Database: ${connection.connection.name}`);
    console.log(`🌐 Host: ${connection.connection.host}`);
    console.log(`📈 Ready State: ${connection.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);

    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    collections.forEach(col => console.log(`   - ${col.name}`));

    // Test insert/read operation
    const testCollection = mongoose.connection.db.collection('connection-test');
    const testDoc = {
      message: 'Connection test successful',
      timestamp: new Date(),
      from: 'HackTrack Mumbai Backend'
    };

    await testCollection.insertOne(testDoc);
    console.log('✅ Write operation successful');

    const retrievedDoc = await testCollection.findOne({ message: 'Connection test successful' });
    console.log('✅ Read operation successful');

    // Clean up test document
    await testCollection.deleteOne({ _id: retrievedDoc._id });
    console.log('✅ Delete operation successful');

    console.log('\n🎉 All Atlas tests passed!');
    console.log('🚀 Your database is ready for the HackTrack application');

  } catch (error) {
    console.error('\n❌ Connection failed:');
    
    if (error.message.includes('authentication failed')) {
      console.log('🔐 Authentication Error: Check username/password in connection string');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('🌐 Network Error: Check cluster URL and internet connection');
    } else if (error.message.includes('IP not in whitelist')) {
      console.log('🛡️ Network Access Error: Add your IP to Atlas whitelist');
    } else {
      console.log(`💥 Error: ${error.message}`);
    }

    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Verify connection string format');
    console.log('2. Check database user credentials');
    console.log('3. Ensure IP address is whitelisted (0.0.0.0/0 for anywhere)');
    console.log('4. Check cluster status in Atlas dashboard');
    console.log('5. Try connecting with MongoDB Compass first');
  } finally {
    await mongoose.connection.close();
    console.log('\n📊 Connection closed');
    process.exit(0);
  }
}

// Sample .env template
function showEnvTemplate() {
  console.log('\n📄 Sample .env file template:');
  console.log('# ================================');
  console.log('# MongoDB Atlas Configuration');
  console.log('# ================================');
  console.log('MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/hacktrack-mumbai?retryWrites=true&w=majority');
  console.log('');
  console.log('# ================================');
  console.log('# Application Configuration');
  console.log('# ================================');
  console.log('NODE_ENV=development');
  console.log('PORT=5000');
  console.log('FRONTEND_URL=http://localhost:3000');
  console.log('JWT_SECRET=your-super-secret-jwt-key');
  console.log('JWT_EXPIRE=30d');
  console.log('');
  console.log('# ================================');
  console.log('# Optional: Email Configuration');
  console.log('# ================================');
  console.log('EMAIL_HOST=smtp.gmail.com');
  console.log('EMAIL_PORT=587');
  console.log('EMAIL_USER=your-email@gmail.com');
  console.log('EMAIL_PASS=your-app-password');
}

// Run the test
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--template')) {
    showEnvTemplate();
  } else {
    testAtlasConnection();
  }
}

module.exports = { testAtlasConnection };
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('🚀 Testing MongoDB Atlas Connection with SSL options...\n');

  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔗 Connection URI (masked):', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

    // Try different connection options
    const options = [
      // Option 1: Default options
      {
        name: 'Default Options',
        opts: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000,
        }
      },
      // Option 2: With SSL explicitly disabled for testing
      {
        name: 'SSL Disabled (Testing)',
        opts: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000,
          ssl: false,
          sslValidate: false
        }
      },
      // Option 3: With SSL options
      {
        name: 'SSL with Options',
        opts: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000,
          ssl: true,
          sslValidate: true,
          tlsAllowInvalidCertificates: true,
          tlsAllowInvalidHostnames: true
        }
      }
    ];

    for (const option of options) {
      console.log(`\n🧪 Testing with ${option.name}...`);
      
      try {
        const connection = await mongoose.connect(mongoUri, option.opts);
        
        console.log('✅ Connection successful!');
        console.log(`📊 Database: ${connection.connection.name}`);
        console.log(`🌐 Host: ${connection.connection.host}`);
        
        // Test basic operation
        const testCollection = mongoose.connection.db.collection('connection-test');
        await testCollection.insertOne({ 
          test: true, 
          timestamp: new Date(),
          method: option.name 
        });
        console.log('✅ Write test successful');
        
        await mongoose.connection.close();
        console.log('📊 Connection closed successfully');
        return true;
        
      } catch (error) {
        console.log(`❌ ${option.name} failed:`, error.message);
        try {
          await mongoose.connection.close();
        } catch (closeError) {
          // Ignore close errors
        }
      }
    }

    console.log('\n❌ All connection attempts failed');
    return false;

  } catch (error) {
    console.error('💥 General error:', error.message);
    return false;
  }
}

// Also test with MongoDB native driver
async function testNativeDriver() {
  console.log('\n🔧 Testing with MongoDB Native Driver...');
  
  try {
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI;
    
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      tlsAllowInvalidCertificates: true
    });
    
    await client.connect();
    console.log('✅ Native driver connection successful!');
    
    const db = client.db('hacktrack-mumbai');
    const collection = db.collection('connection-test');
    
    await collection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      driver: 'native' 
    });
    
    console.log('✅ Native driver write successful');
    
    await client.close();
    console.log('📊 Native driver connection closed');
    
    return true;
    
  } catch (error) {
    console.log('❌ Native driver failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🎯 MongoDB Atlas Connection Test\n');
  
  const mongooseResult = await testConnection();
  const nativeResult = await testNativeDriver();
  
  console.log('\n📊 Test Results:');
  console.log(`   Mongoose: ${mongooseResult ? '✅ Success' : '❌ Failed'}`);
  console.log(`   Native Driver: ${nativeResult ? '✅ Success' : '❌ Failed'}`);
  
  if (mongooseResult || nativeResult) {
    console.log('\n🎉 At least one connection method worked!');
    console.log('💡 You can now run: npm run seed');
  } else {
    console.log('\n🔧 Connection troubleshooting steps:');
    console.log('1. Check if your IP is whitelisted in Atlas (try 0.0.0.0/0)');
    console.log('2. Verify username and password are correct');
    console.log('3. Check if cluster is active and running');
    console.log('4. Try connecting with MongoDB Compass first');
    console.log('5. Check your firewall/antivirus settings');
  }
  
  process.exit(0);
}

main();
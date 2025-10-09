const mongoose = require('mongoose');
const https = require('https');
require('dotenv').config();

const checkIPAndConnect = async () => {
  try {
    // Get current public IP
    console.log('🌐 Getting current public IP address...');
    
    const getCurrentIP = () => {
      return new Promise((resolve, reject) => {
        https.get('https://api.ipify.org?format=json', (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              resolve(result.ip);
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });
    };

    const currentIP = await getCurrentIP();
    console.log(`📍 Your current public IP: ${currentIP}`);
    console.log('');
    console.log('🔗 MongoDB Atlas Setup Instructions:');
    console.log('1. Go to https://cloud.mongodb.com');
    console.log('2. Navigate to "Network Access" in the left sidebar');
    console.log('3. Click "Add IP Address"');
    console.log(`4. Add this IP: ${currentIP}`);
    console.log('   OR add 0.0.0.0/0 to allow all IPs (less secure)');
    console.log('5. Save and wait 1-2 minutes for changes to take effect');
    console.log('');

    // Try to connect to MongoDB Atlas
    console.log('🔄 Testing MongoDB Atlas connection...');
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    console.log(`📊 Database Host: ${conn.connection.host}`);
    console.log(`📈 Database Name: ${conn.connection.name}`);
    console.log(`🔌 Connection State: Connected`);
    
    // Test database operations
    console.log('');
    console.log('🧪 Testing database operations...');
    
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📚 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 Collection names:', collections.map(c => c.name).join(', '));
    }
    
    await mongoose.connection.close();
    console.log('');
    console.log('🎉 MongoDB Atlas connection test PASSED!');
    console.log('✅ Your server should now start without demo mode');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection FAILED');
    console.error('🔧 Error:', error.message);
    console.log('');
    
    if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('not authorized')) {
      console.log('💡 SOLUTION: This is an IP whitelist issue');
      console.log('   Follow the setup instructions above to add your IP');
    } else if (error.message.includes('authentication')) {
      console.log('💡 SOLUTION: Check your username/password in the connection string');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.log('💡 SOLUTION: Check your internet connection and try again');
    } else {
      console.log('💡 SOLUTION: Check MongoDB Atlas dashboard for cluster status');
    }
    
    console.log('');
    console.log('🔄 After fixing the issue, restart your server with:');
    console.log('   cd "D:\\FINAL\\FYP_DATA" && node src/server.js');
    
    process.exit(1);
  }
};

checkIPAndConnect();
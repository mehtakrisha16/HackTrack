const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('Connection URI:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📊 Database Host: ${conn.connection.host}`);
    console.log(`📈 Database Name: ${conn.connection.name}`);
    console.log(`🔌 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Test a simple operation
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📚 Available collections: ${collections.length}`);
    
    await mongoose.connection.close();
    console.log('✅ Connection test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔧 Error details:', error.name);
    
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('💡 This appears to be an SSL/TLS error. Trying local fallback...');
      
      try {
        const localConn = await mongoose.connect('mongodb://localhost:27017/hacktrack-mumbai', {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        console.log('✅ Local MongoDB connection successful!');
        await mongoose.connection.close();
        process.exit(0);
      } catch (localError) {
        console.error('❌ Local MongoDB also failed:', localError.message);
      }
    }
    
    process.exit(1);
  }
};

testConnection();
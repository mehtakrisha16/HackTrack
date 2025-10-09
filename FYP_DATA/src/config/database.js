const mongoose = require('mongoose');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.useLocalFallback = false;
  }

  async connect() {
    try {
      // Set mongoose options
      mongoose.set('strictQuery', false);

      console.log('🔄 Attempting MongoDB Atlas connection...');
      
      // Use exact same options as the successful test script with SSL fixes
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 30000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority',
        ssl: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true
      };

      const conn = await mongoose.connect(process.env.MONGODB_URI, options);
      
      this.isConnected = true;
      console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
      console.log(`📊 Database Host: ${conn.connection.host}`);
      console.log(`📈 Database Name: ${conn.connection.name}`);
      console.log(`🔌 Connection State: Connected`);
      
      this.setupEventListeners();
      return conn;

    } catch (error) {
      console.error('❌ MongoDB Atlas connection FAILED');
      console.error('🔧 Error:', error.message);
      console.warn('⚠️  Starting server without database for testing...');
      console.log('💡 Login endpoints will return mock responses');
      this.isConnected = false;
      
      // Don't exit - continue for testing
      return null;
    }
  }

  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
      this.isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Mongoose reconnected to MongoDB');
      this.isConnected = true;
    });
  }

  async disconnect() {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
      this.isConnected = false;
      console.log('📊 MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
    }
  }

  isMongoConnected() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  getConnectionInfo() {
    if (this.isConnected) {
      return {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
        collections: Object.keys(mongoose.connection.collections)
      };
    }
    return { 
      status: 'disconnected',
      fallbackMode: this.useLocalFallback 
    };
  }
}

// Export singleton instance
const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
const mongoose = require('mongoose');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      // Set mongoose options
      mongoose.set('strictQuery', false);

      // Connection options
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        family: 4, // Use IPv4, skip trying IPv6
        retryWrites: true,
        w: 'majority',
        // SSL/TLS Configuration
        ssl: true,
        sslValidate: false, // Disable SSL certificate validation for development
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true
      };

      // Try multiple connection strings
      let connectionUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hacktrack-mumbai';
      
      // If using Atlas, try with different SSL configurations
      if (connectionUri.includes('mongodb+srv://')) {
        // Try the original URI first
        try {
          console.log('🔄 Attempting MongoDB Atlas connection...');
          const conn = await mongoose.connect(connectionUri, options);
          return conn;
        } catch (atlasError) {
          console.log('⚠️ Atlas connection failed, trying alternative...');
          
          // Try with modified SSL settings
          const altOptions = {
            ...options,
            ssl: false,
            tls: true,
            tlsInsecure: true
          };
          
          try {
            const conn = await mongoose.connect(connectionUri, altOptions);
            return conn;
          } catch (altError) {
            console.log('⚠️ Alternative Atlas config failed, trying local fallback...');
            connectionUri = 'mongodb://localhost:27017/hacktrack-mumbai';
          }
        }
      }
      
      // Connect to MongoDB (Atlas or local)
      const conn = await mongoose.connect(connectionUri, options);

      this.isConnected = true;

      console.log('🚀 Connected to MongoDB - HackTrack Mumbai Database');
      console.log(`📊 Database Host: ${conn.connection.host}`);
      console.log(`📈 Database Name: ${conn.connection.name}`);
      console.log(`🔌 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

      // Connection event listeners
      mongoose.connection.on('connected', () => {
        console.log('✅ Mongoose connected to MongoDB');
      });

      mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ Mongoose disconnected from MongoDB');
        this.isConnected = false;
      });

      return conn;

    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      this.isConnected = false;
      
      // Don't exit in development, let the app run with limited functionality
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      } else {
        console.log('🟡 Running in development mode without database...');
      }
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
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
    return null;
  }
}

// Export singleton instance
const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
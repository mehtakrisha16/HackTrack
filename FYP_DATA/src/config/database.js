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
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
      };

      // Connect to MongoDB
      const conn = await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/hacktrack-mumbai',
        options
      );

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
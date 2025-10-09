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

      // First try MongoDB Atlas with simplified SSL settings
      if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv://')) {
        console.log('🔄 Attempting MongoDB Atlas connection...');
        
        // Try with simplified connection string
        const atlasUri = process.env.MONGODB_URI.split('?')[0] + '?retryWrites=true&w=majority';
        
        const atlasOptions = {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 8000,
          connectTimeoutMS: 8000,
          socketTimeoutMS: 30000,
          maxPoolSize: 5,
          ssl: false // Disable SSL temporarily
        };

        try {
          const conn = await mongoose.connect(atlasUri, atlasOptions);
          this.isConnected = true;
          console.log('✅ Connected to MongoDB Atlas');
          console.log(`📊 Database Host: ${conn.connection.host}`);
          console.log(`📈 Database Name: ${conn.connection.name}`);
          this.setupEventListeners();
          return conn;
        } catch (atlasError) {
          console.log('⚠️ Atlas connection failed:', atlasError.message);
        }
      }

      // Try local MongoDB
      console.log('🔄 Attempting local MongoDB connection...');
      const localOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      };

      try {
        const conn = await mongoose.connect('mongodb://localhost:27017/hacktrack-mumbai', localOptions);
        this.isConnected = true;
        console.log('✅ Connected to local MongoDB');
        console.log(`📊 Database Host: ${conn.connection.host}`);
        console.log(`📈 Database Name: ${conn.connection.name}`);
        this.setupEventListeners();
        return conn;
      } catch (localError) {
        console.log('⚠️ Local MongoDB connection failed:', localError.message);
      }

      // If both fail, use memory storage mode
      throw new Error('No database connection available');

    } catch (error) {
      console.error('❌ All database connections failed:', error.message);
      this.isConnected = false;
      this.useLocalFallback = true;
      
      // Don't exit in development, let the app run with limited functionality
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      } else {
        console.log('🟡 Running in development mode without database...');
        console.log('💡 Use demo credentials: any email with password "demo123"');
      }
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
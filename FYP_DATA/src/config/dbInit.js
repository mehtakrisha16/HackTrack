const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Initialize database with collections, indexes, and seed data
 */
class DatabaseInitializer {
  
  async initializeDatabase() {
    try {
      console.log('🚀 Initializing HackTrack Mumbai Database...');

      // Create indexes for better performance
      await this.createIndexes();

      // Create admin user if it doesn't exist
      await this.createAdminUser();

      // Seed initial data if needed
      await this.seedInitialData();

      console.log('✅ Database initialization completed successfully');
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      console.log('📊 Creating database indexes...');

      // User collection indexes
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await User.collection.createIndex({ 'location.city': 1, 'location.state': 1 });
      await User.collection.createIndex({ 'education.university': 1 });
      await User.collection.createIndex({ skills: 1 });
      await User.collection.createIndex({ interests: 1 });
      await User.collection.createIndex({ createdAt: -1 });
      await User.collection.createIndex({ isActive: 1 });
      await User.collection.createIndex({ 'stats.hackathonsWon': -1 });
      await User.collection.createIndex({ lastLogin: -1 });

      console.log('✅ Database indexes created successfully');
      
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      // Don't throw error for index creation failures
    }
  }

  async createAdminUser() {
    try {
      console.log('👤 Checking for admin user...');

      const adminExists = await User.findOne({ email: 'admin@hacktrack.mumbai' });
      
      if (!adminExists) {
        const adminUser = new User({
          name: 'HackTrack Admin',
          email: 'admin@hacktrack.com',
          password: 'Admin@123',
          role: 'admin',
          location: {
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India'
          },
          education: {
            university: 'IIT Bombay',
            degree: 'B.Tech',
            branch: 'Computer Science',
            year: 4,
            graduationYear: 2025
          },
          skills: ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB'],
          interests: ['FinTech', 'AI/ML', 'Web Development'],
          isEmailVerified: true,
          isActive: true,
          preferences: {
            notifications: { email: true, sms: false, push: true },
            privacy: { profileVisible: true, contactVisible: false, achievementsVisible: true }
          }
        });

        await adminUser.save();
        console.log('✅ Admin user created successfully');
      } else {
        console.log('ℹ️ Admin user already exists');
      }
      
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
      // Don't throw error for admin user creation failures
    }
  }

  async seedInitialData() {
    try {
      console.log('🌱 Seeding initial data...');

      const userCount = await User.countDocuments();
      
      if (userCount === 0 || userCount === 1) { // Only admin exists
        await this.createSampleUsers();
      }

      console.log('✅ Initial data seeding completed');
      
    } catch (error) {
      console.error('❌ Error seeding initial data:', error);
      // Don't throw error for seeding failures
    }
  }

  async createSampleUsers() {
    try {
      console.log('👥 Creating sample users...');

      const sampleUsers = [
        {
          name: 'Rahul Sharma',
          email: 'rahul.sharma@student.iitb.ac.in',
          password: 'Student@123',
          location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400076' },
          education: {
            university: 'IIT Bombay',
            degree: 'B.Tech',
            branch: 'Computer Science',
            year: 3,
            graduationYear: 2026
          },
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          interests: ['FinTech', 'AI/ML', 'Web Development'],
          stats: { hackathonsParticipated: 3, hackathonsWon: 1, eventsAttended: 5 }
        },
        {
          name: 'Priya Patel',
          email: 'priya.patel@mumbai.ac.in',
          password: 'Student@123',
          location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400019' },
          education: {
            university: 'Mumbai University',
            degree: 'B.E.',
            branch: 'Information Technology',
            year: 2,
            graduationYear: 2027
          },
          skills: ['Java', 'Python', 'Machine Learning', 'Data Science'],
          interests: ['AI/ML', 'Data Science', 'HealthTech'],
          stats: { hackathonsParticipated: 2, eventsAttended: 8, internshipsCompleted: 1 }
        },
        {
          name: 'Arjun Mehta',
          email: 'arjun.mehta@vit.ac.in',
          password: 'Student@123',
          location: { city: 'Vellore', state: 'Tamil Nadu', country: 'India', pincode: '632014' },
          education: {
            university: 'VIT Vellore',
            degree: 'B.Tech',
            branch: 'Electronics',
            year: 4,
            graduationYear: 2025
          },
          skills: ['C++', 'IoT', 'Arduino', 'Python'],
          interests: ['IoT', 'Cybersecurity', 'Mobile Development'],
          stats: { hackathonsParticipated: 5, hackathonsWon: 2, eventsAttended: 12, projectsCompleted: 3 }
        }
      ];

      for (const userData of sampleUsers) {
        const existingUser = await User.findOne({ email: userData.email });
        if (!existingUser) {
          const user = new User(userData);
          await user.save();
          console.log(`✅ Created sample user: ${userData.name}`);
        }
      }

    } catch (error) {
      console.error('❌ Error creating sample users:', error);
    }
  }

  async getDbStats() {
    try {
      const stats = {
        users: await User.countDocuments(),
        activeUsers: await User.countDocuments({ isActive: true }),
        mumbaiUsers: await User.countDocuments({ 'location.city': /Mumbai/i }),
        verifiedUsers: await User.countDocuments({ isEmailVerified: true }),
        totalHackathonParticipations: await User.aggregate([
          { $group: { _id: null, total: { $sum: '$stats.hackathonsParticipated' } } }
        ]),
        averageEventsAttended: await User.aggregate([
          { $group: { _id: null, avg: { $avg: '$stats.eventsAttended' } } }
        ])
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      return null;
    }
  }
}

module.exports = new DatabaseInitializer();
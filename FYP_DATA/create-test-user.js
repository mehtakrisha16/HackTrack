const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if test user exists
    let user = await User.findOne({ email: 'test@hacktrack.com' });
    
    if (user) {
      console.log('Test user already exists:', user.email);
    } else {
      // Create test user
      user = await User.create({
        name: 'Test User',
        email: 'test@hacktrack.com',
        password: 'test123',
        phone: '9876543210',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India'
        },
        education: {
          university: 'IIT Bombay',
          degree: 'B.Tech',
          branch: 'Computer Science',
          year: 3
        },
        skills: ['JavaScript', 'React', 'Node.js'],
        interests: ['Web Development', 'AI/ML'],
        isEmailVerified: true,
        profileCompleted: true
      });
      console.log('Test user created:', user.email);
    }
    
    await mongoose.connection.close();
    console.log('✅ Test user setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
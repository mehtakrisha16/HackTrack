const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing user
    await User.deleteOne({ email: 'mehtakrisha2007@gmail.com' });
    console.log('🗑️ Deleted existing user');

    // Create new user
    const user = await User.create({
      name: 'Krisha Mehta',
      email: 'mehtakrisha2007@gmail.com',
      password: 'Krisha@123',
      phone: '+91-9876543210',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      }
    });

    console.log('✅ User created!');
    console.log('📧 Email: mehtakrisha2007@gmail.com');
    console.log('🔑 Password: Krisha@123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

createTestUser();
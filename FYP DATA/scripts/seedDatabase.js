const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/User');

// Sample data for seeding
const sampleUsers = [
  {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@iitb.ac.in',
    password: 'Student@123',
    phone: '+91-9876543210',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400076'
    },
    education: {
      university: 'IIT Bombay',
      degree: 'B.Tech',
      branch: 'Computer Science',
      year: 3,
      graduationYear: 2026
    },
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
    interests: ['FinTech', 'AI/ML', 'Web Development', 'Startup'],
    stats: {
      eventsAttended: 5,
      hackathonsParticipated: 3,
      hackathonsWon: 1,
      internshipsCompleted: 1,
      projectsCompleted: 2,
      connectionsBuilt: 15
    },
    achievements: [
      {
        title: 'Winner - Mumbai FinTech Hackathon 2024',
        description: 'Built a UPI-based payment solution for small businesses',
        date: new Date('2024-10-15'),
        category: 'hackathon',
        organization: 'NASSCOM Mumbai'
      },
      {
        title: 'TCS Summer Internship',
        description: 'Worked on enterprise software development',
        date: new Date('2024-06-01'),
        category: 'internship',
        organization: 'Tata Consultancy Services'
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/rahul-sharma-dev',
      github: 'https://github.com/rahulsharma-dev',
      portfolio: 'https://rahulsharma.dev'
    },
    isEmailVerified: true,
    isActive: true
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@vjti.ac.in',
    password: 'Student@123',
    phone: '+91-9876543211',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400019'
    },
    education: {
      university: 'VJTI Mumbai',
      degree: 'B.E.',
      branch: 'Information Technology',
      year: 2,
      graduationYear: 2027
    },
    skills: ['Python', 'Machine Learning', 'Data Science', 'Java', 'SQL'],
    interests: ['Data Science', 'AI/ML', 'HealthTech', 'Research'],
    stats: {
      eventsAttended: 8,
      hackathonsParticipated: 2,
      hackathonsWon: 0,
      internshipsCompleted: 1,
      projectsCompleted: 3,
      connectionsBuilt: 12
    },
    achievements: [
      {
        title: 'Data Science Workshop Certificate',
        description: 'Completed advanced data science workshop at IIT Bombay',
        date: new Date('2024-08-20'),
        category: 'certification',
        organization: 'IIT Bombay'
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/priya-patel-data',
      github: 'https://github.com/priya-data'
    },
    isEmailVerified: true,
    isActive: true
  },
  {
    name: 'Arjun Mehta',
    email: 'arjun.mehta@somaiya.edu',
    password: 'Student@123',
    phone: '+91-9876543212',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400077'
    },
    education: {
      university: 'K.J. Somaiya College',
      degree: 'B.Tech',
      branch: 'Electronics',
      year: 4,
      graduationYear: 2025
    },
    skills: ['C++', 'IoT', 'Arduino', 'Python', 'Embedded Systems'],
    interests: ['IoT', 'Cybersecurity', 'Mobile Development', 'Hardware'],
    stats: {
      eventsAttended: 12,
      hackathonsParticipated: 5,
      hackathonsWon: 2,
      internshipsCompleted: 2,
      projectsCompleted: 4,
      connectionsBuilt: 25
    },
    achievements: [
      {
        title: 'Winner - Smart City Hackathon Mumbai',
        description: 'IoT-based traffic management system',
        date: new Date('2024-09-20'),
        category: 'hackathon',
        organization: 'BMC & TiE Mumbai'
      },
      {
        title: 'Reliance Jio IoT Internship',
        description: 'Worked on 5G IoT applications',
        date: new Date('2024-05-15'),
        category: 'internship',
        organization: 'Reliance Jio'
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/arjun-mehta-iot',
      github: 'https://github.com/arjun-iot',
      portfolio: 'https://arjunmehta.tech'
    },
    isEmailVerified: true,
    isActive: true
  },
  {
    name: 'Sneha Gupta',
    email: 'sneha.gupta@spit.ac.in',
    password: 'Student@123',
    phone: '+91-9876543213',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400058'
    },
    education: {
      university: 'SPIT Mumbai',
      degree: 'B.Tech',
      branch: 'Computer Science',
      year: 1,
      graduationYear: 2028
    },
    skills: ['Java', 'Python', 'React', 'HTML/CSS'],
    interests: ['Web Development', 'UI/UX Design', 'Mobile Development'],
    stats: {
      eventsAttended: 3,
      hackathonsParticipated: 1,
      hackathonsWon: 0,
      internshipsCompleted: 0,
      projectsCompleted: 1,
      connectionsBuilt: 8
    },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sneha-gupta-dev',
      github: 'https://github.com/sneha-dev'
    },
    isEmailVerified: true,
    isActive: true
  },
  {
    name: 'Karan Singh',
    email: 'karan.singh@mumbai.ac.in',
    password: 'Student@123',
    phone: '+91-9876543214',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400032'
    },
    education: {
      university: 'Mumbai University',
      degree: 'BCA',
      branch: 'Computer Applications',
      year: 3,
      graduationYear: 2025
    },
    skills: ['JavaScript', 'PHP', 'MySQL', 'WordPress', 'Digital Marketing'],
    interests: ['Web Development', 'E-commerce', 'Digital Marketing', 'Freelancing'],
    stats: {
      eventsAttended: 6,
      hackathonsParticipated: 2,
      hackathonsWon: 0,
      internshipsCompleted: 1,
      projectsCompleted: 5,
      connectionsBuilt: 18
    },
    achievements: [
      {
        title: 'Freelance Web Developer',
        description: 'Successfully completed 10+ client projects',
        date: new Date('2024-07-01'),
        category: 'project',
        organization: 'Self-employed'
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/karan-singh-web',
      github: 'https://github.com/karan-web',
      portfolio: 'https://karansingh.dev'
    },
    isEmailVerified: true,
    isActive: true
  }
];

/**
 * Connect to MongoDB and seed the database
 */
async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding process...');

    // Connect to MongoDB with SSL options
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/hacktrack-mumbai',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // 10 second timeout
        maxPoolSize: 10,
        socketTimeoutMS: 45000
      }
    );

    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - remove in production)
    const existingUsersCount = await User.countDocuments();
    console.log(`📊 Found ${existingUsersCount} existing users`);

    // Create users
    console.log('👥 Creating sample users...');
    
    for (const userData of sampleUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⚠️ User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Create new user (password will be hashed by the pre-save middleware)
        const user = new User(userData);
        await user.save();
        
        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
        
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    // Display database statistics
    const totalUsers = await User.countDocuments();
    const mumbaiUsers = await User.countDocuments({ 'location.city': 'Mumbai' });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

    console.log('\n📊 Database Statistics:');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Mumbai Users: ${mumbaiUsers}`);
    console.log(`   Verified Users: ${verifiedUsers}`);

    // Display users by university
    console.log('\n🏛️ Users by University:');
    const usersByUniversity = await User.aggregate([
      {
        $group: {
          _id: '$education.university',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    usersByUniversity.forEach(uni => {
      console.log(`   ${uni._id}: ${uni.count} users`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleUsers };
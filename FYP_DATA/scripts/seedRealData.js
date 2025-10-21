const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Real data for Mumbai and India tech ecosystem
const realColleges = [
  {
    name: 'Indian Institute of Technology Bombay',
    shortName: 'IIT Bombay',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    type: 'Government',
    established: 1958,
    ranking: { nirf: 3, qs: 172 },
    website: 'https://www.iitb.ac.in',
    programs: ['Computer Science', 'Electronics', 'Mechanical', 'Chemical', 'Civil'],
    placementRate: 95.2,
    averagePackage: 2500000
  },
  {
    name: 'Veermata Jijabai Technological Institute',
    shortName: 'VJTI',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    type: 'Government',
    established: 1887,
    ranking: { nirf: 47, qs: null },
    website: 'https://vjti.ac.in',
    programs: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical'],
    placementRate: 92.5,
    averagePackage: 1200000
  },
  {
    name: 'Sardar Patel Institute of Technology',
    shortName: 'SPIT',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    type: 'Private',
    established: 1962,
    ranking: { nirf: 89, qs: null },
    website: 'https://www.spit.ac.in',
    programs: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical'],
    placementRate: 88.7,
    averagePackage: 950000
  },
  {
    name: 'K.J. Somaiya College of Engineering',
    shortName: 'KJSCE',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    type: 'Private',
    established: 1983,
    ranking: { nirf: 112, qs: null },
    website: 'https://kjsce.somaiya.edu.in',
    programs: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical'],
    placementRate: 85.3,
    averagePackage: 850000
  },
  {
    name: 'Thadomal Shahani Engineering College',
    shortName: 'TSEC',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    type: 'Private',
    established: 1983,
    ranking: { nirf: 156, qs: null },
    website: 'https://www.tsec.edu',
    programs: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical'],
    placementRate: 82.1,
    averagePackage: 750000
  }
];

const realCompanies = [
  {
    name: 'Tata Consultancy Services',
    shortName: 'TCS',
    sector: 'IT Services',
    headquarters: 'Mumbai, Maharashtra',
    founded: 1968,
    employees: 600000,
    revenue: 25000000000,
    website: 'https://www.tcs.com',
    technologies: ['Java', 'Python', 'React', 'Angular', 'Cloud', 'AI/ML'],
    hiringLocations: ['Mumbai', 'Pune', 'Bangalore', 'Chennai', 'Hyderabad'],
    internshipPrograms: true,
    campusRecruitment: true
  },
  {
    name: 'Reliance Jio Infocomm Limited',
    shortName: 'Jio',
    sector: 'Telecommunications',
    headquarters: 'Mumbai, Maharashtra',
    founded: 2007,
    employees: 25000,
    revenue: 8500000000,
    website: 'https://www.jio.com',
    technologies: ['5G', 'IoT', 'Cloud', 'AI/ML', 'Blockchain', 'React Native'],
    hiringLocations: ['Mumbai', 'Pune', 'Bangalore', 'Delhi'],
    internshipPrograms: true,
    campusRecruitment: true
  },
  {
    name: 'Infosys Limited',
    shortName: 'Infosys',
    sector: 'IT Services',
    headquarters: 'Bangalore, Karnataka',
    founded: 1981,
    employees: 350000,
    revenue: 18000000000,
    website: 'https://www.infosys.com',
    technologies: ['Java', 'Python', 'Cloud', 'AI/ML', 'Blockchain', 'DevOps'],
    hiringLocations: ['Mumbai', 'Pune', 'Bangalore', 'Chennai', 'Hyderabad'],
    internshipPrograms: true,
    campusRecruitment: true
  },
  {
    name: 'Wipro Limited',
    shortName: 'Wipro',
    sector: 'IT Services',
    headquarters: 'Bangalore, Karnataka',
    founded: 1945,
    employees: 250000,
    revenue: 10500000000,
    website: 'https://www.wipro.com',
    technologies: ['Java', 'Python', 'Cloud', 'AI/ML', 'Cybersecurity', 'DevOps'],
    hiringLocations: ['Mumbai', 'Pune', 'Bangalore', 'Chennai', 'Hyderabad'],
    internshipPrograms: true,
    campusRecruitment: true
  },
  {
    name: 'HDFC Bank',
    shortName: 'HDFC',
    sector: 'FinTech/Banking',
    headquarters: 'Mumbai, Maharashtra',
    founded: 1994,
    employees: 150000,
    revenue: 12000000000,
    website: 'https://www.hdfcbank.com',
    technologies: ['Java', 'Python', 'React', 'Microservices', 'Cloud', 'AI/ML'],
    hiringLocations: ['Mumbai', 'Pune', 'Bangalore', 'Chennai'],
    internshipPrograms: true,
    campusRecruitment: true
  },
  {
    name: 'Zerodha',
    shortName: 'Zerodha',
    sector: 'FinTech',
    headquarters: 'Bangalore, Karnataka',
    founded: 2010,
    employees: 1500,
    revenue: 500000000,
    website: 'https://zerodha.com',
    technologies: ['Python', 'JavaScript', 'React', 'Go', 'PostgreSQL', 'Redis'],
    hiringLocations: ['Bangalore', 'Mumbai'],
    internshipPrograms: true,
    campusRecruitment: false
  }
];

const realOrganizers = [
  {
    name: 'Google Developer Groups Mumbai',
    shortName: 'GDG Mumbai',
    type: 'Developer Community',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    founded: 2008,
    website: 'https://gdgmumbai.com',
    focusAreas: ['Android', 'Web Technologies', 'Cloud', 'AI/ML'],
    eventTypes: ['Hackathons', 'Workshops', 'DevFests', 'Study Jams'],
    memberCount: 15000,
    eventsPerYear: 24
  },
  {
    name: 'Mumbai University IEEE Student Branch',
    shortName: 'MU IEEE',
    type: 'Technical Society',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    founded: 1995,
    website: 'https://ieee.mu.ac.in',
    focusAreas: ['Electronics', 'Computing', 'Robotics', 'IoT'],
    eventTypes: ['Technical Competitions', 'Workshops', 'Conferences'],
    memberCount: 5000,
    eventsPerYear: 18
  },
  {
    name: 'NASSCOM Mumbai',
    shortName: 'NASSCOM',
    type: 'Industry Association',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    founded: 1988,
    website: 'https://nasscom.in',
    focusAreas: ['IT Industry', 'Software Development', 'Digital Transformation'],
    eventTypes: ['Industry Conferences', 'Networking Events', 'Skill Development'],
    memberCount: 500,
    eventsPerYear: 12
  },
  {
    name: 'HackerEarth',
    shortName: 'HackerEarth',
    type: 'Tech Platform',
    location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
    founded: 2012,
    website: 'https://hackerearth.com',
    focusAreas: ['Programming', 'Competitive Coding', 'Hiring'],
    eventTypes: ['Online Hackathons', 'Coding Challenges', 'Hiring Challenges'],
    memberCount: 8000000,
    eventsPerYear: 150
  },
  {
    name: 'DevFest Mumbai',
    shortName: 'DevFest',
    type: 'Developer Conference',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    founded: 2013,
    website: 'https://devfest.gdgmumbai.com',
    focusAreas: ['Web Development', 'Mobile Development', 'Cloud', 'AI/ML'],
    eventTypes: ['Annual Conference', 'Workshops', 'Hackathons'],
    memberCount: 2000,
    eventsPerYear: 1
  }
];

const realEvents = [
  {
    title: 'Smart India Hackathon 2025',
    organizer: 'Ministry of Education, Government of India',
    category: 'hackathon',
    type: 'hybrid',
    location: {
      venue: 'IIT Bombay',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India'
    },
    dates: {
      registrationStart: new Date('2024-11-01'),
      registrationEnd: new Date('2024-12-15'),
      eventStart: new Date('2025-02-28'),
      eventEnd: new Date('2025-03-01')
    },
    description: 'India\'s biggest hackathon for students to solve real-world problems',
    prizes: {
      total: 500000,
      currency: 'INR',
      first: 100000,
      second: 75000,
      third: 50000
    },
    eligibility: ['undergraduate', 'postgraduate'],
    teamSize: { min: 4, max: 6 },
    technologies: ['Any Programming Language', 'Web Development', 'Mobile Development', 'AI/ML'],
    website: 'https://sih.gov.in',
    difficulty: 'intermediate',
    participantCount: 10000,
    isActive: true
  },
  {
    title: 'TCS CodeVita 2025',
    organizer: 'Tata Consultancy Services',
    category: 'hackathon',
    type: 'online',
    location: {
      venue: 'Online',
      city: 'Multiple Cities',
      state: 'Pan India',
      country: 'India'
    },
    dates: {
      registrationStart: new Date('2024-10-01'),
      registrationEnd: new Date('2024-11-30'),
      eventStart: new Date('2024-12-15'),
      eventEnd: new Date('2024-12-15')
    },
    description: 'Premier global programming contest by TCS',
    prizes: {
      total: 1000000,
      currency: 'INR',
      first: 250000,
      second: 150000,
      third: 100000
    },
    eligibility: ['undergraduate', 'postgraduate'],
    teamSize: { min: 1, max: 1 },
    technologies: ['C', 'C++', 'Java', 'Python', 'JavaScript'],
    website: 'https://codevita.tcs.com',
    difficulty: 'advanced',
    participantCount: 300000,
    isActive: true
  },
  {
    title: 'HDFC Bank Tech Challenge 2025',
    organizer: 'HDFC Bank',
    category: 'hackathon',
    type: 'online',
    location: {
      venue: 'Online + Mumbai Finals',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India'
    },
    dates: {
      registrationStart: new Date('2024-11-15'),
      registrationEnd: new Date('2025-01-15'),
      eventStart: new Date('2025-02-01'),
      eventEnd: new Date('2025-02-02')
    },
    description: 'FinTech innovation challenge for building next-gen banking solutions',
    prizes: {
      total: 750000,
      currency: 'INR',
      first: 200000,
      second: 150000,
      third: 100000
    },
    eligibility: ['undergraduate', 'postgraduate', 'working_professional'],
    teamSize: { min: 2, max: 4 },
    technologies: ['React', 'Node.js', 'Python', 'Java', 'Blockchain', 'AI/ML'],
    website: 'https://hdfcbank.com/techchallenge',
    difficulty: 'intermediate',
    participantCount: 5000,
    isActive: true
  }
];

// Database connection and seeding
async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://krishamehtakm16:krisha2004@cluster0.gxbzg.mongodb.net/hacktrack?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      ssl: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });

    console.log('✅ Connected to MongoDB successfully!');

    // Define schemas
    const collegeSchema = new mongoose.Schema({
      name: String,
      shortName: String,
      location: {
        city: String,
        state: String,
        country: String
      },
      type: String,
      established: Number,
      ranking: {
        nirf: Number,
        qs: Number
      },
      website: String,
      programs: [String],
      placementRate: Number,
      averagePackage: Number,
      createdAt: { type: Date, default: Date.now }
    });

    const companySchema = new mongoose.Schema({
      name: String,
      shortName: String,
      sector: String,
      headquarters: String,
      founded: Number,
      employees: Number,
      revenue: Number,
      website: String,
      technologies: [String],
      hiringLocations: [String],
      internshipPrograms: Boolean,
      campusRecruitment: Boolean,
      createdAt: { type: Date, default: Date.now }
    });

    const organizerSchema = new mongoose.Schema({
      name: String,
      shortName: String,
      type: String,
      location: {
        city: String,
        state: String,
        country: String
      },
      founded: Number,
      website: String,
      focusAreas: [String],
      eventTypes: [String],
      memberCount: Number,
      eventsPerYear: Number,
      createdAt: { type: Date, default: Date.now }
    });

    const eventSchema = new mongoose.Schema({
      title: String,
      organizer: String,
      category: String,
      type: String,
      location: {
        venue: String,
        city: String,
        state: String,
        country: String
      },
      dates: {
        registrationStart: Date,
        registrationEnd: Date,
        eventStart: Date,
        eventEnd: Date
      },
      description: String,
      prizes: {
        total: Number,
        currency: String,
        first: Number,
        second: Number,
        third: Number
      },
      eligibility: [String],
      teamSize: {
        min: Number,
        max: Number
      },
      technologies: [String],
      website: String,
      difficulty: String,
      participantCount: Number,
      isActive: Boolean,
      createdAt: { type: Date, default: Date.now }
    });

    // Create models
    const College = mongoose.model('College', collegeSchema);
    const Company = mongoose.model('Company', companySchema);
    const Organizer = mongoose.model('Organizer', organizerSchema);
    const Event = mongoose.model('Event', eventSchema);

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await College.deleteMany({});
    await Company.deleteMany({});
    await Organizer.deleteMany({});
    await Event.deleteMany({});

    // Insert real data
    console.log('📚 Inserting colleges data...');
    await College.insertMany(realColleges);
    console.log(`✅ Inserted ${realColleges.length} colleges`);

    console.log('🏢 Inserting companies data...');
    await Company.insertMany(realCompanies);
    console.log(`✅ Inserted ${realCompanies.length} companies`);

    console.log('🎯 Inserting organizers data...');
    await Organizer.insertMany(realOrganizers);
    console.log(`✅ Inserted ${realOrganizers.length} organizers`);

    console.log('📅 Inserting events data...');
    await Event.insertMany(realEvents);
    console.log(`✅ Inserted ${realEvents.length} events`);

    console.log('🎉 Database seeding completed successfully!');
    
    // Display summary
    console.log('\n📊 Data Summary:');
    console.log(`- ${realColleges.length} Colleges (IIT Bombay, VJTI, SPIT, etc.)`);
    console.log(`- ${realCompanies.length} Companies (TCS, Jio, Infosys, etc.)`);
    console.log(`- ${realOrganizers.length} Organizers (GDG Mumbai, IEEE, etc.)`);
    console.log(`- ${realEvents.length} Events (SIH, CodeVita, HDFC Challenge)`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { realColleges, realCompanies, realOrganizers, realEvents };
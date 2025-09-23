// MongoDB Playground for HackTrack Mumbai
// Use this script to test and interact with your MongoDB database

// Switch to HackTrack database
use('hacktrack-mumbai');

// Test 1: Show all collections
console.log('=== Collections in HackTrack Database ===');
db.runCommand("listCollections").cursor.firstBatch.forEach(
  function(collection) {
    print('Collection: ' + collection.name);
  }
);

// Test 2: Create sample user (if not exists)
console.log('\n=== Creating Sample User ===');
const sampleUser = {
  name: "Test User",
  email: "test@hacktrack.mumbai",
  password: "$2a$12$example.hashed.password",
  location: {
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400001"
  },
  education: {
    university: "IIT Bombay",
    degree: "B.Tech",
    branch: "Computer Science",
    year: 3,
    graduationYear: 2026
  },
  skills: ["JavaScript", "React", "Node.js", "MongoDB"],
  interests: ["FinTech", "AI/ML", "Web Development"],
  stats: {
    eventsAttended: 0,
    hackathonsParticipated: 0,
    hackathonsWon: 0,
    internshipsCompleted: 0,
    projectsCompleted: 0,
    connectionsBuilt: 0
  },
  preferences: {
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    privacy: {
      profileVisible: true,
      contactVisible: false,
      achievementsVisible: true
    }
  },
  isEmailVerified: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Check if user already exists
const existingUser = db.users.findOne({ email: "test@hacktrack.mumbai" });
if (!existingUser) {
  const result = db.users.insertOne(sampleUser);
  print('Sample user created with ID: ' + result.insertedId);
} else {
  print('Sample user already exists');
}

// Test 3: Count users by university
console.log('\n=== Users by University ===');
db.users.aggregate([
  {
    $group: {
      _id: "$education.university",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
]).forEach(function(doc) {
  print(doc._id + ": " + doc.count + " users");
});

// Test 4: Users in Mumbai
console.log('\n=== Mumbai Users ===');
const mumbaiUsers = db.users.countDocuments({
  "location.city": { $regex: "Mumbai", $options: "i" }
});
print('Total users in Mumbai: ' + mumbaiUsers);

// Test 5: Most popular skills
console.log('\n=== Popular Skills ===');
db.users.aggregate([
  { $unwind: "$skills" },
  {
    $group: {
      _id: "$skills",
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } },
  { $limit: 10 }
]).forEach(function(doc) {
  print(doc._id + ": " + doc.count + " users");
});

// Test 6: Create indexes for better performance
console.log('\n=== Creating Database Indexes ===');
try {
  db.users.createIndex({ "email": 1 }, { unique: true });
  print('✅ Email index created');
  
  db.users.createIndex({ "location.city": 1, "location.state": 1 });
  print('✅ Location index created');
  
  db.users.createIndex({ "education.university": 1 });
  print('✅ University index created');
  
  db.users.createIndex({ "skills": 1 });
  print('✅ Skills index created');
  
  db.users.createIndex({ "createdAt": -1 });
  print('✅ CreatedAt index created');
  
} catch (error) {
  print('Index creation error: ' + error.message);
}

// Test 7: Database statistics
console.log('\n=== Database Statistics ===');
const stats = db.runCommand({ dbStats: 1 });
print('Database: ' + stats.db);
print('Collections: ' + stats.collections);
print('Data Size: ' + (stats.dataSize / 1024 / 1024).toFixed(2) + ' MB');
print('Storage Size: ' + (stats.storageSize / 1024 / 1024).toFixed(2) + ' MB');

// Test 8: Sample queries for the application
console.log('\n=== Sample Application Queries ===');

// Find users by skills
print('Users with JavaScript skill:');
db.users.find(
  { skills: "JavaScript" },
  { name: 1, email: 1, "education.university": 1 }
).limit(3).forEach(function(user) {
  print('  - ' + user.name + ' (' + user.education.university + ')');
});

// Find users by location and university
print('\nIIT Bombay users in Mumbai:');
db.users.find(
  { 
    "location.city": "Mumbai",
    "education.university": "IIT Bombay"
  },
  { name: 1, email: 1, "education.year": 1 }
).forEach(function(user) {
  print('  - ' + user.name + ' (Year ' + user.education.year + ')');
});

console.log('\n=== MongoDB Setup Complete ===');
print('Your HackTrack Mumbai database is ready to use!');
print('');
print('Connection String: mongodb://localhost:27017/hacktrack-mumbai');
print('Database Name: hacktrack-mumbai');
print('');
print('To connect from your application, use the connection string in your .env file:');
print('MONGODB_URI=mongodb://localhost:27017/hacktrack-mumbai');
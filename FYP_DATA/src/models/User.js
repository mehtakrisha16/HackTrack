const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: function() {
      return !this.phone && !this.googleId; // Email not required if using phone or Google auth
    },
    unique: true,
    sparse: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.phone; // Password not required if using Google or phone auth
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // Authentication methods
  authMethod: {
    type: String,
    enum: ['email', 'google', 'otp'],
    default: 'email'
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Google OAuth
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allow null values but enforce uniqueness when present
  },
  
  profilePicture: {
    type: String,
    default: null
  },
  
  // User role and permissions
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  permissions: {
    type: [String],
    default: []
  },
  
  // Profile information
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  
  // Location information
  location: {
    city: {
      type: String,
      default: null
    },
    state: {
      type: String,
      default: null
    },
    country: {
      type: String,
      default: 'India'
    },
    pincode: {
      type: String,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
    }
  },
  
  // Education information
  education: {
    university: {
      type: String,
      enum: [
        // Top IITs
        'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
        'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad', 'IIT Indore', 'IIT BHU',
        // Top NITs
        'NIT Trichy', 'NIT Surathkal', 'NIT Warangal', 'NIT Calicut', 'NIT Rourkela',
        // Top Universities
        'Delhi University', 'Mumbai University', 'Pune University', 'Anna University',
        'Bangalore University', 'Jadavpur University', 'Calcutta University',
        // Top Private Colleges
        'BITS Pilani', 'VIT Vellore', 'Manipal Institute', 'SRM University',
        'Amity University', 'LPU', 'Thapar University',
        'Other'
      ]
    },
    degree: {
      type: String,
      enum: [
        'B.Tech',
        'B.E.',
        'B.Sc',
        'BCA',
        'M.Tech',
        'M.E.',
        'M.Sc',
        'MCA',
        'MBA',
        'Other'
      ]
    },
    branch: {
      type: String,
      enum: [
        'Computer Science',
        'Information Technology',
        'Electronics',
        'Mechanical',
        'Civil',
        'Chemical',
        'Electrical',
        'Other'
      ]
    },
    year: {
      type: Number,
      min: [1, 'Year must be between 1 and 4'],
      max: [4, 'Year must be between 1 and 4']
    },
    graduationYear: {
      type: Number,
      min: [2020, 'Graduation year must be 2020 or later'],
      max: [2030, 'Graduation year cannot exceed 2030']
    }
  },
  
  // Professional information
  skills: [{
    type: String,
    enum: [
      'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
      'Angular', 'Vue.js', 'Express.js', 'Django', 'Flask',
      'MongoDB', 'MySQL', 'PostgreSQL', 'Redis',
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
      'Machine Learning', 'Data Science', 'AI', 'Blockchain',
      'Mobile Development', 'iOS', 'Android', 'React Native',
      'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop',
      'DevOps', 'CI/CD', 'Git', 'GitHub', 'Linux',
      'IoT', 'Arduino', 'Embedded Systems', 'Hardware'
    ]
  }],
  
  interests: [{
    type: String,
    enum: [
      'FinTech', 'EdTech', 'HealthTech', 'E-commerce',
      'AI/ML', 'Blockchain', 'IoT', 'Cybersecurity',
      'Web Development', 'Mobile Development',
      'Data Science', 'Cloud Computing', 'DevOps',
      'Startup', 'Entrepreneurship', 'Product Management'
    ]
  }],
  
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
    location: String
  }],
  
  // Mumbai-specific achievements
  achievements: [{
    title: String,
    description: String,
    date: Date,
    category: {
      type: String,
      enum: ['hackathon', 'internship', 'project', 'certification', 'award', 'other']
    },
    organization: String,
    verificationUrl: String
  }],
  
  // Activity tracking
  stats: {
    eventsAttended: { type: Number, default: 0 },
    hackathonsParticipated: { type: Number, default: 0 },
    hackathonsWon: { type: Number, default: 0 },
    internshipsCompleted: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 },
    connectionsBuilt: { type: Number, default: 0 }
  },
  
  // Social links
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
    twitter: String,
    instagram: String
  },
  
  // Account settings
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    privacy: {
      profileVisible: { type: Boolean, default: true },
      contactVisible: { type: Boolean, default: false },
      achievementsVisible: { type: Boolean, default: true }
    }
  },
  
  // Account status
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  profileCompleted: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },
  
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Email verification
  emailVerificationToken: String,
  emailVerificationExpires: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'location.city': 1, 'location.state': 1 });
userSchema.index({ 'education.university': 1 });
userSchema.index({ skills: 1 });
userSchema.index({ interests: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullProfile').get(function() {
  return {
    name: this.name,
    email: this.email,
    location: this.location,
    education: this.education,
    skills: this.skills,
    interests: this.interests,
    stats: this.stats
  };
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  return userObject;
};

// Static method to find users by location
userSchema.statics.findByLocation = function(city, state = 'Maharashtra') {
  return this.find({
    'location.city': new RegExp(city, 'i'),
    'location.state': new RegExp(state, 'i'),
    isActive: true
  });
};

// Static method to find users by university
userSchema.statics.findByUniversity = function(university) {
  return this.find({
    'education.university': university,
    isActive: true
  });
};

// Static method to find users by skills
userSchema.statics.findBySkills = function(skills) {
  return this.find({
    skills: { $in: skills },
    isActive: true
  });
};

module.exports = mongoose.model('User', userSchema);
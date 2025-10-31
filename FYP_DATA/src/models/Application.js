const mongoose = require('mongoose');

/**
 * Application Model
 * Tracks all user applications to hackathons, internships, events
 */
const applicationSchema = new mongoose.Schema({
  // User who applied
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Opportunity details
  opportunityId: {
    type: String,
    required: true
  },
  
  opportunityType: {
    type: String,
    required: true,
    enum: ['hackathon', 'internship', 'event', 'job', 'fintech'],
    index: true
  },

  // Opportunity information (stored for historical tracking)
  title: {
    type: String,
    required: true
  },
  
  company: {
    type: String,
    required: true
  },

  location: {
    type: String
  },

  deadline: {
    type: Date
  },

  salary: {
    type: String
  },

  applicationLink: {
    type: String
  },

  // Application status
  status: {
    type: String,
    enum: ['applied', 'under_review', 'shortlisted', 'rejected', 'accepted', 'withdrawn'],
    default: 'applied',
    index: true
  },

  // Application metadata
  appliedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  },

  // External application tracking
  externalApplicationId: {
    type: String
  },

  // Notes
  notes: {
    type: String
  },

  // Status history
  statusHistory: [{
    status: String,
    updatedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }]

}, {
  timestamps: true
});

// Compound index for unique applications
applicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

// Index for querying user's applications
applicationSchema.index({ userId: 1, appliedAt: -1 });
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, opportunityType: 1 });

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.lastUpdated = new Date();
  this.statusHistory.push({
    status: newStatus,
    note,
    updatedAt: new Date()
  });
  return this.save();
};

// Static method to check if user has applied
applicationSchema.statics.hasUserApplied = async function(userId, opportunityId) {
  const application = await this.findOne({ userId, opportunityId });
  return !!application;
};

// Static method to get user's applications
applicationSchema.statics.getUserApplications = function(userId, filters = {}) {
  const query = { userId, ...filters };
  return this.find(query)
    .sort({ appliedAt: -1 })
    .lean();
};

// Static method to count user's applications
applicationSchema.statics.countUserApplications = function(userId, filters = {}) {
  const query = { userId, ...filters };
  return this.countDocuments(query);
};

module.exports = mongoose.model('Application', applicationSchema);

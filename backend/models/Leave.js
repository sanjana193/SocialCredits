const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    required: true
  },
  department: {
    type: String
  },
  year: {
    type: Number
  },
  reason: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Sick', 'Casual', 'Emergency', 'Other'],
    default: 'Other'
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Leave', leaveSchema);

const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  by_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  task: String,
  credits_used: Number,
  status: { 
    type: String, 
    enum: ['pending', 'fulfilled', 'approved', 'rejected'], 
    default: 'pending' 
  },
  fulfilled_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);

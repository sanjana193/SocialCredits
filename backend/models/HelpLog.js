const mongoose = require('mongoose');

const helpLogSchema = new mongoose.Schema({
  from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  task: String,
  hours: Number,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  timestamp: { type: Date, default: Date.now }
});


module.exports = mongoose.model('HelpLog', helpLogSchema);

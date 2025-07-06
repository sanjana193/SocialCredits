const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetAudience: { type: String, enum: ['all', 'students', 'faculty'], default: 'all' },
  department: { type: String },   // optional
  year: { type: Number },         // optional
  createdAt: { type: Date, default: Date.now },
  validTill: { type: Date }       // optional
});

module.exports = mongoose.model('Notice', noticeSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ['user', 'admin', 'faculty'], default: 'user' },
  credits: { type: Number, default: 0 },
  department: { 
    type: String, 
    enum: ['CSE', 'AIML', 'MECH'], 
    default: 'CSE' 
  },
  year: { type: Number, default: 1 }  // optional, e.g., 1st year, 2nd year
});

module.exports = mongoose.model('User', userSchema);

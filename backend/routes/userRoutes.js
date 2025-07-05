const express = require('express');
const router = express.Router();

const User = require('../models/User');
const HelpLog = require('../models/HelpLog');

// In routes/userRoutes.js
router.post('/register', async (req, res) => {
  const { name, email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.json({ message: 'User already exists', user });
    }

    user = await User.create({ name, email, credits: 50 });
    res.json({ message: 'User created with 50 credits', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In routes/userRoutes.js
router.post('/login', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leaderboard (top 10)
router.get('/leaderboard/top', async (req, res) => {
  try {
    const users = await User.find().sort({ credits: -1 }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

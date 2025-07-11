const express = require('express');
const router = express.Router();

const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  const { name, email, role, department, year } = req.body;

  if (!name || !email || !role || !department) {
    return res.status(400).json({ message: 'All fields are required (name, email, role, department)' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.json({ message: 'User already exists', user });
    }

    const newUser = {
      name,
      email,
      role,           // use the value sent by frontend
      department,
      credits: 50
    };

    if (role === 'user') {
      newUser.year = year || 1; // only save year for students
    }

    user = await User.create(newUser);

    res.json({ message: 'User created with 50 credits', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
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

// Leaderboard
router.get('/leaderboard/top', async (req, res) => {
  try {
    const users = await User.find().sort({ credits: -1 }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

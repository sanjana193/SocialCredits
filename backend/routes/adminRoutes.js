const express = require('express');
const router = express.Router();

const User = require('../models/User');
const HelpLog = require('../models/HelpLog');
const Request = require('../models/Request');

router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get('/logs', async (req, res) => {
  const logs = await HelpLog.find().populate('from_user to_user', 'name');
  res.json(logs);
});

router.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('by_user', 'name email')          // requester
      .populate('fulfilled_by', 'name email');   // fulfiller

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});


module.exports = router;

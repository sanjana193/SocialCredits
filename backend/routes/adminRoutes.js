const express = require('express');
const router = express.Router();

const User = require('../models/User');
const HelpLog = require('../models/HelpLog');
const Request = require('../models/Request');
const Leave = require('../models/Leave');
const Notice = require('../models/Notice');  // ✅ fixed here

// Get all users
router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get all help logs
router.get('/logs', async (req, res) => {
  const logs = await HelpLog.find().populate('from_user to_user', 'name');
  res.json(logs);
});

// Get all requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('by_user', 'name email')
      .populate('fulfilled_by', 'name email');
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Overview route
router.get('/overview', async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const helpLogsCount = await HelpLog.countDocuments();
    const requestsCount = await Request.countDocuments();
    const noticesCount = await Notice.countDocuments();
    const leavesCount = await Leave.countDocuments();

    res.json({
      tusers: usersCount,
      thelpLogs: helpLogsCount,
      trequests: requestsCount,
      tnotices: noticesCount,
      tleaves: leavesCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;

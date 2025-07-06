const express = require('express');
const router = express.Router();

const Attendance = require('../models/Attendance');

// 📅 Get attendance records of a student
router.get('/user/:userId', async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.userId });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

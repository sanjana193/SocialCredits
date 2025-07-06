const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Attendance = require('../models/Attendance'); // You’ll need to create this schema
const Assignment = require('../models/Assignment'); // You’ll need to create this schema

// Get students in a department
router.get('/students', async (req, res) => {
  const { department } = req.query;
  try {
    const students = await User.find({ role: 'user', department });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Attendance
router.post('/attendance/mark', async (req, res) => {
  const { student, faculty, subject, status, date } = req.body;
  try {
    const record = await Attendance.create({ student, faculty, subject, status, date });
    res.json({ message: 'Attendance marked', record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance for a student
router.get('/attendance/user/:id', async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.id }).populate('faculty', 'name');
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign a task
router.post('/assignment/create', async (req, res) => {
  const { student, faculty, task } = req.body;
  try {
    const assignment = await Assignment.create({ student, faculty, task, status: 'assigned' });
    res.json({ message: 'Assignment created', assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assignments for a student
router.get('/assignment/user/:id', async (req, res) => {
  try {
    const tasks = await Assignment.find({ student: req.params.id, status: 'assigned' }).populate('faculty', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student submits assignment
router.post('/assignment/submit/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, { status: 'submitted' }, { new: true });
    res.json({ message: 'Assignment submitted', assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Faculty sees submitted assignments
router.get('/assignment/submitted/:facultyId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ faculty: req.params.facultyId, status: 'submitted' })
      .populate('student', 'name');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

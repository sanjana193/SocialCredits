const express = require('express');
const router = express.Router();

const Assignment = require('../models/Assignment');

// 📝 Get assignments assigned to a student
router.get('/user/:userId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ student: req.params.userId, status: 'assigned' });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📄 Submit assignment
router.post('/submit/:assignmentId', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    assignment.status = 'submitted';
    await assignment.save();

    res.json({ message: 'Assignment submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

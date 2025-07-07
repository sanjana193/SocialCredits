const express = require('express');
const router = express.Router();

const Leave = require('../models/Leave');

router.post('/', async (req, res) => {
  const { userId, reason, type, fromDate, toDate } = req.body;

  console.log({ userId, reason, type, fromDate, toDate });

  if (!userId || !reason || !type || !fromDate || !toDate) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const leave = await Leave.create({
      user: userId,
      role:'faculty',
      reason,
      type,
      fromDate,
      toDate
    });
    res.status(201).json({ message: 'Leave request submitted', leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/', async (req, res) => {
  const { userId } = req.query;

  try {
    const leaves = await Leave.find({ user: userId }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/:action', async (req, res) => {
  const { id, action } = req.params;
  const { adminId } = req.body;

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }

  if (!adminId) {
    return res.status(400).json({ message: 'Missing adminId' });
  }

  const status = action === 'approve' ? 'Approved' : 'Rejected';

  try {
    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      {
        status,
        reviewedBy: adminId,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    res.json({ message: `Leave ${status.toLowerCase()}`, leave: updatedLeave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

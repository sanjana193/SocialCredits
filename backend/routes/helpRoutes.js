const express = require('express');
const router = express.Router();
const HelpLog = require('../models/HelpLog');
const User = require('../models/User');

// Log help you provided
router.post('/log', async (req, res) => {
  const { from_user, to_user, task, hours } = req.body;

  const log = new HelpLog({
    from_user,
    to_user,
    task,
    hours,
    status: 'pending'
  });

  await log.save();

  res.json({ message: 'Help log created and pending approval', log });
});


// Get my help logs
router.get('/mylogs/:userId', async (req, res) => {
  const logs = await HelpLog.find({ 
      $or: [{ from_user: req.params.userId }, { to_user: req.params.userId }]
    })
    .populate('from_user', 'name')
    .populate('to_user', 'name');
  res.json(logs);
});

// Get pending approvals (claims of help *to you*)
router.get('/pendingApprovals/:userId', async (req, res) => {
  const logs = await HelpLog.find({ 
    to_user: req.params.userId, 
    status: 'pending' 
  })
  .populate('from_user', 'name')
  .populate('to_user', 'name');

  res.json(logs);
});


// Approve or reject help claimed to you
router.post('/approve/:logId', async (req, res) => {
  const { action } = req.body;
  const log = await HelpLog.findById(req.params.logId);

  if (!log) return res.status(404).json({ error: 'Log not found' });

  log.status = (action === 'approved' ? 'approved' : 'rejected');
  await log.save();

  if (log.status === 'approved') {
    const helper = await User.findById(log.from_user);
    helper.credits += log.hours * 10;
    await helper.save();
  }

  res.json({ message: `Log ${log.status}` });
});

module.exports = router;

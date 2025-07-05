const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const User = require('../models/User');
const HelpLog = require('../models/HelpLog');

// Get my requests
router.get('/myrequests/:userId', async (req, res) => {
  const requests = await Request.find({ by_user: req.params.userId })
    .populate('by_user', 'name')
    .populate('fulfilled_by', 'name');
  res.json(requests);
});

// Get general pending requests (from others)
router.get('/generalPending/:userId', async (req, res) => {
  const requests = await Request.find({ status: 'pending', by_user: { $ne: req.params.userId } })
    .populate('by_user', 'name');
  res.json(requests);
});

// Request help (general)
router.post('/redeem', async (req, res) => {
  const { by_user, task, credits_used } = req.body;
  const user = await User.findById(by_user);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.credits < credits_used) return res.status(400).json({ error: 'Not enough credits' });

  const reqDoc = await Request.create({ by_user, task, credits_used, status: 'pending' });
  res.json({ message: 'Request submitted', request: reqDoc });
});

// Fulfill someone else’s request
router.post('/fulfill', async (req, res) => {
  const { requestId, fulfillerId } = req.body;

  const request = await Request.findById(requestId).populate('by_user');
  const requester = await User.findById(request.by_user._id);
  const fulfiller = await User.findById(fulfillerId);

  if (!request || request.status !== 'pending')
    return res.status(400).json({ error: 'Invalid request' });
  if (requester.credits < request.credits_used)
    return res.status(400).json({ error: 'Requester lacks credits' });

  requester.credits -= request.credits_used;
  fulfiller.credits += request.credits_used;

  request.status = 'fulfilled';
  request.fulfilled_by = fulfiller._id;

  await requester.save();
  await fulfiller.save();
  await request.save();

  await HelpLog.create({
    from_user: fulfiller._id,
    to_user: requester._id,
    task: request.task,
    hours: 1,
    status: 'approved'
  });

  res.json({ message: 'Request fulfilled', request });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notice = require('../models/Notice');

// POST /api/notices → create a notice
router.post('/', async (req, res) => {
  const { title, content, targetAudience, department, year, validTill } = req.body;

  try {
    // 🔎 find the admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(400).json({ error: 'Admin user not found' });
    }

    console.log(`📄 Creating notice by admin: ${admin._id}`);

    const notice = await Notice.create({
      title,
      content,
      createdBy: admin._id,
      targetAudience: targetAudience || 'all',
      department,
      year,
      validTill
    });

    res.status(201).json({ message: 'Notice created', notice });
  } catch (err) {
    console.error(`❌ Error saving notice:`, err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notices/all
router.get('/all', async (req, res) => {
  try {
    const notices = await Notice.find({}).sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notices → get notices for a user
// GET /api/notices
// GET /api/notices → targeted + valid notices for users/faculty
router.get('/', async (req, res) => {
  const { role, department, year } = req.query;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // set time to midnight for correct comparison

    const query = {
      $and: [
        { validTill: { $gte: today } }, // only valid notices
        {
          $or: [
            { targetAudience: 'all' },
            ...(role ? [{ targetAudience: role }] : []),
            ...(department ? [{ department }] : []),
            ...(year ? [{ year: parseInt(year) }] : [])
          ]
        }
      ]
    };

    const notices = await Notice.find(query).sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;

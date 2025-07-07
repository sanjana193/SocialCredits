const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helpRoutes = require('./routes/helpRoutes');
const requestRoutes = require('./routes/requestRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/timebank', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

app.get('/', (req, res) => {
  res.send('Time Banking ERP backend is running 🚀');
});
app.use('/api/help', helpRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/leave', leaveRoutes);

app.listen(3000, () => {
  console.log("🎯 Server started on http://localhost:3000");
});

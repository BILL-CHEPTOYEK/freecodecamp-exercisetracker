const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Create new user
router.post('/users', async (req, res) => {
  const user = new User({ username: req.body.username });
  try {
    const savedUser = await user.save();
    res.json({ username: savedUser.username, _id: savedUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  const users = await User.find({}, 'username _id');
  res.json(users);
});

// Add exercise to user
router.post('/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const exerciseDate = date ? new Date(date) : new Date();

  try {
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.log.push({
      description,
      duration: parseInt(duration),
      date: exerciseDate
    });

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      description,
      duration: parseInt(duration),
      date: exerciseDate.toDateString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user logs
router.get('/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let logs = user.log;

    if (from) {
      const fromDate = new Date(from);
      logs = logs.filter(ex => ex.date >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      logs = logs.filter(ex => ex.date <= toDate);
    }

    if (limit) {
      logs = logs.slice(0, parseInt(limit));
    }

    res.json({
      _id: user._id,
      username: user.username,
      count: logs.length,
      log: logs.map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString()
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

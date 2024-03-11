const express = require('express');
const router = express.Router();
const User = require('../models/User');
const adminMiddleware = require('../middleware/adminAuth');


// Activate user account
router.put('/user/:id/activate', adminMiddleware, async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findByIdAndUpdate(userId, { isActive: true });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User activated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

// Deactivate user account
router.put('/user/:id/deactivate', adminMiddleware, async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findByIdAndUpdate(userId, { isActive: false });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

// Delete user account
router.delete('/user/:id', adminMiddleware, async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findByIdAndDelete(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

// Update user account
router.put('/user/:id', adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, password, isAdmin, isActive } = req.body;
    const updates = {};
    if (username) updates.username = username;
    if (password) updates.password = password;
    if (isAdmin !== undefined) updates.isAdmin = isAdmin;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// Get all users
router.get('/user', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;




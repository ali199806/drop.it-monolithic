const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Storage = require('../models/Storage')
const adminMiddleware = require('../middleware/adminAuth');
const path = require('path');
const fs = require('fs');

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
router.delete('/user/:id/:storageId', adminMiddleware, async (req, res) => {
    try {
      const userId = req.params.id;
      const storageId = req.params.storageId;
      const user = await User.findByIdAndDelete(userId);
      const storage = await Storage.findByIdAndDelete(storageId);
      if (!user || !storage) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User deleted successfully' });
      const fullPath = path.join(config.basePath, userId);
      await fs.promises.rmdir(fullPath, { recursive: true }); // Delete the folder recursively
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

// Update user account
router.put('/user/:id', adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, totalStorage } = req.body;
    var user;
    if (username === "") {
      // Donot Update user
    }
    else {
      user = await User.findByIdAndUpdate(userId, { username }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    }
    

    // Update storage info
    const storage = await Storage.findOne({ userId: userId });
    if (!storage) return res.status(404).json({ message: 'Storage info not found' });

    storage.totalStorage = totalStorage;
    await storage.save();

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ messagecM: 'Server Error' });M
  }
});

// Get all users
// router.get('/user', adminMiddleware, async (req, res) => {
//   try {
//     const users = await User.find(); // Fetch all users
//     res.json(users);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// Fetch user information along with storage usage and limit
router.get('/user', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10; // Default page size
    const skip = (page - 1) * pageSize;
    const users = await Storage.find().populate('userId')
    .skip(skip)
    .limit(pageSize);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
module.exports = router;




const express = require('express');
const router = express.Router();
const Storage = require('../models/Storage');

// Allocate storage to a new user
router.post('/allocate', async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if storage already allocated for the user
    const existingStorage = await Storage.findOne({ userId });
    if (existingStorage) {
      return res.status(400).json({ message: 'Storage already allocated for the user' });
    }

    // Allocate storage
    const storage = new Storage({ userId });
    await storage.save();

    res.status(201).json({ message: 'Storage allocated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get storage usage for a user
router.get('/:userId/usage', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Retrieve storage usage for the user
      const storage = await Storage.findOne({ userId });
      if (!storage) {
        return res.status(404).json({ message: 'Storage not found for the user' });
      }
  
      res.json({ usedStorage: storage.usedStorage, totalStorage: storage.totalStorage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  


module.exports = router;
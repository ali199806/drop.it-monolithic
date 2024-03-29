const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const fs = require('fs').promises;
const path = require('path');

const User = require('../models/User');
const Storage = require('../models/Storage');

const jwtMiddleware = require('../middleware/auth')

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Create a new user
    user = new User({ username, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();
    const userId = user._id
    const existingStorage = await Storage.findOne({ userId });
    if (existingStorage) {
      return res.status(400).json({ message: 'Storage already allocated for the user' });
    }

    // Allocate storage
    const storage = new Storage({ userId });
    await storage.save();


    // Directory for user files/
    const userDirectory = path.join(config.basePath, user._id.toString());

    // Create a directory for the user
    await fs.mkdir(userDirectory, { recursive: true });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if user is active
    if (!user.isActive) return res.status(401).json({ message: 'User account is inactive' });

    // Create JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' }, (error, token) => {
      if (error) throw error;
      res.json({ token, userId: user._id} );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



// Login user
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if user is active
    if (!user.isActive) return res.status(401).json({ message: 'User account is inactive' });
    
    // Check if user is admin
    if (!user.isAdmin) return res.status(401).json({ message: 'This is not an Admin account' });

    // Create JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' }, (error, token) => {
      if (error) throw error;
      res.json({ token, userId: user._id} );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



module.exports = router;

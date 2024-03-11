const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const multer = require('multer');
const Storage = require('../models/Storage');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if token exists
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Check if user exists
    const user = await User.findById(decoded.user.id);
    if (!user) return res.status(401).json({ message: 'Token is not valid' });

    // Check if user is active
    if (!user.isActive) return res.status(401).json({ message: 'User account is inactive' });

    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
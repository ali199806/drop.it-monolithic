// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storageRoutes = require('./routes/storageRoutes');
const path = require('path');

const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Body parser middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(error => console.error(error));

// Serve static files from the React build folder
app.use(express.static(path.join('/usr/src/app/', 'frontend/build')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/storage', storageRoutes);

// For all other requests, serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join('/usr/src/app/', 'frontend/build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

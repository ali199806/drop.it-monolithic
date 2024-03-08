// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Body parser middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(error => console.error(error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Start server
const PORT = process.env.PORT || 4005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

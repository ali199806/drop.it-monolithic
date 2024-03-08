const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');

const storageRoutes = require('./routes/storageRoutes');

const app = express();

// Connect to MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(error => console.error(error));

// Middleware
app.use(express.json());

// Routes
app.use('/api/storage', storageRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const router = express.Router();
const Storage = require('../models/Storage');
const User = require('../models/User');
const jwtMiddleware = require('../middleware/auth')
const fs = require('fs');
const config = require('../config/config');
const multer = require('multer');
const path = require('path');

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
router.get('/usage', jwtMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
  
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
  

router.get('/browse', jwtMiddleware, async (req, res) => {
    const userId = req.user.id;
    const path = req.query.path || ''; // Get the relative path from query parameters
  
    try {
      const userFolderPath = `${config.basePath}/${userId}/${path}`;
      const items = await fs.promises.readdir(userFolderPath, { withFileTypes: true });
      
      const response = items.map(item => ({
        name: item.name,
        type: item.isDirectory() ? 'folder' : 'file',
      }));
  
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error accessing directory.');
    }
  });

router.post('/create-folder', jwtMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { path, folderName } = req.body;
  
    try {
      if (!folderName || folderName=="") {
        console.error('No folderName provided')
        res.send('No folderName provided');
      }
      else {
        if (!path || path=="") {
          const fullPath = `${config.basePath}/${userId}/${folderName}`;
          await fs.promises.mkdir(fullPath, { recursive: true });
          res.send('Folder created successfully.');
        }
        else {
          const fullPath = `${config.basePath}/${userId}/${path}/${folderName}`;
          await fs.promises.mkdir(fullPath, { recursive: true });
          res.send('Folder created successfully.');
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to create folder.');
    }
  });

  
// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const storagePath = req.header('path');

    // Get the user's ID from the request object
    const userId = req.user.id; 
    // Construct the path to the user's directory
    const userDirectory = path.join(config.basePath, userId.toString(), storagePath || '');
    console.log(`Request Path: ${storagePath}`);

    cb(null, userDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename
  }
});

// Create multer instance with configured storage
const upload = multer({ storage });

// File upload route using Multer middleware
router.post('/upload', jwtMiddleware, async (req, res, next) => {
  const userId = req.user.id;
  const file = req.file; 
  //const fileSize = 13000; // Size of the uploaded file

  try {
    // Fetch user's storage information
    const userStorage = await Storage.findOne({ userId });
    if (!userStorage) {
      return res.status(404).json({ error: 'User storage information not found' });
    }

    // Check if storage usage exceeds threshold
    const threshold = 10000000; // Threshold: 10 MB
    if (userStorage.usedStorage  > threshold) {
      return res.status(400).json({ error: 'Storage limit exceeded. Cannot upload File' });
    }

    next(); // Proceed to multer middleware if checks pass
  } catch (error) {
    console.error('Error checking storage:', error);
    res.status(500).json({ error: 'Failed to check storage' });
  }
}, upload.single('file'), async (req, res) => {
  const userId = req.user.id;
  const file = req.file;
  const fileSize = file.size; // Size of the uploaded file

  try {
    // Update user's storage usage in the database
    const userStorage = await Storage.findOne({ userId });
    userStorage.usedStorage += fileSize;
    await userStorage.save();
    
    if (userStorage.usedStorage + fileSize > threshold) {
      return res.status(400).json({ error: 'Storage limit exceeded. File Uploaded.' });
    }

    res.json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.get('/download', jwtMiddleware, (req, res) => {
  const userId = req.user.id;
  // Get the path parameter from the request query
  const filePath = req.query.path;

  // Construct the absolute path to the file
  const absolutePath = path.join(config.basePath, userId, filePath);

  // Check if the file exists
  fs.access(absolutePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${absolutePath}`);
      res.status(404).send('File not found');
    } else {
      // Set the Content-Disposition header to attachment to prompt a file download
      res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(absolutePath));

      // Create a read stream for the file and pipe it to the response
      const fileStream = fs.createReadStream(absolutePath);
      fileStream.pipe(res);
    }
  });
});

// Endpoint to fetch detailed info about a file or folder
router.get('/info', jwtMiddleware, async (req, res) => {
  const userId = req.user.id;
  const itemPath = req.query.path; 

  if (!itemPath) {
    return res.status(400).send('Path is required');
  }

  try {
    // Construct the full path to the item
    const fullPath = path.join(config.basePath, userId, itemPath);
    console.log(`Info Path: ${fullPath}`)
    const stats = await fs.promises.stat(fullPath);
    console.log(`isDirectory: ${stats.isDirectory() }`)
    console.log(`Size: ${stats.size }`)

    const response = {
      name: path.basename(itemPath),
      type: stats.isDirectory() ? 'folder' : 'file',
      size: stats.size,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
      owner: userId,
    };


    res.json(response);
  } catch (error) {
    console.error(error);
    if (error.code === 'ENOENT') {
      res.status(404).send('Item not found');
    } else {
      res.status(500).send('Error retrieving item info');
    }
  }
});


router.delete('/delete', jwtMiddleware, async (req, res) => {
  const userId = req.user.id;
  const itemPath = req.query.path; 
  const itemType = req.query.type; 
  const itemSize = req.query.size


  if (!itemPath || !itemType) {
    return res.status(400).send('Path and type are required');
  }

  try {
    const fullPath = path.join(config.basePath, userId, itemPath);
    if (itemType === 'file') {
      await fs.promises.unlink(fullPath); // Delete the file
    } else if (itemType === 'folder') {
      await fs.promises.rmdir(fullPath, { recursive: true }); // Delete the folder recursively
    } else {
      return res.status(400).send('Invalid item type');
    }
    // Update user's storage usage in the database
    const storage = await Storage.findOne({userId});
    storage.usedStorage -= itemSize;
    await storage.save();

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    if (error.code === 'ENOENT') {
      res.status(404).send('Item not found');
    } else {
      res.status(500).send('Error deleting item');
    }
  }
});


module.exports = router;
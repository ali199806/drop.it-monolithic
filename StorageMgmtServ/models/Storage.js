
const mongoose = require('mongoose');

const storageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalStorage: { type: Number, default: 10 }, // in MB
  usedStorage: { type: Number, default: 0 }, // in MB
});

// Method to update storage usage
storageSchema.methods.updateUsage = function(fileSize) {
    this.usedStorage += fileSize;
    return this.save();
  };

module.exports = mongoose.model('Storage', storageSchema);
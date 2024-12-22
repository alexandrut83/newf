const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['crypto', 'currency', 'stock', 'other']
  },
  symbol: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  manualValue: {
    type: Number,
    default: 0
  },
  marketValue: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate total value
assetSchema.methods.getTotalValue = function() {
  return this.type === 'other' ? this.manualValue : this.marketValue * this.quantity;
};

module.exports = mongoose.model('Asset', assetSchema);

const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const auth = require('../middleware/auth');
const { fetchCryptoPrice, fetchForexPrice } = require('../utils/marketData');

// Get all assets for a user
router.get('/', auth, async (req, res) => {
  try {
    const assets = await Asset.find({ user: req.user.id });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new asset
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, symbol, quantity, manualValue } = req.body;
    const asset = new Asset({
      name,
      type,
      symbol,
      quantity,
      manualValue,
      user: req.user.id
    });

    if (type === 'crypto') {
      asset.marketValue = await fetchCryptoPrice(symbol);
    } else if (type === 'currency') {
      asset.marketValue = await fetchForexPrice(symbol);
    }

    await asset.save();
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update asset
router.put('/:id', auth, async (req, res) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, user: req.user.id });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    Object.keys(req.body).forEach(key => {
      if (key !== 'user') asset[key] = req.body[key];
    });

    if (asset.type === 'crypto') {
      asset.marketValue = await fetchCryptoPrice(asset.symbol);
    } else if (asset.type === 'currency') {
      asset.marketValue = await fetchForexPrice(asset.symbol);
    }

    await asset.save();
    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete asset
router.delete('/:id', auth, async (req, res) => {
  try {
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update market values for all assets
router.post('/update-market-values', auth, async (req, res) => {
  try {
    const assets = await Asset.find({ user: req.user.id });
    const updates = await Promise.all(assets.map(async (asset) => {
      if (asset.type === 'crypto') {
        asset.marketValue = await fetchCryptoPrice(asset.symbol);
      } else if (asset.type === 'currency') {
        asset.marketValue = await fetchForexPrice(asset.symbol);
      }
      return asset.save();
    }));
    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

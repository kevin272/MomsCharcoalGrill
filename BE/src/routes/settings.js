const express = require('express');
const Setting = require('../models/Setting');
const router = express.Router();

// List all
router.get('/', async (req, res) => {
  try {
    const items = await Setting.find().sort({ key: 1 });
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Get by key
router.get('/:key', async (req, res) => {
  try {
    const item = await Setting.findOne({ key: req.params.key });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Upsert by key
router.put('/:key', async (req, res) => {
  try {
    const item = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { key: req.params.key, value: req.body.value },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Delete by key
router.delete('/:key', async (req, res) => {
  try {
    const item = await Setting.findOneAndDelete({ key: req.params.key });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;

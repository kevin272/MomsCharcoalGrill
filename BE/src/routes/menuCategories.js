const express = require('express');
const MenuCategory = require('../models/MenuCategory');
const router = express.Router();

// List
router.get('/', async (req, res) => {
  try {
    const list = await MenuCategory.find().sort({ order: 1, name: 1 });
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Get by id
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuCategory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const item = await MenuCategory.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const item = await MenuCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const item = await MenuCategory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;

const express = require('express');
const CateringOrder = require('../models/CateringOrder');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      CateringOrder.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      CateringOrder.countDocuments()
    ]);

    res.json({ success: true, data: items, page, total, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await CateringOrder.findById(req.params.id).populate('package');
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await CateringOrder.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await CateringOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await CateringOrder.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;

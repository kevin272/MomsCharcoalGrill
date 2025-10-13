const router = require('express').Router();
const HeroBanner = require('../models/banner'); // make sure this points to your model file (models/banner.js)

// Helpers
const parseBool = (v) =>
  typeof v === 'string' ? v.toLowerCase() === 'true' : !!v;

// ===== List (with optional filters) =====
router.get('/', async (req, res) => {
  try {
    const { q, isActive } = req.query;
    const filter = {};
    if (q) filter.$or = [
      { /* match primary item name when populated later */ },
    ];
    if (typeof isActive !== 'undefined') filter.isActive = parseBool(isActive);

    const data = await HeroBanner.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .populate('items primaryItem');

    // If q is provided, filter by populated names (simple client-side filter)
    const out = q
      ? data.filter(b =>
          (b.primaryItem?.name || '').toLowerCase().includes(q.toLowerCase()) ||
          (b.items || []).some(i => (i.name || '').toLowerCase().includes(q.toLowerCase()))
        )
      : data;

    res.json({ success: true, data: out });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ===== Public active (PLACE BEFORE "/:id") =====
router.get('/public/active/one', async (_req, res) => {
  try {
    const data = await HeroBanner.findOne({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .populate('items primaryItem');
    res.json({ success: true, data: data || null });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ===== One by id =====
router.get('/:id', async (req, res) => {
  try {
    const data = await HeroBanner.findById(req.params.id)
      .populate('items primaryItem');
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ===== Create =====
router.post('/', async (req, res) => {
  try {
    const doc = await HeroBanner.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// ===== Update =====
router.put('/:id', async (req, res) => {
  try {
    const doc = await HeroBanner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// ===== Delete =====
router.delete('/:id', async (req, res) => {
  try {
    await HeroBanner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;

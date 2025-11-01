const express = require('express');
const Sauce = require('../models/Sauce');
const { upload } = require('../middlewares/fileUpload');

const router = express.Router();

// list
router.get('/', async (_req, res) => {
  try {
    const list = await Sauce.find().sort({ order: 1, name: 1 });
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// get one
router.get('/:id', async (req, res) => {
  try {
    const item = await Sauce.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// create (multipart)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) {
      body.image = req.file.path;
    }
    const item = await Sauce.create(body);
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// update (multipart)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const current = await Sauce.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: 'Not found' });

    const body = { ...req.body };

    // if new file uploaded, delete old file (best-effort) and set new path
    if (req.file) {
      body.image = req.file.path;
    }

    const item = await Sauce.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// delete
router.delete('/:id', async (req, res) => {
  try {
    const item = await Sauce.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;

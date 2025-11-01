const express = require('express');
const router = express.Router();
const Notice = require('../models/notice');
const { upload, handleMulterError } = require('../middlewares/fileUpload'); 

// Helper: ensure absolute URL for clients
function absoluteFileUrl(req, relativePath) {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  return `${proto}://${host}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
}

// GET /api/notices
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find({})
      .sort({ priority: -1, updatedAt: -1 })
      .lean();

    const result = notices.map(n => ({
      ...n,
      imageUrl: absoluteFileUrl(req, n.imageUrl),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUBLIC: get active notice
router.get('/active', async (req, res) => {
  const now = new Date();
  const notice = await Notice.findOne({
    isActive: true,
    $and: [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: { $exists: false } }, { endsAt: { $gte: now } }] }
    ]
  }).sort({ priority: -1, updatedAt: -1 }).lean();

  if (!notice) return res.json(null);

  res.json({
    id: notice._id,
    title: notice.title,
    linkUrl: notice.linkUrl || null,
    dismissible: notice.dismissible !== false,
    imageUrl: absoluteFileUrl(req, notice.imageUrl) // ensure absolute
  });
});

// ADMIN: create (multipart form-data with field name "image")
router.post('/',
  // authMiddlewareIfAny,
  upload.single('image'),
  async (req, res, next) => {
    try {
      const body = req.body;

      if (req.file) {
        body.imageUrl = req.file.path;
      }

      const created = await Notice.create(body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },
  handleMulterError
);

// ADMIN: update (optionally replace image)
router.put('/:id',
  // authMiddlewareIfAny,
  upload.single('image'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };

      if (req.file) {
        updates.imageUrl = req.file.path;
      }

      const updated = await Notice.findByIdAndUpdate(id, updates, { new: true });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
  handleMulterError
);

// ADMIN: delete
router.delete('/:id', /* auth? */ async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

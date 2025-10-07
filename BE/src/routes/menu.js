const express = require('express');
const MenuItem = require('../models/MenuItem');
const {upload} = require('../middlewares/fileUpload'); // <-- multer (see note below)
const router = express.Router();

/** util: slugify */
const slugify = (s = '') =>
  s.toString().trim().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');

/** per-request parser: choose multer for multipart or JSON for everything else */
const anyParser = (req, res, next) => {
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.startsWith('multipart/form-data')) return upload.single('image')(req, res, next);
  return express.json()(req, res, next);
};

/**
 * GET /api/menu
 * Supports: ?page=&limit=&q=
 * NOTE: if category is ObjectId in schema, don't regex it. We filter on name/description.
 */
router.get('/', async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;
    const q     = (req.query.q || '').trim();

    const filter = q
      ? {
          $or: [
            { name:        { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      MenuItem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      MenuItem.countDocuments(filter),
    ]);

    res.json({ data: items, total, page, limit });
  } catch (err) { next(err); }
});

/** GET /api/menu/:id
 *  Return the raw doc (your FE uses body?.data || body)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await MenuItem.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    // return raw doc so FE code that does (body?.data || body) still works
    res.json(doc);
  } catch (err) { next(err); }
});

/** POST /api/menu (JSON or multipart) */
router.post('/', anyParser, async (req, res, next) => {
  try {
    const b = req.body || {};
    const payload = {
      name: b.name,
      slug: b.slug || slugify(b.name || ''),    // <-- ensure slug
      category: b.category,                      // must be Category _id if schema uses ObjectId
      price: b.price ?? 0,
      description: b.description || '',
      isAvailable: String(b.isAvailable) === 'true' || b.isAvailable === true,
      image: req.file ? `/uploads/menu/${req.file.filename}` : (b.image || b.photo || ''),
    };

    const doc = await MenuItem.create(payload);
    res.status(201).json({ data: doc });
  } catch (err) {
    if (err?.name === 'ValidationError') {
      const message = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: 'validation_failed', message });
    }
    next(err);
  }
});

/** PUT /api/menu/:id (JSON or multipart) */
router.put('/:id', anyParser, async (req, res, next) => {
  try {
    const b = req.body || {};
    const update = {
      name: b.name,
      // regenerate slug if missing while name is present
      slug: b.slug || (b.name ? slugify(b.name) : undefined),
      category: b.category,
      price: b.price ?? 0,
      description: b.description || '',
      isAvailable: String(b.isAvailable) === 'true' || b.isAvailable === true,
    };

    if (req.file) update.image = `/uploads/menu/${req.file.filename}`;
    else if (b.image || b.photo) update.image = b.image || b.photo;

    const doc = await MenuItem.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ data: doc });
  } catch (err) {
    if (err?.name === 'ValidationError') {
      const message = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: 'validation_failed', message });
    }
    next(err);
  }
});

/** PATCH /api/menu/:id */
router.patch('/:id', anyParser, async (req, res, next) => {
  try {
    const doc = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ data: doc });
  } catch (err) {
    if (err?.name === 'ValidationError') {
      const message = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: 'validation_failed', message });
    }
    next(err);
  }
});

/** DELETE /api/menu/:id */
router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await MenuItem.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;

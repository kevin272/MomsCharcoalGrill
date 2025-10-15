// routes/menuSlides.js
const express = require('express');
const router = express.Router();
const MenuSlide = require('../models/menuSlide');

const { upload, handleMulterError } = require('../middlewares/fileUpload');
const { authenticateToken, requirePermission } = require('../middlewares/auth');
const { sendResponse, sendError } = require('../utils/response');

// LIST — GET /api/menu-slides?type=menu|cateringmenu&isActive=true|false
router.get('/', async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const filter = {};

    if (type) filter.type = type; // enum: 'menu' | 'cateringmenu'
    if (typeof isActive !== 'undefined') filter.isActive = isActive !== 'false';

    const slides = await MenuSlide.find(filter).sort({ order: 1, createdAt: -1 });
    sendResponse(res, slides, 'Slides retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Error fetching slides', error.message);
  }
});

// GET ONE — /api/menu-slides/:id
router.get('/:id', async (req, res) => {
  try {
    const slide = await MenuSlide.findById(req.params.id);
    if (!slide) return sendError(res, 404, 'Slide not found');
    sendResponse(res, slide, 'Slide retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Error fetching slide', error.message);
  }
});

// CREATE — multipart/form-data (image), protected
// Fields: type(menu|cateringmenu), title?, caption?, linkTo?, order?, isActive?
router.post(
  '/',
  authenticateToken,
  requirePermission('manage-gallery'), // reuse an existing permission you already have
  handleMulterError,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) return sendError(res, 400, 'Image file is required');
      if (!req.body.type) return sendError(res, 400, 'type is required (menu|cateringmenu)');

      const slide = await MenuSlide.create({
        type: req.body.type,
        image: `/uploads/menu/${req.file.filename}`,
        title: req.body.title || '',
        caption: req.body.caption || '',
        linkTo: req.body.linkTo || '',
        order: Number.isFinite(+req.body.order) ? +req.body.order : 0,
        isActive: req.body.isActive !== 'false',
      });

      sendResponse(res, slide, 'Slide created successfully', 201);
    } catch (error) {
      sendError(res, 400, 'Error creating slide', error.message);
    }
  }
);

// UPDATE — multipart/form-data (optional image), protected
router.put(
  '/:id',
  authenticateToken,
  requirePermission('manage-gallery'),
  handleMulterError,
  upload.single('image'),
  async (req, res) => {
    try {
      const updateData = { ...req.body };

      // normalize fields
      if (typeof updateData.order !== 'undefined') {
        updateData.order = Number.isFinite(+updateData.order) ? +updateData.order : 0;
      }
      if (typeof updateData.isActive !== 'undefined') {
        updateData.isActive = updateData.isActive !== 'false';
      }
      if (req.file) {
        updateData.image = `/uploads/menu/${req.file.filename}`;
      }

      const slide = await MenuSlide.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      if (!slide) return sendError(res, 404, 'Slide not found');

      sendResponse(res, slide, 'Slide updated successfully');
    } catch (error) {
      sendError(res, 400, 'Error updating slide', error.message);
    }
  }
);

// DELETE — protected
router.delete(
  '/:id',
  authenticateToken,
  requirePermission('manage-gallery'),
  async (req, res) => {
    try {
      const slide = await MenuSlide.findByIdAndDelete(req.params.id);
      if (!slide) return sendError(res, 404, 'Slide not found');

      // Optional: remove physical file from disk here if desired
      // (You already left examples in Gallery router.)

      sendResponse(res, null, 'Slide deleted successfully');
    } catch (error) {
      sendError(res, 500, 'Error deleting slide', error.message);
    }
  }
);

// BULK CREATE — multipart/form-data, multiple files under "images"
router.post(
  '/bulk',
  authenticateToken,
  requirePermission('manage-gallery'),
  handleMulterError,
  upload.array('images', 50),
  async (req, res) => {
    try {
      if (!req.files?.length) return sendError(res, 400, 'At least one image file is required');
      const { type } = req.body;
      if (!type || !['menu', 'cateringmenu'].includes(type)) {
        return sendError(res, 400, 'type must be "menu" or "cateringmenu"');
      }

      // Common fields
      const common = {
        type,
        isActive: req.body.isActive !== 'false',
      };

      // Optional arrays (titles[], captions[], linkTos[], orders[])
      const getArr = (key) => {
        const v = req.body[key] ?? req.body[`${key}[]`];
        if (v == null) return [];
        return Array.isArray(v) ? v : [v];
      };
      const titles = getArr('titles');
      const captions = getArr('captions');
      const linkTos = getArr('linkTos');
      const orders  = getArr('orders');

      // Continue order if not provided
      const maxOrderDoc = await MenuSlide.find({ type }).sort({ order: -1 }).limit(1).select('order').lean();
      let nextOrder = (maxOrderDoc?.[0]?.order ?? 0) + 1;

      const docs = req.files.map((file, idx) => {
        const base = (file.originalname || 'Untitled').replace(/\.[^/.]+$/, '');
        const title = (titles[idx] || titles[0] || req.body.title || base).trim();
        const caption = (captions[idx] || captions[0] || req.body.caption || '').trim();
        const linkTo = (linkTos[idx] || linkTos[0] || req.body.linkTo || '').trim();
        const order = orders[idx] != null
          ? Number(orders[idx])
          : (req.body.order != null ? Number(req.body.order) : nextOrder++);

        return {
          ...common,
          image: `/uploads/menu/${file.filename}`,
          title,
          caption,
          linkTo,
          order: Number.isFinite(order) ? order : 0,
        };
      });

      const inserted = await MenuSlide.insertMany(docs);
      sendResponse(res, inserted, `Uploaded ${inserted.length} slides`, 201);
    } catch (error) {
      sendError(res, 400, 'Error bulk-creating slides', error.message);
    }
  }
);

// BULK REORDER — [{ _id, order }]
router.post(
  '/reorder',
  authenticateToken,
  requirePermission('manage-gallery'),
  handleMulterError,
  async (req, res) => {
    try {
      const { orders } = req.body;
      if (!Array.isArray(orders) || !orders.length) {
        return sendError(res, 400, 'orders must be a non-empty array');
      }
      const ops = orders.map(({ _id, order }) => ({
        updateOne: { filter: { _id }, update: { $set: { order } } }
      }));
      const result = await MenuSlide.bulkWrite(ops);
      sendResponse(res, result, 'Slide order updated');
    } catch (error) {
      sendError(res, 400, 'Error updating order', error.message);
    }
  }
);

module.exports = router;

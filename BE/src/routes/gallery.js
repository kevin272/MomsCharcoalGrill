const express = require('express');
const router = express.Router();
const Gallery = require('../models/gallery');
const { upload, handleMulterError } = require('../middlewares/fileUpload');
const { authenticateToken, requirePermission } = require('../middlewares/auth');
const { sendResponse, sendError } = require('../utils/response');

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const { category, public: isPublic } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (isPublic !== 'false') filter.isPublic = true;
    
    const galleryItems = await Gallery.find(filter)
      .sort({ order: 1, createdAt: -1 });
      
    sendResponse(res, galleryItems, 'Gallery items retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Error fetching gallery items', error.message);
  }
});

// Get gallery item by ID
router.get('/:id', async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return sendError(res, 404, 'Gallery item not found');
    }
    sendResponse(res, galleryItem, 'Gallery item retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Error fetching gallery item', error.message);
  }
});

// Get gallery items by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const galleryItems = await Gallery.find({ 
      category: category, 
      isPublic: true 
    }).sort({ order: 1, createdAt: -1 });
    
    sendResponse(res, galleryItems, `${category} gallery items retrieved successfully`);
  } catch (error) {
    sendError(res, 500, 'Error fetching category gallery items', error.message);
  }
});

// Create new gallery item (admin endpoint)
router.post('/', authenticateToken, requirePermission('manage-gallery'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Image file is required');
    }
    
    const galleryItem = new Gallery({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'other',
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      image: `/uploads/${req.file.filename}`,
      uploadedBy: req.body.uploadedBy || 'admin',
      order: req.body.order || 0,
      isPublic: req.body.isPublic !== 'false'
    });
    
    await galleryItem.save();
    sendResponse(res, galleryItem, 'Gallery item created successfully', 201);
  } catch (error) {
    sendError(res, 400, 'Error creating gallery item', error.message);
  }
});

// Update gallery item (admin endpoint)
router.put('/:id', authenticateToken, requirePermission('manage-gallery'), upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
  updateData.image = `/uploads/${req.file.filename}`;
}
    
    if (req.body.tags) {
      updateData.tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    
    const galleryItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!galleryItem) {
      return sendError(res, 404, 'Gallery item not found');
    }
    
    sendResponse(res, galleryItem, 'Gallery item updated successfully');
  } catch (error) {
    sendError(res, 400, 'Error updating gallery item', error.message);
  }
});

// Delete gallery item (admin endpoint)
router.delete('/:id', authenticateToken, requirePermission('manage-gallery'), async (req, res) => {
  try {
    const galleryItem = await Gallery.findByIdAndDelete(req.params.id);
    if (!galleryItem) {
      return sendError(res, 404, 'Gallery item not found');
    }
    
    // Note: In production, you might want to delete the actual file from disk
    // const fs = require('fs');
    // const path = require('path');
    // if (galleryItem.image) {
    //   fs.unlinkSync(path.join(__dirname, '../../', galleryItem.image));
    // }
    
    sendResponse(res, null, 'Gallery item deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Error deleting gallery item', error.message);
  }
});

// BULK CREATE gallery items (admin endpoint)
router.post(
  '/bulk',
  authenticateToken,
  requirePermission('manage-gallery'),
  handleMulterError,
  upload.array('images', 50), // up to 50 images at once; tweak as needed
  async (req, res) => {
    try {
      if (!req.files?.length) {
        return sendError(res, 400, 'At least one image file is required');
      }

      // Common fields that can apply to all items (overridden by per-file arrays)
      const common = {
        category: req.body.category || 'other',
        uploadedBy: req.body.uploadedBy || 'admin',
        isPublic: req.body.isPublic !== 'false',
      };

      // Optional per-file arrays: titles[], descriptions[], tags[], orders[]
      // (Accept both "titles" and "titles[]" for convenience)
      const getArr = (key) => {
        const v = req.body[key] ?? req.body[`${key}[]`];
        if (v == null) return [];
        return Array.isArray(v) ? v : [v];
      };

      const titles = getArr('titles');
      const descriptions = getArr('descriptions');
      const tagsArr = getArr('tags');         // each entry can be "tag1, tag2"
      const orders = getArr('orders');

      // If you want to auto-continue order numbers:
      const maxOrderDoc = await Gallery.findOne().sort({ order: -1 }).select('order').lean();
      let nextOrder = (maxOrderDoc?.order ?? 0) + 1;

      const docs = req.files.map((file, idx) => {
        // Safe title fallback: provided title -> file.originalname (without extension)
        const fileBase =
          (file.originalname || 'Untitled').replace(/\.[^/.]+$/, '');
        const title = (titles[idx] || titles[0] || req.body.title || fileBase).trim();

        // Description fallback: provided description or empty
        const description =
          (descriptions[idx] || descriptions[0] || req.body.description || '').trim();

        // Tags: either per-index "tag1, tag2" or a global "tag1, tag2"
        const rawTags = (tagsArr[idx] || tagsArr[0] || req.body.tags || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        // Order: per-item orders[] or auto-increment
        const order =
          orders[idx] != null
            ? Number(orders[idx])
            : (req.body.order != null ? Number(req.body.order) : nextOrder++);

        return {
          title,
          description,
          category: common.category,
          tags: rawTags,
          image: `/uploads/${file.filename}`,
          uploadedBy: common.uploadedBy,
          order: Number.isFinite(order) ? order : 0,
          isPublic: common.isPublic,
        };
      });

      const inserted = await Gallery.insertMany(docs);
      sendResponse(res, inserted, `Uploaded ${inserted.length} gallery items`, 201);
    } catch (error) {
      sendError(res, 400, 'Error bulk-creating gallery items', error.message);
    }
  }
);

// BULK REORDER (admin endpoint)
router.post(
  '/reorder',
  authenticateToken,
  requirePermission('manage-gallery'),
  handleMulterError, 
  async (req, res) => {
    try {
      const { orders } = req.body; // [{_id, order}, ...]
      if (!Array.isArray(orders) || !orders.length) {
        return sendError(res, 400, 'orders must be a non-empty array');
      }

      const ops = orders.map(({ _id, order }) => ({
        updateOne: { filter: { _id }, update: { $set: { order } } }
      }));

      const result = await Gallery.bulkWrite(ops);
      sendResponse(res, result, 'Gallery order updated');
    } catch (error) {
      sendError(res, 400, 'Error updating order', error.message);
    }
  }
);


module.exports = router;
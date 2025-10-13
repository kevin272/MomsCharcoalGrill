// controllers/cateringOptionController.js
const CateringOption = require('../models/CateringOption');
const MenuItem = require('../models/MenuItem');

const toSlug = (str='') =>
  String(str).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

// LIST with search & populate
exports.list = async (req, res) => {
  try {
    const { q, isActive, populate } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';

    const query = CateringOption.find(filter).sort({ order: 1, createdAt: -1 });
    if (populate === '1') query.populate('items');

    const data = await query.exec();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET one
exports.getOne = async (req, res) => {
  try {
    const doc = await CateringOption.findById(req.params.id).populate('items');
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// CREATE (multipart/form-data) -> fields + optional image
exports.create = async (req, res) => {
  try {
    const {
      title, description, priceType, price, minPeople, feeds, isActive = true, order = 0
    } = req.body;

    // items can come as JSON string or array of ids
    let items = req.body.items || [];
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch (_) { items = []; }
    }

    // validate menu item ids exist
    if (items.length) {
      const count = await MenuItem.countDocuments({ _id: { $in: items } });
      if (count !== items.length) {
        return res.status(400).json({ success: false, message: 'Some MenuItem ids are invalid' });
      }
    }

    const slugBase = toSlug(title);
    let slug = slugBase;
    // ensure unique slug
    let i = 1;
    while (await CateringOption.exists({ slug })) {
      slug = `${slugBase}-${i++}`;
    }

    const image = req.file ? req.file.filename : '';

    const doc = await CateringOption.create({
      title, slug, description, priceType, price, minPeople, feeds,
      items, image, isActive, order
    });

    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    let payload = { ...req.body };

    if (payload.title) {
      payload.slug = toSlug(payload.title);
      // allow same doc to keep same slug; only collide with others
      const exists = await CateringOption.findOne({ slug: payload.slug, _id: { $ne: id } });
      if (exists) payload.slug = `${payload.slug}-${exists._id.toString().slice(-4)}`;
    }

    // items come possibly as JSON
    if (typeof payload.items === 'string') {
      try { payload.items = JSON.parse(payload.items); } catch(_) { payload.items = []; }
    }

    if (req.file) payload.image = req.file.filename;

    const doc = await CateringOption.findByIdAndUpdate(id, payload, { new: true }).populate('items');
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    await CateringOption.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// QUICK toggle
exports.toggleActive = async (req, res) => {
  try {
    const doc = await CateringOption.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    doc.isActive = !doc.isActive;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

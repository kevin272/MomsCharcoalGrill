// controllers/cateringOptionController.js
const CateringOption = require('../models/CateringOption');
const MenuItem = require('../models/MenuItem');

const toSlug = (str='') =>
  String(str).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

const parseArrayField = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; }
    catch { return raw.split(',').map((s) => s.trim()).filter(Boolean); }
  }
  return [];
};

const normalizeCategoryLimits = (input) => {
  const out = {};
  if (!input || typeof input !== 'object') return out;
  Object.entries(input).forEach(([k, v]) => {
    const num = Number(v);
    if (!Number.isNaN(num)) out[String(k)] = num;
  });
  return out;
};

// list with search & populate
exports.list = async (req, res) => {
  try {
    const { q, isActive, populate, slug } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';
    if (slug) filter.slug = slug;

    const rawPage = Number.parseInt(req.query.page, 10);
    const rawLimit = Number.parseInt(req.query.limit, 10);
    const shouldPaginate = Number.isFinite(rawPage) || Number.isFinite(rawLimit);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 10;

    const query = CateringOption.find(filter).sort({ order: 1, createdAt: -1 });
    if (populate === '1') {
      query
        .populate({ path: 'items', populate: { path: 'category', select: 'name slug' } })
        .populate({ path: 'itemConfigurations.menuItem', populate: { path: 'category', select: 'name slug' } });
    }

    // If page/limit is provided, return paginated payload with metadata; otherwise keep legacy response.
    if (shouldPaginate) {
      const total = await CateringOption.countDocuments(filter);
      const data = await query.skip((page - 1) * limit).limit(limit).exec();
      return res.json({
        success: true,
        data,
        total,
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
        limit,
      });
    }

    const data = await query.exec();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET one
exports.getOne = async (req, res) => {
  try {
    const doc = await CateringOption.findById(req.params.id)
      .populate({ path: 'items', populate: { path: 'category', select: 'name slug' } })
      .populate({ path: 'itemConfigurations.menuItem', populate: { path: 'category', select: 'name slug' } });
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

    // Legacy items (array of ids) and new itemConfigurations with extra selections
    let items = parseArrayField(req.body.items);
    let itemConfigurations = parseArrayField(req.body.itemConfigurations || req.body.itemConfigs)
      .map((cfg) => {
        const menuItem = cfg?.menuItem || cfg?.item || cfg?._id || cfg?.id || cfg;
        const extraOptions = parseArrayField(cfg?.extraOptions);
        const useMenuItemPrice = Boolean(cfg?.useMenuItemPrice);
        return menuItem ? { menuItem, extraOptions, useMenuItemPrice } : null;
      })
      .filter(Boolean);

    // If configs are provided, derive items from them so both shapes stay in sync
    if (itemConfigurations.length) {
      items = itemConfigurations.map((c) => c.menuItem);
    } else if (items.length) {
      // seed configurations with empty options to keep FE consistent
      itemConfigurations = items.map((id) => ({ menuItem: id, extraOptions: [], useMenuItemPrice: false }));
    }

    // validate menu item ids exist
    if (items.length) {
      const count = await MenuItem.countDocuments({ _id: { $in: items } });
      if (count !== items.length) {
        return res.status(400).json({ success: false, message: 'Some MenuItem ids are invalid' });
      }
    }

    // selection rules for special catering (e.g., general catering limits)
    let selectionRules = req.body.selectionRules;
    if (typeof selectionRules === 'string') {
      try { selectionRules = JSON.parse(selectionRules); } catch (_) { selectionRules = null; }
    }
    if (!selectionRules || typeof selectionRules !== 'object') {
      selectionRules = { enabled: false, categoryLimits: {} };
    } else {
      selectionRules.enabled = !!selectionRules.enabled;
      selectionRules.categoryLimits = normalizeCategoryLimits(selectionRules.categoryLimits);
    }

    const slugBase = toSlug(title);
    let slug = slugBase;
    // ensure unique slug
    let i = 1;
    while (await CateringOption.exists({ slug })) {
      slug = `${slugBase}-${i++}`;
    }

    let image = '';
    if (req.file) {
      image = req.file.path;
    }

    const doc = await CateringOption.create({
      title, slug, description, priceType, price, minPeople, feeds,
      items, itemConfigurations, selectionRules, image, isActive, order
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
      payload.items = parseArrayField(payload.items);
    }

    // new itemConfigurations shape
    if (typeof payload.itemConfigurations === 'string' || Array.isArray(payload.itemConfigurations)) {
      payload.itemConfigurations = parseArrayField(payload.itemConfigurations)
        .map((cfg) => {
          const menuItem = cfg?.menuItem || cfg?.item || cfg?._id || cfg?.id || cfg;
          const extraOptions = parseArrayField(cfg?.extraOptions);
          const useMenuItemPrice = Boolean(cfg?.useMenuItemPrice);
          return menuItem ? { menuItem, extraOptions, useMenuItemPrice } : null;
        })
        .filter(Boolean);
      // keep items array synced for older clients
      payload.items = payload.itemConfigurations.map((c) => c.menuItem);
    } else if (Array.isArray(payload.items) && payload.items.length) {
      payload.itemConfigurations = payload.items.map((id) => ({ menuItem: id, extraOptions: [], useMenuItemPrice: false }));
    }

    if (req.file) payload.image = req.file.path;

    // selection rules optional
    if (payload.selectionRules) {
      if (typeof payload.selectionRules === 'string') {
        try { payload.selectionRules = JSON.parse(payload.selectionRules); } catch (_) { payload.selectionRules = null; }
      }
      if (!payload.selectionRules || typeof payload.selectionRules !== 'object') {
        payload.selectionRules = { enabled: false, categoryLimits: {} };
      } else {
        payload.selectionRules.enabled = !!payload.selectionRules.enabled;
        payload.selectionRules.categoryLimits = normalizeCategoryLimits(payload.selectionRules.categoryLimits);
      }
    }

    const doc = await CateringOption.findByIdAndUpdate(id, payload, { new: true })
      .populate({ path: 'items', populate: { path: 'category', select: 'name slug' } })
      .populate({ path: 'itemConfigurations.menuItem', populate: { path: 'category', select: 'name slug' } });
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

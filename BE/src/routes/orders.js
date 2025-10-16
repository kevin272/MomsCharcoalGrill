// src/routes/orders.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const {
  sendOrderReceipt,
  sendOrderPaid,
  sendOrderCompleted,
} = require('../utils/mailer');

// -------------------- LIST --------------------
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(),
    ]);

    res.json({ success: true, data: items, page, total, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// -------------------- GET ONE --------------------
router.get('/:id', async (req, res) => {
  try {
    const item = await Order.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// -------------------- CREATE --------------------
router.post('/', async (req, res) => {
  try {
    const item = await Order.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// -------------------- UPDATE + EMAIL HOOKS --------------------
router.put('/:id', async (req, res) => {
  try {
    const current = await Order.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: 'Not found' });

    const prevStatus = current.status;
    const next = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Email triggers on status transitions
    if (prevStatus !== next.status) {
      const s = String(next.status).toLowerCase();
      if (s === 'paid') {
        sendOrderPaid({ order: next }).catch(console.error);
      }
      if (s === 'completed' || s === 'delivered') {
        sendOrderCompleted({ order: next }).catch(console.error);
      }
    }

    res.json({ success: true, data: next });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// -------------------- DELETE --------------------
router.delete('/:id', async (req, res) => {
  try {
    const item = await Order.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// -------------------- CHECKOUT + RECEIPT EMAIL --------------------
router.post('/checkout', async (req, res) => {
  try {
    const { items = [], customer, paymentMode = 'COD', notes = '' } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }
    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({ success: false, message: 'Customer details are required' });
    }

    // Normalize/sanitize paymentMode into a valid string
    const normalizedMode = typeof paymentMode === 'string'
      ? String(paymentMode).toUpperCase().trim()
      : '';
    const safePaymentMode = ['COD', 'PAY_TO_CALL'].includes(normalizedMode)
      ? normalizedMode
      : 'COD';

    const orderItems = [];
    let subtotal = 0;
    for (const item of items) {
      const qty = Math.max(parseInt(item.qty) || 1, 1);
      let menuItemId, name, price, image = '';

      if (item.menuItem) {
        const doc = await MenuItem.findById(item.menuItem);
        if (doc) {
          menuItemId = doc._id; name = doc.name; price = doc.price; image = doc.image || '';
        } else {
          menuItemId = new mongoose.Types.ObjectId();
          name = item.name || ''; price = Number(item.price) || 0; image = item.image || '';
        }
      } else {
        menuItemId = new mongoose.Types.ObjectId();
        name = item.name || ''; price = Number(item.price) || 0; image = item.image || '';
      }

      subtotal += price * qty;
      orderItems.push({ menuItem: menuItemId, name, price, qty, image });
    }

    const gst = Math.round(subtotal * 0.1);
    const delivery = subtotal > 0 ? 50 : 0;
    const grandTotal = subtotal + gst + delivery;
    const totals = { subtotal, gst, delivery, grandTotal };

    const customerDoc = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
    };

    const order = await Order.create({
      items: orderItems,
      customer: customerDoc,
      paymentMode: safePaymentMode, // ✅ string, not a schema object
      totals,
      notes: notes || '',
      status: 'new',
    });

    sendOrderReceipt({ order }).catch(console.error);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Unable to checkout' });
  }
});


module.exports = router;

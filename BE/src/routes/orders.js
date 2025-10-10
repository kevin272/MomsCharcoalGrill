const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// -----------------------------------------------------------------------------
// CRUD operations for orders
//
// The following routes provide basic list, get, create, update and delete
// functionality for orders.  They mirror the original implementation from
// upstream but are reproduced here so we can extend the router below.

// GET /api/orders - list orders with simple pagination
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

// GET /api/orders/:id - return a single order by id
router.get('/:id', async (req, res) => {
  try {
    const item = await Order.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/orders - create an order directly from provided body
router.post('/', async (req, res) => {
  try {
    const item = await Order.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// PUT /api/orders/:id - update order fields or status
router.put('/:id', async (req, res) => {
  try {
    const item = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// DELETE /api/orders/:id - permanently delete an order
router.delete('/:id', async (req, res) => {
  try {
    const item = await Order.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// -----------------------------------------------------------------------------
// POST /api/orders/checkout
//
// Accepts a payload describing the items in the customer's cart, along with
// customer details, payment mode and optional notes.  The route computes the
// order totals (subtotal, GST, delivery, grand total), constructs the order
// items by looking up menu items when possible and falls back to provided
// name/price/image when not.  Each order item requires a valid ObjectId for
// the `menuItem` field in the schema; if none is provided, a new ObjectId
// placeholder is generated.  Finally, the order document is created and
// returned.

router.post('/checkout', async (req, res) => {
  try {
    const { items = [], customer, paymentMode = 'COD', notes = '' } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }
    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({ success: false, message: 'Customer details are required' });
    }

    // Prepare order items and compute subtotal.  If an item includes a
    // `menuItem` identifier, attempt to load the corresponding MenuItem from
    // the database.  Otherwise, fall back to the name/price/image provided
    // by the client and assign a dummy ObjectId so Mongoose validation passes.
    const orderItems = [];
    let subtotal = 0;
    for (const item of items) {
      const qty = Math.max(parseInt(item.qty) || 1, 1);
      let menuItemId;
      let name;
      let price;
      let image = '';
      if (item.menuItem) {
          // Attempt to fetch the menu item from the database
          const doc = await MenuItem.findById(item.menuItem);
          if (doc) {
            menuItemId = doc._id;
            name = doc.name;
            price = doc.price;
            image = doc.image || '';
          } else {
            // Provided id did not match any MenuItem; generate a dummy id
            menuItemId = new mongoose.Types.ObjectId();
            name = item.name || '';
            price = Number(item.price) || 0;
            image = item.image || '';
          }
      } else {
        // No menuItem id; use provided data and generate a dummy id
        menuItemId = new mongoose.Types.ObjectId();
        name = item.name || '';
        price = Number(item.price) || 0;
        image = item.image || '';
      }
      subtotal += price * qty;
      orderItems.push({ menuItem: menuItemId, name, price, qty, image });
    }
    // Compute GST (10% of subtotal) and fixed delivery of 50 if there are items
    const gst = Math.round(subtotal * 0.1);
    const delivery = subtotal > 0 ? 50 : 0;
    const grandTotal = subtotal + gst + delivery;
    const totals = { subtotal, gst, delivery, grandTotal };

    // Construct customer subdocument
    const customerDoc = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
    };

    // Create order
    const order = await Order.create({
      items: orderItems,
      customer: customerDoc,
      paymentMode: paymentMode || 'COD',
      totals,
      notes: notes || '',
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Unable to checkout' });
  }
});

module.exports = router;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

// Import auth utilities
const { createDefaultAdmin } = require('./utils/seedAdmin');


// Import routes
const categoryRoutes = require('./routes/menuCategories');
const itemRoutes = require('./routes/menuItems');
const orderRoutes = require('./routes/orders');
const sauceRoutes = require('./routes/sauces');
const cateringPackagesRoutes = require('./routes/cateringPackages');
const cateringOrderRoutes = require('./routes/cateringOrders');
const settingRoutes = require('./routes/settings');

const galleryRoutes = require('./routes/gallery');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const menuAliasRoutes = require('./routes/menu'); // <- new


const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000 // 15 minutes
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/menu', menuAliasRoutes); // <- add this alias

app.use('/api/menu-categories', categoryRoutes);
app.use('/api/menu-items', itemRoutes);
app.use('/api/sauces', sauceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/catering-packages', cateringPackagesRoutes);
app.use('/api/catering-orders', cateringOrderRoutes);
app.use('/api/settings', settingRoutes);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve frontend React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../FE/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../FE/dist', 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
// after all routes
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.name, err.message);
  res.status(400 <= (err.status || 500) && (err.status || 500) < 600 ? (err.status || 500) : 500).json({
    error: err.name || 'ServerError',
    message: err.message || 'Something went wrong',
    // include details only in dev:
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});


// MongoDB connection & server start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // Create default admin account
    createDefaultAdmin();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${process.env.NODE_ENV} at  http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Admin login: http://localhost:${PORT}/api/auth/login`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });



module.exports = app;

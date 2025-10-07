const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const { authenticateToken, requireRole, requirePermission } = require('../middlewares/auth');
const { sendResponse, sendError, validateRequiredFields } = require('../utils/response');

// Get all admins (super-admin only)
router.get('/', authenticateToken, requireRole('super-admin'), async (req, res) => {
  try {
    const { role, active } = req.query;
    const filter = {};
    
    if (role) filter.role = role;
    if (active !== undefined) filter.isActive = active === 'true';
    
    const admins = await Admin.find(filter)
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 });
      
    sendResponse(res, admins, 'Admins retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Error fetching admins', error.message);
  }
});

// Get admin by ID (super-admin only)
router.get('/:id', authenticateToken, requireRole('super-admin'), async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .select('-password -passwordResetToken -passwordResetExpires');
      
    if (!admin) {
      return sendError(res, 404, 'Admin not found');
    }
    
    sendResponse(res, admin, 'Admin retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Error fetching admin', error.message);
  }
});

// Create new admin (super-admin only)
router.post('/', authenticateToken, requireRole('super-admin'), async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role, permissions } = req.body;
    
    const validation = validateRequiredFields(req.body, [
      'username', 'email', 'password', 'firstName', 'lastName'
    ]);
    if (!validation.isValid) {
      return sendError(res, 400, 'Missing required fields', validation.missingFields);
    }
    
    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long');
    }
    
    // Check if username or email already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingAdmin) {
      return sendError(res, 400, 'Username or email already exists');
    }
    
    const admin = new Admin({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'admin',
      permissions: permissions || []
    });
    
    await admin.save();
    
    sendResponse(res, admin.toSafeObject(), 'Admin created successfully', 201);
  } catch (error) {
    sendError(res, 400, 'Error creating admin', error.message);
  }
});

// Update admin (super-admin only)
router.put('/:id', authenticateToken, requireRole('super-admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, role, permissions, isActive } = req.body;
    
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -passwordResetToken -passwordResetExpires');
    
    if (!admin) {
      return sendError(res, 404, 'Admin not found');
    }
    
    sendResponse(res, admin, 'Admin updated successfully');
  } catch (error) {
    sendError(res, 400, 'Error updating admin', error.message);
  }
});

// Reset admin password (super-admin only)
router.put('/:id/reset-password', authenticateToken, requireRole('super-admin'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters long');
    }
    
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return sendError(res, 404, 'Admin not found');
    }
    
    admin.password = newPassword;
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();
    
    sendResponse(res, null, 'Password reset successfully');
  } catch (error) {
    sendError(res, 500, 'Error resetting password', error.message);
  }
});

// Delete admin (super-admin only)
router.delete('/:id', authenticateToken, requireRole('super-admin'), async (req, res) => {
  try {
    // Prevent deleting self
    if (req.params.id === req.admin._id.toString()) {
      return sendError(res, 400, 'Cannot delete your own account');
    }
    
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return sendError(res, 404, 'Admin not found');
    }
    
    sendResponse(res, null, 'Admin deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Error deleting admin', error.message);
  }
});

// Get admin statistics (super-admin only)
router.get('/stats/summary', authenticateToken, requireRole('super-admin'), async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({ isActive: true });
    const lockedAdmins = await Admin.countDocuments({ 
      lockUntil: { $gt: new Date() } 
    });
    
    const adminsByRole = await Admin.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const recentLogins = await Admin.find({ 
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    }).countDocuments();
    
    sendResponse(res, {
      total: totalAdmins,
      active: activeAdmins,
      locked: lockedAdmins,
      recentLogins,
      byRole: adminsByRole
    }, 'Admin statistics retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Error fetching admin statistics', error.message);
  }
});

module.exports = router;
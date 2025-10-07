const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const { generateToken, authenticateToken, loginRateLimit } = require('../middlewares/auth');
const { sendResponse, sendError, validateRequiredFields } = require('../utils/response');

// Admin login
router.post('/login', loginRateLimit, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    const validation = validateRequiredFields(req.body, ['username', 'password']);
    if (!validation.isValid) {
      return sendError(res, 400, 'Missing required fields', validation.missingFields);
    }
    
    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });
    
    if (!admin) {
      // Track failed attempt
      if (req.session) {
        req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;
        req.session.lastLoginAttempt = Date.now();
      }
      return sendError(res, 401, 'Invalid credentials');
    }
    
    if (!admin.isActive) {
      return sendError(res, 401, 'Account is deactivated');
    }
    
    // Compare password (this also handles account locking)
    try {
      await admin.comparePassword(password);
    } catch (error) {
      // Track failed attempt
      if (req.session) {
        req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;
        req.session.lastLoginAttempt = Date.now();
      }
      return sendError(res, 401, error.message);
    }
    
    // Generate JWT token
    const token = generateToken(admin._id);
    
    // Reset login attempts on successful login
    if (req.session) {
      req.session.loginAttempts = 0;
    }
    
    sendResponse(res, {
      token,
      admin: admin.toSafeObject(),
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }, 'Login successful');
    
  } catch (error) {
    sendError(res, 500, 'Login failed', error.message);
  }
});

// Get current admin profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    sendResponse(res, req.admin.toSafeObject(), 'Profile retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Error fetching profile', error.message);
  }
});

// Update admin profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const allowedUpdates = { firstName, lastName, email };
    
    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });
    
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin._id,
      allowedUpdates,
      { new: true, runValidators: true }
    );
    
    sendResponse(res, updatedAdmin.toSafeObject(), 'Profile updated successfully');
  } catch (error) {
    sendError(res, 400, 'Error updating profile', error.message);
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const validation = validateRequiredFields(req.body, ['currentPassword', 'newPassword']);
    if (!validation.isValid) {
      return sendError(res, 400, 'Missing required fields', validation.missingFields);
    }
    
    if (newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters long');
    }
    
    const admin = await Admin.findById(req.admin._id);
    
    // Verify current password
    try {
      await admin.comparePassword(currentPassword);
    } catch (error) {
      return sendError(res, 401, 'Current password is incorrect');
    }
    
    // Update password
    admin.password = newPassword;
    await admin.save();
    
    sendResponse(res, null, 'Password changed successfully');
  } catch (error) {
    sendError(res, 500, 'Error changing password', error.message);
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just send a success response
    sendResponse(res, null, 'Logged out successfully');
  } catch (error) {
    sendError(res, 500, 'Error during logout', error.message);
  }
});

// Verify token (useful for frontend to check if token is still valid)
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    sendResponse(res, {
      valid: true,
      admin: req.admin.toSafeObject()
    }, 'Token is valid');
  } catch (error) {
    sendError(res, 500, 'Error verifying token', error.message);
  }
});

module.exports = router;
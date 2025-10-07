const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const { sendError } = require('../utils/response');

// JWT secret from environment or default
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate JWT token for admin
 */
const generateToken = (adminId) => {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify JWT token middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return sendError(res, 401, 'Access token required');
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId).select('-password');
    
    if (!admin) {
      return sendError(res, 401, 'Invalid token - admin not found');
    }
    
    if (!admin.isActive) {
      return sendError(res, 401, 'Account is deactivated');
    }
    
    if (admin.isLocked) {
      return sendError(res, 401, 'Account is temporarily locked');
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired');
    }
    return sendError(res, 500, 'Token verification failed', error.message);
  }
};

/**
 * Check if admin has specific permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return sendError(res, 401, 'Authentication required');
    }
    
    if (!req.admin.hasPermission(permission)) {
      return sendError(res, 403, `Permission denied: ${permission} required`);
    }
    
    next();
  };
};

/**
 * Check if admin has specific role
 */
const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.admin) {
      return sendError(res, 401, 'Authentication required');
    }
    
    if (!allowedRoles.includes(req.admin.role)) {
      return sendError(res, 403, `Access denied: ${allowedRoles.join(' or ')} role required`);
    }
    
    next();
  };
};

/**
 * Rate limiting for login attempts
 */
const loginRateLimit = (req, res, next) => {
  // Simple in-memory rate limiting (in production, use Redis)
  const attempts = req.session?.loginAttempts || 0;
  const lastAttempt = req.session?.lastLoginAttempt || 0;
  const now = Date.now();
  
  // Reset attempts after 15 minutes
  if (now - lastAttempt > 15 * 60 * 1000) {
    if (req.session) {
      req.session.loginAttempts = 0;
    }
  }
  
  if (attempts >= 10) {
    return sendError(res, 429, 'Too many login attempts. Please try again later.');
  }
  
  next();
};

module.exports = {
  generateToken,
  authenticateToken,
  requirePermission,
  requireRole,
  loginRateLimit
};
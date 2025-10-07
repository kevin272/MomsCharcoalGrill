const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Default to /uploads
    let targetDir = path.join(__dirname, '../../uploads');

    // Use subfolder based on route
    if (req.baseUrl.includes('projects')) {
      targetDir = path.join(__dirname, '../../uploads');
    } else if (req.baseUrl.includes('gallery')) {
      targetDir = path.join(__dirname, '../../uploads');
          } else if (req.baseUrl.includes('menu')) {
 targetDir = path.join(__dirname, '../../uploads/menu');
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '_' + uniqueSuffix + path.extname(file.originalname));
  }
});


// File filter function
const fileFilter = (req, file, cb) => {
  // Get allowed file types from environment or use default
  const allowedTypes = process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  }
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: `File size must be less than ${process.env.MAX_FILE_SIZE || '5MB'}`
      });
    }
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      message: err.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleMulterError
};
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

const REQUIRED_VARS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const usingCloudinaryUrl = !!process.env.CLOUDINARY_URL;
const missingVars = REQUIRED_VARS.filter((key) => !process.env[key]);

if (!usingCloudinaryUrl && missingVars.length) {
  console.warn(
    `⚠️  Cloudinary configuration incomplete. Missing: ${missingVars.join(', ')}. ` +
    'File uploads will fail until these environment variables are provided.'
  );
}

const cloudinaryConfig = { secure: true };

const configKeyMap = {
  CLOUDINARY_CLOUD_NAME: 'cloud_name',
  CLOUDINARY_API_KEY: 'api_key',
  CLOUDINARY_API_SECRET: 'api_secret',
};

Object.entries(configKeyMap).forEach(([envKey, configKey]) => {
  if (process.env[envKey]) {
    cloudinaryConfig[configKey] = process.env[envKey];
  }
});

cloudinary.config(cloudinaryConfig);

const storage = multer.memoryStorage();

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

const uploadBase = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB default
  },
});

const baseFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'uploads';

const resolveFolder = (req = {}) => {
  const url = (req.baseUrl || '').toLowerCase();
  if (url.includes('menu-slides')) return `${baseFolder}/menu-slides`;
  if (url.includes('menu')) return `${baseFolder}/menu`;
  if (url.includes('gallery')) return `${baseFolder}/gallery`;
  if (url.includes('notice')) return `${baseFolder}/notice`;
  if (url.includes('sauce')) return `${baseFolder}/sauces`;
  if (url.includes('catering')) return `${baseFolder}/catering`;
  return baseFolder;
};

const uploadToCloudinary = async (file, folder) => {
  const file64 = file.buffer?.toString('base64');
  if (!file64) {
    throw new Error('Unable to read uploaded file buffer');
  }

  const uploadOptions = {
    folder,
    resource_type: 'auto',
  };

  if (process.env.CLOUDINARY_UPLOAD_PRESET) {
    uploadOptions.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
  }

  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file64}`,
    uploadOptions,
  );

  return result;
};

const enrichFileWithCloudinaryData = (file, result) => {
  file.path = result.secure_url;
  file.filename = result.public_id;
  file.size = result.bytes;
  file.cloudinary = {
    publicId: result.public_id,
    version: result.version,
    format: result.format,
    resourceType: result.resource_type,
    url: result.secure_url,
  };
  delete file.buffer; // no longer needed and can be large
  return file;
};

const withCloudinary = (multerMiddleware, { isArray = false, isFields = false } = {}) => {
  return (req, res, next) => {
    multerMiddleware(req, res, async (err) => {
      if (err) return next(err);

      try {
        const folder = resolveFolder(req);

        if (!isArray && !isFields && req.file) {
          const uploaded = await uploadToCloudinary(req.file, folder);
          enrichFileWithCloudinaryData(req.file, uploaded);
        } else if (isArray && Array.isArray(req.files) && req.files.length) {
          const uploads = await Promise.all(
            req.files.map((file) => uploadToCloudinary(file, folder))
          );
          req.files = req.files.map((file, idx) => enrichFileWithCloudinaryData(file, uploads[idx]));
        } else if (isFields && req.files && typeof req.files === 'object') {
          const entries = Object.entries(req.files);
          for (const [key, list] of entries) {
            if (!Array.isArray(list)) continue;
            const uploads = await Promise.all(
              list.map((file) => uploadToCloudinary(file, folder))
            );
            req.files[key] = list.map((file, idx) => enrichFileWithCloudinaryData(file, uploads[idx]));
          }
        }

        next();
      } catch (uploadErr) {
        uploadErr.status = uploadErr.status || 400;
        next(uploadErr);
      }
    });
  };
};

const upload = {
  single(fieldName) {
    return withCloudinary(uploadBase.single(fieldName));
  },
  array(fieldName, maxCount) {
    return withCloudinary(uploadBase.array(fieldName, maxCount), { isArray: true });
  },
  fields(fieldConfig) {
    return withCloudinary(uploadBase.fields(fieldConfig), { isFields: true });
  },
  none() {
    return uploadBase.none();
  },
  any() {
    return withCloudinary(uploadBase.any(), { isArray: true });
  },
};

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

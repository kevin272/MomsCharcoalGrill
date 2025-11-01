#!/usr/bin/env node
/*
 * Script: migrateUploadsToCloudinary
 *
 * Scans the legacy BE/uploads directory, uploads any assets that are still
 * referenced in MongoDB documents to Cloudinary, and rewrites the database
 * fields to point at the secure Cloudinary URLs.  This allows an existing
 * installation to be moved from disk-based multer storage to Cloudinary
 * without losing historical content.
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');

const ESC = '\u001b[';
const RESET = `${ESC}0m`;
const colour = {
  cyan: (text) => `${ESC}36m${text}${RESET}`,
  green: (text) => `${ESC}32m${text}${RESET}`,
  yellow: (text) => `${ESC}33m${text}${RESET}`,
  red: (text) => `${ESC}31m${text}${RESET}`,
};

// Ensure environment variables from BE/.env are loaded if present
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const REQUIRED_VARS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'MONGODB_URI',
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(colour.red(`Missing required environment variables: ${missing.join(', ')}`));
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadsDir = path.join(__dirname, '..', 'uploads');
const baseFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'uploads';

const Gallery = require('../src/models/gallery');
const MenuSlide = require('../src/models/menuSlide');
const Notice = require('../src/models/notice');
const Sauce = require('../src/models/Sauce');
const CateringOption = require('../src/models/CateringOption');
const CateringPackage = require('../src/models/CateringPackage');
const MenuItem = require('../src/models/MenuItem');
const Order = require('../src/models/Order');

const cache = new Map();
const inFlight = new Map();

const stats = {
  uploaded: 0,
  skippedMissingFile: 0,
  skippedAlreadyCloud: 0,
  updatedDocs: 0,
  unchangedDocs: 0,
};

function normaliseValue(value) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Already absolute. If it does not include /uploads we still treat as migrated.
    if (trimmed.includes('/uploads/')) {
      const idx = trimmed.indexOf('/uploads/');
      return trimmed.slice(idx + '/uploads/'.length);
    }
    stats.skippedAlreadyCloud += 1;
    return null;
  }

  const unified = trimmed.replace(/\\/g, '/');
  const marker = 'uploads/';
  const idx = unified.indexOf(marker);
  if (idx === -1) return null;
  return unified.slice(idx + marker.length);
}

function fileExists(absolutePath) {
  try {
    fs.accessSync(absolutePath, fs.constants.F_OK);
    return true;
  } catch (_) {
    return false;
  }
}

async function uploadRelativePath(relativePath) {
  if (!relativePath) return null;

  if (cache.has(relativePath)) {
    return cache.get(relativePath);
  }

  if (inFlight.has(relativePath)) {
    return inFlight.get(relativePath);
  }

  const absolutePath = path.join(uploadsDir, relativePath);
  if (!fileExists(absolutePath)) {
    console.warn(colour.yellow(`Skipping missing file: ${relativePath}`));
    stats.skippedMissingFile += 1;
    return null;
  }

  const publicId = `${baseFolder}/${relativePath.replace(/\\/g, '/').replace(/\.[^/.]+$/, '')}`
    .replace(/\/+/g, '/');

  const promise = cloudinary.uploader
    .upload(absolutePath, {
      public_id: publicId,
      overwrite: true,
      resource_type: 'auto',
    })
    .then((result) => {
      stats.uploaded += 1;
      const payload = {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
      };
      cache.set(relativePath, payload);
      return payload;
    })
    .catch((error) => {
      console.error(colour.red(`Failed to upload ${relativePath}: ${error.message}`));
      throw error;
    })
    .finally(() => {
      inFlight.delete(relativePath);
    });

  inFlight.set(relativePath, promise);
  return promise;
}

function entry(value, setter) {
  const relativePath = normaliseValue(value);
  if (!relativePath) return null;
  return { relativePath, setter };
}

async function migrateModel({ Model, description, collect }) {
  const docs = await Model.find({}).exec();
  console.log(colour.cyan(`\n▶ Migrating ${description} (${docs.length} docs)`));

  for (const doc of docs) {
    const mutations = collect(doc).filter(Boolean);
    if (!mutations.length) {
      stats.unchangedDocs += 1;
      continue;
    }

    let changed = false;
    for (const { relativePath, setter } of mutations) {
      try {
        const uploaded = await uploadRelativePath(relativePath);
        if (uploaded?.url) {
          setter(uploaded.url);
          changed = true;
        }
      } catch (error) {
        console.error(colour.red(`Error migrating ${description} for doc ${doc._id}: ${error.message}`));
      }
    }

    if (changed) {
      await doc.save();
      stats.updatedDocs += 1;
    } else {
      stats.unchangedDocs += 1;
    }
  }
}

async function run() {
  if (!fs.existsSync(uploadsDir)) {
    console.log(colour.green('No legacy uploads directory found. Nothing to migrate.'));
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(colour.green('✅ Connected to MongoDB'));

  const tasks = [
    {
      Model: Gallery,
      description: 'Gallery.image',
      collect: (doc) => [
        entry(doc.image, (url) => { doc.image = url; }),
      ],
    },
    {
      Model: MenuSlide,
      description: 'MenuSlide.image',
      collect: (doc) => [
        entry(doc.image, (url) => { doc.image = url; }),
      ],
    },
    {
      Model: Notice,
      description: 'Notice.imageUrl',
      collect: (doc) => [
        entry(doc.imageUrl, (url) => { doc.imageUrl = url; }),
      ],
    },
    {
      Model: Sauce,
      description: 'Sauce.image',
      collect: (doc) => [
        entry(doc.image, (url) => { doc.image = url; }),
      ],
    },
    {
      Model: CateringOption,
      description: 'CateringOption.image',
      collect: (doc) => [
        entry(doc.image, (url) => { doc.image = url; }),
      ],
    },
    {
      Model: CateringPackage,
      description: 'CateringPackage.image',
      collect: (doc) => [
        entry(doc.image, (url) => { doc.image = url; }),
      ],
    },
    {
      Model: MenuItem,
      description: 'MenuItem.image',
      collect: (doc) => [
        entry(doc.image, (url) => { doc.image = url; }),
      ],
    },
    {
      Model: Order,
      description: 'Order.items.image',
      collect: (doc) => (Array.isArray(doc.items) ? doc.items : []).map((item, idx) =>
        entry(item.image, (url) => { doc.items[idx].image = url; })
      ),
    },
  ];

  for (const task of tasks) {
    await migrateModel(task);
  }

  await mongoose.disconnect();

  console.log(colour.green('\nMigration complete!'));
  console.table(stats);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

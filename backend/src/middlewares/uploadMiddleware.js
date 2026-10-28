import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/appError.js';
import { config } from '../config/environment.js';

// 🌟 Safe Storage Resolution for Serverless Containers (Vercel uses /tmp)
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const uploadDir = isProduction 
  ? '/tmp' 
  : path.resolve(config.uploads.path || './uploads');

// Only attempt to provision physical static folders when hosting locally
if (!isProduction && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `file-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Only valid image files (JPEG, PNG, WEBP) are allowed', 400), false);
  }
};

export const uploadSingleImage = (fieldName = 'image') => {
  return multer({
    storage,
    limits: {
      fileSize: (config.uploads?.maxFileSizeMb || 5) * 1024 * 1024
    },
    fileFilter
  }).single(fieldName);
};

export const uploadMultipleImages = (fieldName = 'images', maxCount = 5) => {
  return multer({
    storage,
    limits: {
      fileSize: (config.uploads?.maxFileSizeMb || 5) * 1024 * 1024
    },
    fileFilter
  }).array(fieldName, maxCount);
};

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/appError.js';
import { config } from '../config/environment.js';

// Ensure upload directories exist
const uploadDir = path.resolve(config.uploads.path);
if (!fs.existsSync(uploadDir)) {
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
      fileSize: config.uploads.maxFileSizeMb * 1024 * 1024
    },
    fileFilter
  }).single(fieldName);
};

export const uploadMultipleImages = (fieldName = 'images', maxCount = 5) => {
  return multer({
    storage,
    limits: {
      fileSize: config.uploads.maxFileSizeMb * 1024 * 1024
    },
    fileFilter
  }).array(fieldName, maxCount);
};

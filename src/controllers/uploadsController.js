const path = require('path');
const multer = require('multer');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { uploadDir, baseUrl, uploadMaxFileSizeMb } = require('../config/env');

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf'
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const basename = path
      .basename(file.originalname || 'file', extension)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const safeName = `${Date.now()}-${basename || 'file'}${extension}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: uploadMaxFileSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Unsupported file type');
      error.status = 400;
      return cb(error);
    }
    return cb(null, true);
  }
});

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) return sendError(res, 'file is required', 400);
  const relativePath = path.posix.join('uploads', req.file.filename);
  const urlBase = baseUrl || `${req.protocol}://${req.get('host')}`;
  const url = `${urlBase}/${relativePath}`;
  return sendSuccess(res, { file: { path: relativePath, url } }, 'Uploaded');
});

module.exports = { upload, uploadFile };

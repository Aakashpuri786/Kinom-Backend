const path = require('path');
const multer = require('multer');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { uploadDir, baseUrl } = require('../config/env');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname}`.replace(/\s+/g, '-');
    cb(null, safeName);
  }
});

const upload = multer({ storage });

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) return sendError(res, 'file is required', 400);
  const relativePath = path.posix.join('uploads', req.file.filename);
  const urlBase = baseUrl || `${req.protocol}://${req.get('host')}`;
  const url = `${urlBase}/${relativePath}`;
  return sendSuccess(res, { file: { path: relativePath, url } }, 'Uploaded');
});

module.exports = { upload, uploadFile };

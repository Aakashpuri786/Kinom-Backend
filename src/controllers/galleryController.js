const GalleryItem = require('../models/GalleryItem');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination } = require('../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await GalleryItem.find().skip(skip).limit(limit).sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const getById = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);
  if (!item) return sendError(res, 'Gallery item not found', 404);
  return sendSuccess(res, { item });
});

const create = asyncHandler(async (req, res) => {
  const { title, imageUrl, description, date } = req.body || {};
  if (!title || !imageUrl) return sendError(res, 'title and imageUrl are required', 400);
  const item = await GalleryItem.create({ title, imageUrl, description, date });
  return sendSuccess(res, { item }, 'Created');
});

const update = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findByIdAndUpdate(req.params.id, { $set: req.body || {} }, { new: true });
  if (!item) return sendError(res, 'Gallery item not found', 404);
  return sendSuccess(res, { item }, 'Updated');
});

const remove = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findByIdAndDelete(req.params.id);
  if (!item) return sendError(res, 'Gallery item not found', 404);
  return sendSuccess(res, { item }, 'Deleted');
});

module.exports = { list, getById, create, update, remove };

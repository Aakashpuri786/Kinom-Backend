const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination } = require('../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await Contact.find().skip(skip).limit(limit).sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const getById = asyncHandler(async (req, res) => {
  const item = await Contact.findById(req.params.id);
  if (!item) return sendError(res, 'Contact not found', 404);
  return sendSuccess(res, { item });
});

const create = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return sendError(res, 'name, email, message are required', 400);
  }
  const item = await Contact.create({ name, email, subject, message });
  return sendSuccess(res, { item }, 'Created');
});

const update = asyncHandler(async (req, res) => {
  const item = await Contact.findByIdAndUpdate(req.params.id, { $set: req.body || {} }, { new: true });
  if (!item) return sendError(res, 'Contact not found', 404);
  return sendSuccess(res, { item }, 'Updated');
});

const remove = asyncHandler(async (req, res) => {
  const item = await Contact.findByIdAndDelete(req.params.id);
  if (!item) return sendError(res, 'Contact not found', 404);
  return sendSuccess(res, { item }, 'Deleted');
});

module.exports = { list, getById, create, update, remove };

const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination } = require('../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await Order.find({ buyerId: req.user._id }).skip(skip).limit(limit).sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const create = asyncHandler(async (req, res) => {
  const { items = [], total = 0, sellerId } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return sendError(res, 'items are required', 400);
  }

  const order = await Order.create({ buyerId: req.user._id, items, total, sellerId });
  return sendSuccess(res, { order }, 'Created');
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!status) return sendError(res, 'status is required', 400);

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, buyerId: req.user._id },
    { status },
    { new: true }
  );
  if (!order) return sendError(res, 'Order not found', 404);
  return sendSuccess(res, { order }, 'Updated');
});

const remove = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndDelete({ _id: req.params.id, buyerId: req.user._id });
  if (!order) return sendError(res, 'Order not found', 404);
  return sendSuccess(res, { order }, 'Deleted');
});

module.exports = { list, create, updateStatus, remove };

const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination } = require('../utils/pagination');

const cancellableStatuses = new Set(['pending']);

const list = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await Order.find({ buyerId: req.user._id }).skip(skip).limit(limit).sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const create = asyncHandler(async (req, res) => {
  const { items = [] } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return sendError(res, 'items are required', 400);
  }

  const mergedItems = new Map();
  for (const item of items) {
    if (!item || !item.productId) return sendError(res, 'Each item must include productId', 400);
    const key = String(item.productId);
    const quantity = Math.max(Number(item.quantity) || 1, 1);
    const existing = mergedItems.get(key);
    mergedItems.set(key, {
      productId: key,
      quantity: existing ? existing.quantity + quantity : quantity
    });
  }

  const normalizedItems = Array.from(mergedItems.values());
  const productIds = normalizedItems.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, status: 'active' });
  if (products.length !== normalizedItems.length) {
    return sendError(res, 'One or more products are invalid or inactive', 400);
  }

  const productsById = new Map(products.map((product) => [product._id.toString(), product]));
  const sellerIds = new Set(products.map((product) => product.sellerId.toString()));
  if (sellerIds.size !== 1) {
    return sendError(res, 'Orders must contain products from one seller only', 400);
  }

  const total = normalizedItems.reduce((sum, item) => {
    const product = productsById.get(String(item.productId));
    return sum + product.price * item.quantity;
  }, 0);

  const order = await Order.create({
    buyerId: req.user._id,
    items: normalizedItems,
    total,
    sellerId: products[0].sellerId
  });
  return sendSuccess(res, { order }, 'Created');
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!status) return sendError(res, 'status is required', 400);
  if (status !== 'cancelled') {
    return sendError(res, 'Users can only cancel their own orders', 400);
  }

  const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id });
  if (!order) return sendError(res, 'Order not found', 404);
  if (!cancellableStatuses.has(order.status)) {
    return sendError(res, `Order cannot be cancelled from status "${order.status}"`, 400);
  }

  order.status = 'cancelled';
  await order.save();
  return sendSuccess(res, { order }, 'Updated');
});

const remove = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndDelete({ _id: req.params.id, buyerId: req.user._id });
  if (!order) return sendError(res, 'Order not found', 404);
  return sendSuccess(res, { order }, 'Deleted');
});

module.exports = { list, create, updateStatus, remove };

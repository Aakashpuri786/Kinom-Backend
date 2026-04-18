const Product = require('../models/Product');
const SellerAccount = require('../models/SellerAccount');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination } = require('../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const filter = { status: 'active' };
  if (req.query.category) filter.category = String(req.query.category).trim();
  const items = await Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const listMy = asyncHandler(async (req, res) => {
  const seller = await SellerAccount.findOne({ userId: req.user._id });
  if (!seller) return sendError(res, 'Seller account required', 403);
  const { limit, skip, page } = getPagination(req);
  const items = await Product.find({ sellerId: seller._id }).skip(skip).limit(limit).sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const listAll = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await Product.find().skip(skip).limit(limit).sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const getById = asyncHandler(async (req, res) => {
  const item = await Product.findOne({ _id: req.params.id, status: 'active' });
  if (!item) return sendError(res, 'Product not found', 404);
  return sendSuccess(res, { item });
});

const create = asyncHandler(async (req, res) => {
  const seller = await SellerAccount.findOne({ userId: req.user._id });
  if (!seller) return sendError(res, 'Seller account required', 403);
  if (!seller.verified) return sendError(res, 'Verified seller account required', 403);

  const payload = req.body || {};
  if (payload.price === undefined || Number(payload.price) <= 0) {
    return sendError(res, 'Valid price is required', 400);
  }

  const item = await Product.create({
    imageUrl: payload.imageUrl || '',
    moneyValue: payload.moneyValue || '',
    price: Number(payload.price),
    category: payload.category || '',
    symbol: payload.symbol || '',
    dob: payload.dob || '',
    description: payload.description || '',
    status: payload.status === 'inactive' ? 'inactive' : 'active',
    sellerId: seller._id
  });
  return sendSuccess(res, { item }, 'Created');
});

const update = asyncHandler(async (req, res) => {
  const seller = await SellerAccount.findOne({ userId: req.user._id });
  if (!seller) return sendError(res, 'Seller account required', 403);

  const updateData = { ...req.body };
  delete updateData.sellerId;
  if (updateData.price !== undefined) {
    if (Number(updateData.price) <= 0) return sendError(res, 'Valid price is required', 400);
    updateData.price = Number(updateData.price);
  }

  const item = await Product.findOneAndUpdate(
    { _id: req.params.id, sellerId: seller._id },
    { $set: updateData },
    { new: true }
  );
  if (!item) return sendError(res, 'Product not found', 404);
  return sendSuccess(res, { item }, 'Updated');
});

const remove = asyncHandler(async (req, res) => {
  const seller = await SellerAccount.findOne({ userId: req.user._id });
  if (!seller) return sendError(res, 'Seller account required', 403);

  const item = await Product.findOneAndDelete({ _id: req.params.id, sellerId: seller._id });
  if (!item) return sendError(res, 'Product not found', 404);
  return sendSuccess(res, { item }, 'Deleted');
});

module.exports = { list, listMy, listAll, getById, create, update, remove };

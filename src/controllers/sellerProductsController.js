const Product = require('../models/Product');
const SellerAccount = require('../models/SellerAccount');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination } = require('../utils/pagination');

const ALLOWED_CATEGORIES = new Set(['dob', 'unique symbol', 'old money']);
const normalizeStatus = (value) => {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'active') return 'available';
  if (status === 'inactive') return 'removed';
  if (['available', 'processing', 'sold', 'removed'].includes(status)) return status;
  return 'available';
};

const normalizeSellerAccount = (account) => {
  if (!account) return null;
  const source = typeof account.toObject === 'function' ? account.toObject() : account;
  return {
    _id: source._id,
    user: source.userId || source.user || null,
    userId: source.userId || source.user || null,
    email: source.email || '',
    profileImage: source.profileImage || '',
    fullName: source.fullName || '',
    phoneNumber: source.phoneNumber || '',
    address: source.address || '',
    zipCode: source.zipCode || '',
    isVerified: Boolean(source.verified),
    verified: Boolean(source.verified),
    verifiedAt: source.verifiedAt || null,
    createdAt: source.createdAt || null,
    updatedAt: source.updatedAt || null
  };
};

const normalizeProduct = (item) => {
  if (!item) return null;
  const source = typeof item.toObject === 'function' ? item.toObject() : item;
  const sellerAccount = normalizeSellerAccount(source.sellerId);

  return {
    ...source,
    sellerAccount,
    sellerName: sellerAccount?.fullName || 'Unknown Seller',
    email: sellerAccount?.email || '',
    status: normalizeStatus(source.status)
  };
};

const ensureSellerAccount = async (userId) => {
  const seller = await SellerAccount.findOne({ userId });
  if (!seller) return { error: 'Seller account required', status: 403 };
  if (!seller.verified) return { error: 'Seller OTP not verified', status: 403 };
  return { seller };
};

const validateProductPayload = (payload) => {
  const moneyValue = Number(payload.moneyValue);
  const price = Number(payload.price);
  const category = String(payload.category || '').trim().toLowerCase();
  const symbol = String(payload.symbol || '').trim();
  const dob = String(payload.dob || '').trim();

  if (!Number.isFinite(moneyValue) || moneyValue <= 0) {
    return 'Money value is required';
  }
  if (!Number.isFinite(price) || price <= 0) {
    return 'Price is required';
  }
  if (!ALLOWED_CATEGORIES.has(category)) {
    return 'Invalid category';
  }
  if (!symbol) {
    return 'Symbol is required';
  }
  if (category === 'dob' && !/^\d{4}\/\d{2}\/\d{2}$/.test(dob)) {
    return 'DOB must be in Bikram Sambhat format YYYY/MM/DD';
  }
  return '';
};

const list = asyncHandler(async (req, res) => {
  const { limit, skip } = getPagination(req);
  const filter = { status: { $nin: ['removed', 'inactive'] } };
  if (req.query.category) filter.category = String(req.query.category).trim().toLowerCase();

  const items = await Product.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate('sellerId');

  return sendSuccess(res, items.map(normalizeProduct));
});

const listMy = asyncHandler(async (req, res) => {
  const seller = await SellerAccount.findOne({ userId: req.user._id });
  if (!seller) return sendSuccess(res, []);

  const { limit, skip } = getPagination(req);
  const items = await Product.find({ sellerId: seller._id })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate('sellerId');

  return sendSuccess(res, items.map(normalizeProduct));
});

const listAll = asyncHandler(async (req, res) => {
  const { limit, skip } = getPagination(req);
  const items = await Product.find({})
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate('sellerId');

  return sendSuccess(res, items.map(normalizeProduct));
});

const getById = asyncHandler(async (req, res) => {
  const item = await Product.findById(req.params.id).populate('sellerId');
  if (!item || ['removed', 'inactive'].includes(normalizeStatus(item.status))) {
    return sendError(res, 'Product not found', 404);
  }

  return sendSuccess(res, normalizeProduct(item));
});

const create = asyncHandler(async (req, res) => {
  const { seller, error, status } = await ensureSellerAccount(req.user._id);
  if (!seller) return sendError(res, error, status);

  const validationError = validateProductPayload(req.body || {});
  if (validationError) return sendError(res, validationError, 400);

  const item = await Product.create({
    sellerId: seller._id,
    imageUrl: String(req.body.imageUrl || '').trim(),
    moneyValue: Number(req.body.moneyValue),
    price: Number(req.body.price),
    category: String(req.body.category || '').trim().toLowerCase(),
    symbol: String(req.body.symbol || '').trim(),
    dob: String(req.body.category || '').trim().toLowerCase() === 'dob' ? String(req.body.dob || '').trim() : '',
    description: String(req.body.description || '').trim(),
    status: 'available'
  });

  const populated = await Product.findById(item._id).populate('sellerId');
  return sendSuccess(res, normalizeProduct(populated), 'Created');
});

const update = asyncHandler(async (req, res) => {
  const { seller, error, status } = await ensureSellerAccount(req.user._id);
  if (!seller) return sendError(res, error, status);

  const product = await Product.findOne({ _id: req.params.id, sellerId: seller._id });
  if (!product) return sendError(res, 'Product not found', 404);

  const nextPayload = {
    imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : product.imageUrl,
    moneyValue: req.body.moneyValue !== undefined ? req.body.moneyValue : product.moneyValue,
    price: req.body.price !== undefined ? req.body.price : product.price,
    category: req.body.category !== undefined ? req.body.category : product.category,
    symbol: req.body.symbol !== undefined ? req.body.symbol : product.symbol,
    dob: req.body.dob !== undefined ? req.body.dob : product.dob,
    description: req.body.description !== undefined ? req.body.description : product.description
  };

  const validationError = validateProductPayload(nextPayload);
  if (validationError) return sendError(res, validationError, 400);

  product.imageUrl = String(nextPayload.imageUrl || '').trim();
  product.moneyValue = Number(nextPayload.moneyValue);
  product.price = Number(nextPayload.price);
  product.category = String(nextPayload.category || '').trim().toLowerCase();
  product.symbol = String(nextPayload.symbol || '').trim();
  product.dob = product.category === 'dob' ? String(nextPayload.dob || '').trim() : '';
  product.description = String(nextPayload.description || '').trim();
  product.status = normalizeStatus(product.status);
  await product.save();

  const populated = await Product.findById(product._id).populate('sellerId');
  return sendSuccess(res, normalizeProduct(populated), 'Updated');
});

const remove = asyncHandler(async (req, res) => {
  const seller = await SellerAccount.findOne({ userId: req.user._id });
  if (!seller) return sendError(res, 'Seller account required', 403);

  const item = await Product.findOne({ _id: req.params.id, sellerId: seller._id }).populate('sellerId');
  if (!item) return sendError(res, 'Product not found', 404);

  item.status = 'removed';
  await item.save();
  return sendSuccess(res, { id: req.params.id }, 'Deleted');
});

module.exports = { list, listMy, listAll, getById, create, update, remove };

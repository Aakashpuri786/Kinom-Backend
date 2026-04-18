const Order = require('../models/Order');
const Product = require('../models/Product');
const SellerAccount = require('../models/SellerAccount');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination } = require('../utils/pagination');

const normalizeStatus = (value) => {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'active') return 'available';
  if (status === 'inactive') return 'removed';
  return status;
};

const formatOrder = (order) => {
  const source = typeof order.toObject === 'function' ? order.toObject() : order;
  const item = source.items?.[0] || {};
  const product = item.productId || {};
  const buyer = source.buyerId || {};
  const seller = source.sellerId || {};

  return {
    id: String(source._id),
    _id: source._id,
    productId: String(product._id || item.productId || ''),
    productName: `Rs. ${Number(product.moneyValue || 0).toLocaleString()} Note`,
    amount: Number(source.total || product.price || 0),
    buyerName: buyer.name || 'Buyer',
    buyerEmail: buyer.email || '',
    sellerName: seller.fullName || 'Seller',
    sellerEmail: seller.email || '',
    status: String(source.status || 'pending').toLowerCase(),
    date: source.createdAt
  };
};

const loadOrders = (query, { limit, skip }) =>
  Order.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate('buyerId', 'name email')
    .populate('sellerId', 'userId fullName email')
    .populate('items.productId', 'moneyValue price category status symbol imageUrl');

const list = asyncHandler(async (req, res) => {
  const { limit, skip } = getPagination(req);
  const view = String(req.query.view || 'buyer').trim().toLowerCase();
  const status = String(req.query.status || '').trim().toLowerCase();
  const seller = await SellerAccount.findOne({ userId: req.user._id }).select('_id');

  const query = {};
  if (view === 'seller') {
    if (!seller) return sendSuccess(res, []);
    query.sellerId = seller._id;
  } else if (view === 'all') {
    query.$or = seller ? [{ buyerId: req.user._id }, { sellerId: seller._id }] : [{ buyerId: req.user._id }];
  } else {
    query.buyerId = req.user._id;
  }
  if (['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
    query.status = status;
  }

  const items = await loadOrders(query, { limit, skip });
  return sendSuccess(res, items.map(formatOrder));
});

const create = asyncHandler(async (req, res) => {
  const requestedProductId = String(req.body.productId || req.body.items?.[0]?.productId || '').trim();
  if (!requestedProductId) {
    return sendError(res, 'Product id is required', 400);
  }

  const product = await Product.findById(requestedProductId).populate('sellerId');
  if (!product || ['removed', 'inactive'].includes(normalizeStatus(product.status))) {
    return sendError(res, 'Product not found', 404);
  }

  const seller = product.sellerId;
  if (!seller) return sendError(res, 'Seller account not found for this product', 400);
  if (String(seller.userId) === String(req.user._id)) {
    return sendError(res, 'You cannot buy your own product listing', 403);
  }

  const productStatus = normalizeStatus(product.status);
  if (productStatus === 'sold') {
    return sendError(res, 'This product is already sold', 409);
  }
  if (productStatus === 'processing') {
    return sendError(res, 'This product is already in processing', 409);
  }

  const existing = await Order.findOne({
    buyerId: req.user._id,
    'items.productId': product._id,
    status: { $in: ['pending', 'processing'] }
  }).select('_id');
  if (existing) {
    return sendError(res, 'Order request already exists for this product', 409);
  }

  const order = await Order.create({
    buyerId: req.user._id,
    sellerId: seller._id,
    items: [{ productId: product._id, quantity: 1 }],
    status: 'pending',
    total: Number(product.price || 0)
  });

  product.status = 'processing';
  await product.save();

  const populated = await Order.findById(order._id)
    .populate('buyerId', 'name email')
    .populate('sellerId', 'userId fullName email')
    .populate('items.productId', 'moneyValue price category status symbol imageUrl');

  return sendSuccess(res, formatOrder(populated), 'Created');
});

const updateStatus = asyncHandler(async (req, res) => {
  const nextStatus = String(req.body.status || '').trim().toLowerCase();
  if (!['processing', 'completed', 'cancelled'].includes(nextStatus)) {
    return sendError(res, 'Invalid status update', 400);
  }

  const order = await Order.findById(req.params.id)
    .populate('buyerId', 'name email')
    .populate('sellerId', 'userId fullName email')
    .populate('items.productId', 'moneyValue price category status symbol imageUrl');
  if (!order) return sendError(res, 'Order not found', 404);

  const product = order.items?.[0]?.productId;
  const isBuyer = String(order.buyerId?._id || order.buyerId) === String(req.user._id);
  const isSeller = String(order.sellerId?.userId || '') === String(req.user._id);

  if (nextStatus === 'processing') {
    if (!isSeller) return sendError(res, 'Only seller can accept this order', 403);
    if (String(order.status) !== 'pending') {
      return sendError(res, 'Only pending orders can be accepted', 400);
    }
    order.status = 'processing';
    await order.save();
    if (product) {
      await Product.updateOne({ _id: product._id }, { $set: { status: 'processing' } });
    }
    return sendSuccess(res, formatOrder(order), 'Updated');
  }

  if (nextStatus === 'completed') {
    if (!isBuyer) return sendError(res, 'Only buyer can mark order as received', 403);
    if (String(order.status) !== 'processing') {
      return sendError(res, 'Only processing orders can be completed', 400);
    }
    order.status = 'completed';
    await order.save();
    if (product) {
      await Product.updateOne({ _id: product._id }, { $set: { status: 'sold' } });
    }
    return sendSuccess(res, formatOrder(order), 'Updated');
  }

  if (!isBuyer && !isSeller) return sendError(res, 'Forbidden', 403);
  order.status = 'cancelled';
  await order.save();
  if (product && normalizeStatus(product.status) !== 'sold') {
    await Product.updateOne({ _id: product._id }, { $set: { status: 'available' } });
  }
  return sendSuccess(res, formatOrder(order), 'Updated');
});

const remove = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('sellerId', 'userId');
  if (!order) return sendError(res, 'Order not found', 404);

  const isBuyer = String(order.buyerId) === String(req.user._id);
  const isSeller = String(order.sellerId?.userId || '') === String(req.user._id);
  if (!isBuyer && !isSeller) return sendError(res, 'Forbidden', 403);

  const productId = order.items?.[0]?.productId;
  await Order.deleteOne({ _id: order._id });

  if (productId) {
    const remaining = await Order.findOne({
      'items.productId': productId,
      status: { $in: ['pending', 'processing'] }
    }).select('_id');
    if (!remaining) {
      await Product.updateOne(
        { _id: productId, status: { $ne: 'sold' } },
        { $set: { status: 'available' } }
      );
    }
  }

  return sendSuccess(res, { id: req.params.id }, 'Deleted');
});

module.exports = { list, create, updateStatus, remove };

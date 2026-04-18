const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');

const normalizeStatus = (value) => {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'active') return 'available';
  if (status === 'inactive') return 'removed';
  return status;
};

const formatCartItems = (cart) =>
  (cart?.items || [])
    .filter((item) => item.productId)
    .map((item) => {
      const product = item.productId;
      const sellerAccount = product?.sellerId
        ? {
            _id: product.sellerId._id,
            user: product.sellerId.userId || null,
            userId: product.sellerId.userId || null,
            email: product.sellerId.email || '',
            fullName: product.sellerId.fullName || '',
            profileImage: product.sellerId.profileImage || ''
          }
        : null;

      return {
        id: String(product._id),
        cartItemId: `${cart._id}:${product._id}`,
        quantity: Number(item.quantity || 1),
        name: `Rs. ${Number(product.moneyValue || 0).toLocaleString()} Note`,
        dob: product.dob || '-',
        price: Number(product.price || 0),
        imageUrl: product.imageUrl || '',
        symbol: product.symbol || '',
        category: product.category || '',
        sellerName: sellerAccount?.fullName || '',
        sellerUserId: String(sellerAccount?.user || ''),
        sellerAccountId: String(sellerAccount?._id || ''),
        sellerEmail: String(sellerAccount?.email || ''),
        status: normalizeStatus(product.status || 'available')
      };
    });

const loadCart = async (userId) =>
  Cart.findOne({ userId })
    .populate({
      path: 'items.productId',
      populate: { path: 'sellerId' }
    });

const getCart = asyncHandler(async (req, res) => {
  let cart = await loadCart(req.user._id);
  if (!cart) {
    cart = await Cart.create({ userId: req.user._id, items: [] });
    cart = await loadCart(req.user._id);
  }

  return sendSuccess(res, formatCartItems(cart));
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  if (!productId) return sendError(res, 'productId is required', 400);

  const product = await Product.findById(productId);
  if (!product || ['removed', 'inactive'].includes(normalizeStatus(product.status))) {
    return sendError(res, 'Product not found', 404);
  }
  if (normalizeStatus(product.status) === 'sold') {
    return sendError(res, 'Sold product cannot be added to cart', 400);
  }

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });

  const existing = cart.items.find((item) => String(item.productId) === String(productId));
  if (existing) {
    existing.quantity = Math.max(Number(quantity) || 1, 1);
  } else {
    cart.items.push({ productId, quantity: Math.max(Number(quantity) || 1, 1) });
  }

  await cart.save();
  return sendSuccess(
    res,
    {
      cartItemId: `${cart._id}:${product._id}`,
      id: String(product._id),
      quantity: Math.max(Number(quantity) || 1, 1)
    },
    'Updated'
  );
});

const removeItem = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return sendError(res, 'Cart not found', 404);

  cart.items = cart.items.filter((item) => String(item.productId) !== String(productId));
  await cart.save();
  return sendSuccess(res, { productId }, 'Updated');
});

const clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });
  cart.items = [];
  await cart.save();
  return sendSuccess(res, { cleared: true }, 'Cleared');
});

module.exports = { getCart, addToCart, removeItem, clearCart };

const Cart = require('../models/Cart');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });
  return sendSuccess(res, { cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  if (!productId) return sendError(res, 'productId is required', 400);

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });

  const existing = cart.items.find((i) => i.productId.toString() === productId);
  if (existing) {
    existing.quantity += Number(quantity || 1);
  } else {
    cart.items.push({ productId, quantity: Number(quantity || 1) });
  }

  await cart.save();
  return sendSuccess(res, { cart }, 'Updated');
});

const removeItem = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return sendError(res, 'Cart not found', 404);

  cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
  await cart.save();
  return sendSuccess(res, { cart }, 'Updated');
});

const clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });
  cart.items = [];
  await cart.save();
  return sendSuccess(res, { cart }, 'Cleared');
});

module.exports = { getCart, addToCart, removeItem, clearCart };

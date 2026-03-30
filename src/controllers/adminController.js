const User = require('../models/User');
const SellerAccount = require('../models/SellerAccount');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Conversation = require('../models/Conversation');
const ChatProfile = require('../models/ChatProfile');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination } = require('../utils/pagination');

const dashboard = asyncHandler(async (req, res) => {
  const [users, sellers, products, orders, chats] = await Promise.all([
    User.countDocuments(),
    SellerAccount.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Conversation.countDocuments()
  ]);
  return sendSuccess(res, { users, sellers, products, orders, chats });
});

const listProducts = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await Product.find().skip(skip).limit(limit).sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const listSellers = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await SellerAccount.find().skip(skip).limit(limit).sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const getSeller = asyncHandler(async (req, res) => {
  const item = await SellerAccount.findById(req.params.id);
  if (!item) return sendError(res, 'Seller not found', 404);
  return sendSuccess(res, { item });
});

const listCarts = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await Cart.find().skip(skip).limit(limit).sort({ updatedAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const usersByProductInCart = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const carts = await Cart.find({ 'items.productId': productId }).populate('userId', 'name email');
  return sendSuccess(res, { items: carts });
});

const listUsers = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await User.find().skip(skip).limit(limit).sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const getUser = asyncHandler(async (req, res) => {
  const item = await User.findById(req.params.id);
  if (!item) return sendError(res, 'User not found', 404);
  return sendSuccess(res, { item });
});

const listChats = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await Conversation.find().skip(skip).limit(limit).sort({ updatedAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const listChatProfiles = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await ChatProfile.find().skip(skip).limit(limit).sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const listActiveChatProfiles = asyncHandler(async (req, res) => {
  const items = await ChatProfile.find({ status: 'active' }).sort({ createdAt: -1 });
  return sendSuccess(res, { items });
});

const getChatProfileByUsername = asyncHandler(async (req, res) => {
  const username = String(req.params.username || '').toLowerCase();
  const item = await ChatProfile.findOne({ username });
  if (!item) return sendError(res, 'Chat profile not found', 404);
  return sendSuccess(res, { item });
});

module.exports = {
  dashboard,
  listProducts,
  listSellers,
  getSeller,
  listCarts,
  usersByProductInCart,
  listUsers,
  getUser,
  listChats,
  listChatProfiles,
  listActiveChatProfiles,
  getChatProfileByUsername
};

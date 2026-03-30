const Order = require('../models/Order');
const Post = require('../models/Post');
const Cart = require('../models/Cart');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const overview = asyncHandler(async (req, res) => {
  const [orders, posts, cart] = await Promise.all([
    Order.countDocuments({ buyerId: req.user._id }),
    Post.countDocuments({ authorId: req.user._id }),
    Cart.findOne({ userId: req.user._id })
  ]);

  const cartItems = cart ? cart.items.length : 0;
  return sendSuccess(res, { orders, posts, cartItems });
});

module.exports = { overview };

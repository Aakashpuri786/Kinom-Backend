const express = require('express');

const authRoutes = require('./auth.routes');
const adminAuthRoutes = require('./adminAuth.routes');
const adminRoutes = require('./admin.routes');
const chatRoutes = require('./chat.routes');
const sellerAccountRoutes = require('./sellerAccount.routes');
const sellerProductsRoutes = require('./sellerProducts.routes');
const ordersRoutes = require('./orders.routes');
const cartRoutes = require('./cart.routes');
const dashboardRoutes = require('./dashboard.routes');
const contactRoutes = require('./contact.routes');
const galleryRoutes = require('./gallery.routes');
const postsRoutes = require('./posts.routes');
const reviewsRoutes = require('./reviews.routes');
const uploadsRoutes = require('./uploads.routes');
const healthRoutes = require('./health.routes');

const User = require('../models/User');

const router = express.Router();

// Debug route for user listing (Pretty-printed)
router.get('/users-list', async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash');
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.use('/auth', authRoutes);
router.use('/admin-auth', adminAuthRoutes);
router.use('/admin', adminRoutes);
router.use('/chat', chatRoutes);
router.use('/seller-account', sellerAccountRoutes);
router.use('/seller-products', sellerProductsRoutes);
router.use('/orders', ordersRoutes);
router.use('/cart', cartRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/contact', contactRoutes);
router.use('/gallery', galleryRoutes);
router.use('/posts', postsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/health', healthRoutes);

module.exports = router;

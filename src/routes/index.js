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
const { sendSuccess } = require('../utils/response');

const router = express.Router();

router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api`;

  const url = (path) => `${baseUrl}${path}`;

  return sendSuccess(res, {
    message: 'Kinom Backend API Index',
    baseUrl,
    docs: url('/docs'),
    publicEndpoints: {
      health: url('/health'),
      products: url('/seller-products'),
      productById: url('/seller-products/:id'),
      posts: url('/posts'),
      postById: url('/posts/:id'),
      gallery: url('/gallery'),
      galleryById: url('/gallery/:id'),
      reviews: url('/reviews'),
      reviewById: url('/reviews/:id'),
      contactCreate: url('/contact'),
      sellerPublicProfile: url('/seller-account/public/:id')
    },
    userAuthEndpoints: {
      register: url('/auth/register'),
      login: url('/auth/login'),
      me: url('/auth/me')
    },
    userProtectedEndpoints: {
      dashboard: url('/dashboard/overview'),
      cart: url('/cart'),
      orders: url('/orders'),
      sellerAccountMe: url('/seller-account/me'),
      sellerAccountEnsure: url('/seller-account/ensure'),
      sellerOtpRequest: url('/seller-account/request-otp'),
      sellerOtpVerify: url('/seller-account/verify-otp'),
      myProducts: url('/seller-products/my'),
      allProductsForSignedUser: url('/seller-products/all'),
      createProduct: url('/seller-products'),
      uploads: url('/uploads'),
      chatProfile: url('/chat/profile'),
      chatUsers: url('/chat/users/search?q=demo'),
      chatConversations: url('/chat/conversations')
    },
    adminAuthEndpoints: {
      login: url('/admin-auth/login'),
      verify: url('/admin-auth/verify'),
      me: url('/admin-auth/me')
    },
    adminProtectedEndpoints: {
      dashboard: url('/admin/dashboard'),
      users: url('/admin/users'),
      userById: url('/admin/users/:id'),
      sellers: url('/admin/sellers'),
      sellerById: url('/admin/sellers/:id'),
      products: url('/admin/products'),
      carts: url('/admin/carts'),
      chats: url('/admin/chats'),
      chatProfiles: url('/admin/chat-profiles'),
      activeChatProfiles: url('/admin/chat-profiles/active'),
      chatProfileByUsername: url('/admin/chat-profiles/username/:username'),
      supportIdentities: url('/admin/support-identities'),
      supportChatAccounts: url('/admin/support-chat-accounts'),
      contacts: url('/contact'),
      createReview: url('/reviews'),
      createGalleryItem: url('/gallery')
    },
    notes: [
      'Public endpoints can be opened directly in the browser.',
      'Protected endpoints require Authorization: Bearer <token>.',
      'Admin endpoints require an admin token.',
      'POST, PATCH, PUT, and DELETE endpoints should be called from Postman, frontend code, or curl.'
    ]
  });
});

router.get('/docs', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api`;
  return sendSuccess(res, {
    apiIndex: baseUrl,
    apiDocumentationFile: 'API.md',
    suggestedStartUrls: [
      `${baseUrl}/health`,
      `${baseUrl}/seller-products`,
      `${baseUrl}/posts`,
      `${baseUrl}/gallery`,
      `${baseUrl}/reviews`
    ]
  });
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

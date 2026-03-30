const express = require('express');
const {
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
} = require('../controllers/adminController');
const {
  listIdentities,
  createIdentity,
  switchIdentity,
  listSupportAccounts,
  createSupportAccount,
  switchSupportAccount,
  listConversations,
  startDirect,
  listMessages,
  sendMessage,
  broadcast
} = require('../controllers/supportController');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authAdmin);

router.get('/dashboard', dashboard);
router.get('/products', listProducts);
router.get('/sellers', listSellers);
router.get('/sellers/:id', getSeller);
router.get('/carts', listCarts);
router.get('/carts/product/:productId/users', usersByProductInCart);
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.get('/chats', listChats);
router.get('/chat-profiles', listChatProfiles);
router.get('/chat-profiles/active', listActiveChatProfiles);
router.get('/chat-profiles/username/:username', getChatProfileByUsername);

router.get('/support-identities', listIdentities);
router.post('/support-identities', createIdentity);
router.post('/support-identities/:id/switch', switchIdentity);

router.get('/support-chat-accounts', listSupportAccounts);
router.post('/support-chat-accounts', createSupportAccount);
router.post('/support-chat-accounts/:id/switch', switchSupportAccount);
router.get('/support-chat-accounts/:id/conversations', listConversations);
router.post('/support-chat-accounts/:id/start-direct', startDirect);
router.get('/support-chat-accounts/:id/conversations/:conversationId/messages', listMessages);
router.post('/support-chat-accounts/:id/conversations/:conversationId/messages', sendMessage);
router.post('/support-chat-accounts/:id/broadcast', broadcast);

module.exports = router;

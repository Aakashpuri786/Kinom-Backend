const express = require('express');
const {
  getProfile,
  usernameAvailable,
  createProfile,
  updateProfile,
  searchUsers,
  listConversations,
  createDirect,
  createGroup,
  listMessages,
  sendMessage,
  seen,
  updateMessage,
  deleteMessage,
  reactToMessage
} = require('../controllers/chatController');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.use(authUser);

router.get('/profile', getProfile);
router.get('/username-available', usernameAvailable);
router.post('/profile', createProfile);
router.patch('/profile', updateProfile);
router.get('/users/search', searchUsers);
router.get('/conversations', listConversations);
router.post('/conversations/direct', createDirect);
router.post('/conversations/group', createGroup);
router.get('/conversations/:id/messages', listMessages);
router.post('/conversations/:id/messages', sendMessage);
router.post('/conversations/:id/seen', seen);
router.patch('/messages/:id', updateMessage);
router.delete('/messages/:id', deleteMessage);
router.post('/messages/:id/reaction', reactToMessage);

module.exports = router;

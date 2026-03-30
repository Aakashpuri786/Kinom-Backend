const SupportIdentity = require('../models/SupportIdentity');
const SupportChatAccount = require('../models/SupportChatAccount');
const SupportConversation = require('../models/SupportConversation');
const SupportMessage = require('../models/SupportMessage');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination } = require('../utils/pagination');

const listIdentities = asyncHandler(async (req, res) => {
  const items = await SupportIdentity.find({ adminId: req.admin._id }).sort({ createdAt: -1 });
  return sendSuccess(res, { items });
});

const createIdentity = asyncHandler(async (req, res) => {
  const { displayName } = req.body || {};
  if (!displayName) return sendError(res, 'displayName is required', 400);
  const item = await SupportIdentity.create({ adminId: req.admin._id, displayName });
  return sendSuccess(res, { item }, 'Created');
});

const switchIdentity = asyncHandler(async (req, res) => {
  const identity = await SupportIdentity.findOne({ _id: req.params.id, adminId: req.admin._id });
  if (!identity) return sendError(res, 'Identity not found', 404);

  await SupportIdentity.updateMany({ adminId: req.admin._id }, { active: false });
  identity.active = true;
  await identity.save();

  return sendSuccess(res, { identity }, 'Switched');
});

const listSupportAccounts = asyncHandler(async (req, res) => {
  const items = await SupportChatAccount.find({ adminId: req.admin._id }).sort({ createdAt: -1 });
  return sendSuccess(res, { items });
});

const createSupportAccount = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  const item = await SupportChatAccount.create({ adminId: req.admin._id, status: status || 'online' });
  return sendSuccess(res, { item }, 'Created');
});

const switchSupportAccount = asyncHandler(async (req, res) => {
  const account = await SupportChatAccount.findOne({ _id: req.params.id, adminId: req.admin._id });
  if (!account) return sendError(res, 'Support account not found', 404);

  await SupportChatAccount.updateMany({ adminId: req.admin._id }, { active: false });
  account.active = true;
  await account.save();

  return sendSuccess(res, { account }, 'Switched');
});

const listConversations = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await SupportConversation.find({ supportAccountId: req.params.id })
    .skip(skip)
    .limit(limit)
    .sort({ updatedAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const startDirect = asyncHandler(async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return sendError(res, 'userId is required', 400);

  let convo = await SupportConversation.findOne({ supportAccountId: req.params.id, userId });
  if (!convo) {
    convo = await SupportConversation.create({ supportAccountId: req.params.id, userId });
  }

  return sendSuccess(res, { conversation: convo }, 'Ready');
});

const listMessages = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await SupportMessage.find({ conversationId: req.params.conversationId })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, senderType = 'admin' } = req.body || {};
  if (!content) return sendError(res, 'content is required', 400);
  const message = await SupportMessage.create({
    conversationId: req.params.conversationId,
    senderId: req.admin._id,
    senderType,
    content
  });
  return sendSuccess(res, { message }, 'Sent');
});

const broadcast = asyncHandler(async (req, res) => {
  const { content } = req.body || {};
  if (!content) return sendError(res, 'content is required', 400);

  const conversations = await SupportConversation.find({ supportAccountId: req.params.id });
  const messages = await SupportMessage.insertMany(
    conversations.map((c) => ({
      conversationId: c._id,
      senderId: req.admin._id,
      senderType: 'admin',
      content
    }))
  );

  return sendSuccess(res, { count: messages.length }, 'Broadcasted');
});

module.exports = {
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
};

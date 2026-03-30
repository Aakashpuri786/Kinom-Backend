const ChatProfile = require('../models/ChatProfile');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination } = require('../utils/pagination');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await ChatProfile.findOne({ userId: req.user._id });
  return sendSuccess(res, { profile });
});

const usernameAvailable = asyncHandler(async (req, res) => {
  const username = String(req.query.username || '').toLowerCase();
  if (!username) return sendError(res, 'username is required', 400);
  const exists = await ChatProfile.findOne({ username });
  return sendSuccess(res, { available: !exists });
});

const createProfile = asyncHandler(async (req, res) => {
  const { username, bio, avatar } = req.body || {};
  if (!username) return sendError(res, 'username is required', 400);
  const normalized = username.toLowerCase();
  const exists = await ChatProfile.findOne({ username: normalized });
  if (exists) return sendError(res, 'username not available', 409);

  const profile = await ChatProfile.findOneAndUpdate(
    { userId: req.user._id },
    { username: normalized, bio: bio || '', avatar: avatar || '' },
    { new: true, upsert: true }
  );

  return sendSuccess(res, { profile }, 'Created');
});

const updateProfile = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (update.username) update.username = update.username.toLowerCase();

  const profile = await ChatProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: update },
    { new: true }
  );
  if (!profile) return sendError(res, 'Profile not found', 404);
  return sendSuccess(res, { profile }, 'Updated');
});

const searchUsers = asyncHandler(async (req, res) => {
  const q = String(req.query.q || req.query.username || '').toLowerCase();
  const filter = q ? { username: { $regex: q, $options: 'i' } } : {};
  const { limit, skip, page } = getPagination(req);
  const items = await ChatProfile.find(filter).skip(skip).limit(limit);
  return sendSuccess(res, { items, page, limit });
});

const listConversations = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await Conversation.find({ participants: req.user._id })
    .skip(skip)
    .limit(limit)
    .sort({ updatedAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const createDirect = asyncHandler(async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return sendError(res, 'userId is required', 400);

  let convo = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [req.user._id, userId] },
    $expr: { $eq: [{ $size: '$participants' }, 2] }
  });

  if (!convo) {
    convo = await Conversation.create({ type: 'direct', participants: [req.user._id, userId] });
  }

  return sendSuccess(res, { conversation: convo }, 'Ready');
});

const createGroup = asyncHandler(async (req, res) => {
  const { name, participants = [] } = req.body || {};
  const unique = Array.from(new Set([req.user._id.toString(), ...participants]));
  if (unique.length < 2) return sendError(res, 'participants required', 400);

  const convo = await Conversation.create({
    type: 'group',
    name: name || 'Group',
    participants: unique
  });
  return sendSuccess(res, { conversation: convo }, 'Created');
});

const listMessages = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await Message.find({ conversationId: req.params.id })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body || {};
  if (!content) return sendError(res, 'content is required', 400);
  const message = await Message.create({
    conversationId: req.params.id,
    senderId: req.user._id,
    content
  });
  await Conversation.findByIdAndUpdate(req.params.id, { lastMessageId: message._id });
  return sendSuccess(res, { message }, 'Sent');
});

const seen = asyncHandler(async (req, res) => {
  return sendSuccess(res, { seen: true });
});

const updateMessage = asyncHandler(async (req, res) => {
  const { content } = req.body || {};
  if (!content) return sendError(res, 'content is required', 400);
  const message = await Message.findOneAndUpdate(
    { _id: req.params.id, senderId: req.user._id },
    { content, edited: true },
    { new: true }
  );
  if (!message) return sendError(res, 'Message not found', 404);
  return sendSuccess(res, { message }, 'Updated');
});

const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findOneAndUpdate(
    { _id: req.params.id, senderId: req.user._id },
    { deleted: true },
    { new: true }
  );
  if (!message) return sendError(res, 'Message not found', 404);
  return sendSuccess(res, { message }, 'Deleted');
});

const reactToMessage = asyncHandler(async (req, res) => {
  const { emoji } = req.body || {};
  if (!emoji) return sendError(res, 'emoji is required', 400);
  const message = await Message.findById(req.params.id);
  if (!message) return sendError(res, 'Message not found', 404);

  const existing = message.reactions.find(
    (r) => r.userId.toString() === req.user._id.toString() && r.emoji === emoji
  );
  if (!existing) {
    message.reactions.push({ emoji, userId: req.user._id });
    await message.save();
  }

  return sendSuccess(res, { message }, 'Reacted');
});

module.exports = {
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
};

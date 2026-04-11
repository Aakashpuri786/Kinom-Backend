const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getIo } = require('../sockets');

const list = asyncHandler(async (req, res) => {
  const items = await Post.find().sort({ createdAt: -1 });
  return sendSuccess(res, { items, total: items.length });
});

const getById = asyncHandler(async (req, res) => {
  const item = await Post.findById(req.params.id);
  if (!item) return sendError(res, 'Post not found', 404);
  return sendSuccess(res, { item });
});

const create = asyncHandler(async (req, res) => {
  const { title, content, imageUrl, tags, source, authorId } = req.body || {};
  if (!title || !content) return sendError(res, 'title and content are required', 400);
  const item = await Post.create({
    title,
    content,
    imageUrl: imageUrl || '',
    tags: Array.isArray(tags) ? tags : [],
    source: source || 'shared',
    authorId: authorId || null
  });

  const io = getIo();
  if (io) {
    io.emit('new_post', item);
  }

  return res.status(201).json({
    success: true,
    data: { item },
    message: 'Created'
  });
});

const update = asyncHandler(async (req, res) => {
  const item = await Post.findByIdAndUpdate(req.params.id, { $set: req.body || {} }, { new: true });
  if (!item) return sendError(res, 'Post not found', 404);
  return sendSuccess(res, { item }, 'Updated');
});

const remove = asyncHandler(async (req, res) => {
  const item = await Post.findByIdAndDelete(req.params.id);
  if (!item) return sendError(res, 'Post not found', 404);
  return sendSuccess(res, { item }, 'Deleted');
});

module.exports = { list, getById, create, update, remove };

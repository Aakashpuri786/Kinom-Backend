const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getIo } = require('../sockets');

const getActorFilter = (req) => {
  if (req.admin) return { _id: req.params.id };
  return { _id: req.params.id, authorId: req.user._id };
};

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
  const { title, content, imageUrl, tags, source } = req.body || {};
  if (!title || !content) return sendError(res, 'title and content are required', 400);
  const item = await Post.create({
    title: String(title).trim(),
    content: String(content).trim(),
    imageUrl: imageUrl || '',
    tags: Array.isArray(tags) ? tags : [],
    source: source || (req.admin ? 'admin' : 'shared'),
    authorId: req.user ? req.user._id : null
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
  const updateData = { ...req.body };
  delete updateData.authorId;
  if (updateData.title !== undefined) updateData.title = String(updateData.title).trim();
  if (updateData.content !== undefined) updateData.content = String(updateData.content).trim();

  const item = await Post.findOneAndUpdate(getActorFilter(req), { $set: updateData }, { new: true });
  if (!item) return sendError(res, 'Post not found', 404);
  return sendSuccess(res, { item }, 'Updated');
});

const remove = asyncHandler(async (req, res) => {
  const item = await Post.findOneAndDelete(getActorFilter(req));
  if (!item) return sendError(res, 'Post not found', 404);
  return sendSuccess(res, { item }, 'Deleted');
});

module.exports = { list, getById, create, update, remove };

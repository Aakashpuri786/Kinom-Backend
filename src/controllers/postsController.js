const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getPagination } = require('../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPagination(req);
  const items = await Post.find().skip(skip).limit(limit).sort({ createdAt: -1 });
  return sendSuccess(res, { items, page, limit });
});

const getById = asyncHandler(async (req, res) => {
  const item = await Post.findById(req.params.id);
  if (!item) return sendError(res, 'Post not found', 404);
  return sendSuccess(res, { item });
});

const create = asyncHandler(async (req, res) => {
  const { title, content, imageUrl, tags } = req.body || {};
  if (!title || !content) return sendError(res, 'title and content are required', 400);
  const item = await Post.create({ authorId: req.user._id, title, content, imageUrl, tags });
  return sendSuccess(res, { item }, 'Created');
});

const update = asyncHandler(async (req, res) => {
  const item = await Post.findOneAndUpdate(
    { _id: req.params.id, authorId: req.user._id },
    { $set: req.body || {} },
    { new: true }
  );
  if (!item) return sendError(res, 'Post not found', 404);
  return sendSuccess(res, { item }, 'Updated');
});

const remove = asyncHandler(async (req, res) => {
  const item = await Post.findOneAndDelete({ _id: req.params.id, authorId: req.user._id });
  if (!item) return sendError(res, 'Post not found', 404);
  return sendSuccess(res, { item }, 'Deleted');
});

module.exports = { list, getById, create, update, remove };

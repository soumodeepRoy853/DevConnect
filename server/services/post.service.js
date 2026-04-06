import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import { createHttpError } from "../utils/httpError.js";
import { ensureObjectId } from "../utils/objectId.js";

export const createPostService = async (userId, data, file) => {
  ensureObjectId(userId, "Invalid user ID.");

  const newPost = new Post({
    user: userId,
    text: data.text,
    image: data.image,
  });

  if (file) {
    newPost.image = `/uploads/posts/${file.filename}`;
  }

  const savedPost = await newPost.save();
  await savedPost.populate("user", ["name", "avatar"]);

  return savedPost;
};

const buildPaginationMeta = ({ page, limit, total }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export const getFeedPostsService = async (userId, pagination) => {
  ensureObjectId(userId, "Invalid user ID.");

  const currentUser = await User.findById(userId).select("following");
  if (!currentUser) {
    throw createHttpError(404, "User not found");
  }

  const feedUserIds = [...currentUser.following, userId];
  const filter = { user: { $in: feedUserIds } };

  if (!pagination) {
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", ["name", "avatar"]);

    return { posts, pagination: null };
  }

  const { page, limit, skip } = pagination;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", ["name", "avatar"]),
    Post.countDocuments(filter),
  ]);

  return { posts, pagination: buildPaginationMeta({ page, limit, total }) };
};

export const getPostsByUserService = async (userId, pagination) => {
  ensureObjectId(userId, "Invalid user ID.");

  const filter = { user: userId };

  if (!pagination) {
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", ["name", "avatar"]);

    return { posts, pagination: null };
  }

  const { page, limit, skip } = pagination;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", ["name", "avatar"]),
    Post.countDocuments(filter),
  ]);

  return { posts, pagination: buildPaginationMeta({ page, limit, total }) };
};

export const toggleLikeService = async (postId, userId) => {
  ensureObjectId(postId, "Invalid post ID.");
  ensureObjectId(userId, "Invalid user ID.");

  const post = await Post.findById(postId).populate("user", "name avatar");
  if (!post) {
    throw createHttpError(404, "Post not found");
  }

  const alreadyLiked = post.likes.some((id) => id.toString() === userId);

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== userId);
  } else {
    post.likes.push(userId);
  }

  await post.save();

  return { post, alreadyLiked };
};

export const addCommentService = async (postId, userId, data) => {
  ensureObjectId(postId, "Invalid post ID.");
  ensureObjectId(userId, "Invalid user ID.");

  const post = await Post.findById(postId);
  if (!post) {
    throw createHttpError(404, "Post not found");
  }

  post.comments.push({ user: userId, text: data.text });
  await post.save();

  return post.comments;
};

export const deletePostService = async (postId, userId) => {
  ensureObjectId(postId, "Invalid post ID.");
  ensureObjectId(userId, "Invalid user ID.");

  const post = await Post.findById(postId);
  if (!post || post.user.toString() !== userId) {
    throw createHttpError(403, "Unauthorized or not found!");
  }

  await post.deleteOne();
  return true;
};

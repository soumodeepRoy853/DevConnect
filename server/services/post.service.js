import Post from "../models/Post.model.js";
import mongoose from "mongoose";
import User from "../models/User.model.js";
import { createHttpError } from "../utils/httpError.js";
import { ensureObjectId } from "../utils/objectId.js";

export const createPostService = async (userId, data, file) => {
  ensureObjectId(userId, "Invalid user ID.");

  const newPost = new Post({
    user: userId,
    text: data.text,
    image: data.image,
    visibility: data.visibility,
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

  const currentUser = await User.findById(userId).select(
    "following followers"
  );
  if (!currentUser) {
    throw createHttpError(404, "User not found");
  }

  const following = Array.isArray(currentUser.following)
    ? currentUser.following
    : [];
  const followers = Array.isArray(currentUser.followers)
    ? currentUser.followers
    : [];

  const filter = {
    $or: [
      { visibility: "public" },
      { visibility: { $exists: false } },
      { user: userId },
      { $and: [{ visibility: "followers" }, { user: { $in: following } }] },
    ],
  };

  if (!pagination) {
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", ["name", "avatar"])
      .populate("comments.user", ["name", "avatar"])
      .populate({ path: "repostOf", populate: { path: "user", select: ["name", "avatar"] } });

    //attach repost counts and viewer repost status
    const plainPosts = posts.map((p) => p.toObject());
    const originalIds = [
      ...new Set(
        plainPosts.map((p) => {
          const orig = p.repostOf ? (p.repostOf._id || p.repostOf) : p._id;
          return String(orig);
        })
      ),
    ].map((id) => new mongoose.Types.ObjectId(id));

    if (originalIds.length > 0) {
      const counts = await Post.aggregate([
        { $match: { repostOf: { $in: originalIds } } },
        { $group: { _id: "$repostOf", count: { $sum: 1 } } },
      ]);

      const countsMap = {};
      counts.forEach((c) => (countsMap[String(c._id)] = c.count));

      const viewerReposts = await Post.find({ user: userId, repostOf: { $in: originalIds } }).select("repostOf").lean();
      const viewerSet = new Set(viewerReposts.map((r) => String(r.repostOf)));

      plainPosts.forEach((pp) => {
        const orig = String(pp.repostOf ? (pp.repostOf._id || pp.repostOf) : pp._id);
        pp.repostCount = countsMap[orig] || 0;
        pp.isRepostedByViewer = viewerSet.has(orig);
      });
    }

    return { posts: plainPosts, pagination: null };
  }

  const { page, limit, skip } = pagination;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", ["name", "avatar"])
      .populate("comments.user", ["name", "avatar"])
      .populate({ path: "repostOf", populate: { path: "user", select: ["name", "avatar"] } }),
    Post.countDocuments(filter),
  ]);

  //attach repost counts and viewer repost status for paginated results
  const plainPosts = posts.map((p) => p.toObject());
  const originalIds = [
    ...new Set(
      plainPosts.map((p) => {
        const orig = p.repostOf ? (p.repostOf._id || p.repostOf) : p._id;
        return String(orig);
      })
    ),
  ].map((id) => new mongoose.Types.ObjectId(id));

  if (originalIds.length > 0) {
    const counts = await Post.aggregate([
      { $match: { repostOf: { $in: originalIds } } },
      { $group: { _id: "$repostOf", count: { $sum: 1 } } },
    ]);

    const countsMap = {};
    counts.forEach((c) => (countsMap[String(c._id)] = c.count));

    const viewerReposts = await Post.find({ user: userId, repostOf: { $in: originalIds } }).select("repostOf").lean();
    const viewerSet = new Set(viewerReposts.map((r) => String(r.repostOf)));

    plainPosts.forEach((pp) => {
      const orig = String(pp.repostOf ? (pp.repostOf._id || pp.repostOf) : pp._id);
      pp.repostCount = countsMap[orig] || 0;
      pp.isRepostedByViewer = viewerSet.has(orig);
    });
  }

  return { posts: plainPosts, pagination: buildPaginationMeta({ page, limit, total }) };
};

export const getPostsByUserService = async (targetUserId, viewerId, pagination) => {
  ensureObjectId(targetUserId, "Invalid user ID.");

  const targetUser = await User.findById(targetUserId).select("followers");
  if (!targetUser) {
    throw createHttpError(404, "User not found");
  }

  let filter;

  //If the viewer is the target user, return all posts (including private)
  if (viewerId && targetUserId.toString() === viewerId.toString()) {
    filter = { user: targetUserId };
  } else {
    const isFollower = Array.isArray(targetUser.followers)
      ? targetUser.followers.some((id) => id.toString() === (viewerId || ""))
      : false;

    if (isFollower) {
      filter = { user: targetUserId, visibility: { $in: ["public", "followers"] } };
    } else {
      filter = { user: targetUserId, $or: [{ visibility: "public" }, { visibility: { $exists: false } }] };
    }
  }

  if (!pagination) {
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", ["name", "avatar"])
      .populate("comments.user", ["name", "avatar"])
      .populate({ path: "repostOf", populate: { path: "user", select: ["name", "avatar"] } });

    //attach repost counts and viewer repost status
    const plainPosts = posts.map((p) => p.toObject());
    const originalIds = [
      ...new Set(
        plainPosts.map((p) => {
          const orig = p.repostOf ? (p.repostOf._id || p.repostOf) : p._id;
          return String(orig);
        })
      ),
    ].map((id) => new mongoose.Types.ObjectId(id));

    if (originalIds.length > 0) {
      const counts = await Post.aggregate([
        { $match: { repostOf: { $in: originalIds } } },
        { $group: { _id: "$repostOf", count: { $sum: 1 } } },
      ]);

      const countsMap = {};
      counts.forEach((c) => (countsMap[String(c._id)] = c.count));

      const viewerReposts = await Post.find({ user: viewerId, repostOf: { $in: originalIds } }).select("repostOf").lean();
      const viewerSet = new Set(viewerReposts.map((r) => String(r.repostOf)));

      plainPosts.forEach((pp) => {
        const orig = String(pp.repostOf ? (pp.repostOf._id || pp.repostOf) : pp._id);
        pp.repostCount = countsMap[orig] || 0;
        pp.isRepostedByViewer = viewerSet.has(orig);
      });
    }

    return { posts: plainPosts, pagination: null };
  }

  const { page, limit, skip } = pagination;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", ["name", "avatar"])
      .populate("comments.user", ["name", "avatar"])
      .populate({ path: "repostOf", populate: { path: "user", select: ["name", "avatar"] } }),
    Post.countDocuments(filter),
  ]);

  //attach repost counts and viewer repost status for paginated results
  const plainPosts = posts.map((p) => p.toObject());
  const originalIds = [
    ...new Set(
      plainPosts.map((p) => {
        const orig = p.repostOf ? (p.repostOf._id || p.repostOf) : p._id;
        return String(orig);
      })
    ),
  ].map((id) => new mongoose.Types.ObjectId(id));

  if (originalIds.length > 0) {
    const counts = await Post.aggregate([
      { $match: { repostOf: { $in: originalIds } } },
      { $group: { _id: "$repostOf", count: { $sum: 1 } } },
    ]);

    const countsMap = {};
    counts.forEach((c) => (countsMap[String(c._id)] = c.count));

    const viewerReposts = await Post.find({ user: viewerId, repostOf: { $in: originalIds } }).select("repostOf").lean();
    const viewerSet = new Set(viewerReposts.map((r) => String(r.repostOf)));

    plainPosts.forEach((pp) => {
      const orig = String(pp.repostOf ? (pp.repostOf._id || pp.repostOf) : pp._id);
      pp.repostCount = countsMap[orig] || 0;
      pp.isRepostedByViewer = viewerSet.has(orig);
    });
  }

  return { posts: plainPosts, pagination: buildPaginationMeta({ page, limit, total }) };
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

export const repostService = async (originalPostId, userId) => {
  ensureObjectId(originalPostId, "Invalid post ID.");
  ensureObjectId(userId, "Invalid user ID.");

  const original = await Post.findById(originalPostId).populate("user", "name avatar");
  if (!original) {
    throw createHttpError(404, "Post not found");
  }

  //Only allow reposting of public posts (treat missing visibility as public)
  if (original.visibility && original.visibility !== "public") {
    throw createHttpError(403, "Cannot repost non-public post");
  }

  //Prevent duplicate reposts by the same user
  const alreadyReposted = await Post.findOne({ user: userId, repostOf: original._id });
  if (alreadyReposted) {
    throw createHttpError(409, "You have already reposted this post");
  }

  const repost = new Post({ user: userId, repostOf: original._id });
  const saved = await repost.save();

  await saved.populate("user", ["name", "avatar"]);
  await saved.populate({ path: "repostOf", populate: { path: "user", select: ["name", "avatar"] } });

  return saved;
};

export const unrepostService = async (originalPostId, userId) => {
  ensureObjectId(originalPostId, "Invalid post ID.");
  ensureObjectId(userId, "Invalid user ID.");

  const repost = await Post.findOne({ user: userId, repostOf: originalPostId });
  if (!repost) {
    throw createHttpError(404, "Repost not found");
  }

  const repostId = repost._id.toString();
  await repost.deleteOne();
  return repostId;
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
  await post.populate("comments.user", ["name", "avatar"]);

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



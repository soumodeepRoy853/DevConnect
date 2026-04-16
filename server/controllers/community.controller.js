import {
  listCommunitiesService,
  joinCommunityService,
  leaveCommunityService,
  listCommunityPostsService,
  createCommunityPostService,
  listCommunityMessagesService,
  createCommunityMessageService,
  createCommunityService,
  getCommunityBySlugService,
} from "../services/community.service.js";
import {
  validateCommunityPostInput,
  validateCommunityMessageInput,
  validateCommunityInput,
} from "../validators/community.validator.js";

export const listCommunities = async (req, res) => {
  try {
    const communities = await listCommunitiesService(req.user?.id);
    res.status(200).json({ communities });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const result = await joinCommunityService(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

export const leaveCommunity = async (req, res) => {
  try {
    const result = await leaveCommunityService(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

export const listCommunityPosts = async (req, res) => {
  try {
    const posts = await listCommunityPostsService(req.params.id, req.user.id);
    res.status(200).json({ posts });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

export const createCommunity = async (req, res) => {
  try {
    const payload = validateCommunityInput(req.body);
    const community = await createCommunityService(req.user.id, payload);
    res.status(201).json({ community });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

export const getCommunityBySlug = async (req, res) => {
  try {
    const community = await getCommunityBySlugService(req.params.slug, req.user?.id);
    res.status(200).json({ community });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

export const createCommunityPost = async (req, res) => {
  try {
    const payload = validateCommunityPostInput(req.body);
    const post = await createCommunityPostService(req.params.id, req.user.id, payload);
    res.status(201).json({ post });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

export const listCommunityMessages = async (req, res) => {
  try {
    const messages = await listCommunityMessagesService(req.params.id, req.user.id);
    res.status(200).json({ messages });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

export const createCommunityMessage = async (req, res) => {
  try {
    const payload = validateCommunityMessageInput(req.body);
    const message = await createCommunityMessageService(req.params.id, req.user.id, payload);
    res.status(201).json({ message });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

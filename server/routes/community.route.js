import express from "express";
import authUser from "../middleware/auth.middleware.js";
import {
  listCommunities,
  createCommunity,
  getCommunityBySlug,
  joinCommunity,
  leaveCommunity,
  listCommunityPosts,
  createCommunityPost,
  listCommunityMessages,
  createCommunityMessage,
} from "../controllers/community.controller.js";

const communityRouter = express.Router();

communityRouter.get("/", authUser, listCommunities);
communityRouter.post("/", authUser, createCommunity);
communityRouter.post("/create", authUser, createCommunity);
communityRouter.get("/slug/:slug", authUser, getCommunityBySlug);
communityRouter.post("/:id/join", authUser, joinCommunity);
communityRouter.post("/:id/leave", authUser, leaveCommunity);
communityRouter.get("/:id/posts", authUser, listCommunityPosts);
communityRouter.post("/:id/posts", authUser, createCommunityPost);
communityRouter.get("/:id/messages", authUser, listCommunityMessages);
communityRouter.post("/:id/messages", authUser, createCommunityMessage);

export default communityRouter;

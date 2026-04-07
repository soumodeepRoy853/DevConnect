import express from 'express';
import { createPost, toggleLike, addComment, deletePost, getFeedPosts, getPostsByUser, repost, unrepost } from '../controllers/Post.controller.js';
import authUser from '../middleware/auth.middleware.js';
import { paginationMiddleware } from '../middleware/pagination.middleware.js';


const postRouter = express.Router();

postRouter.post("/", authUser, createPost);
postRouter.get("/feed", authUser, paginationMiddleware(), getFeedPosts);
postRouter.get("/user/:userId", authUser, getPostsByUser)
postRouter.put("/like/:postId", authUser, toggleLike);
postRouter.post("/repost/:postId", authUser, repost);
postRouter.post("/unrepost/:postId", authUser, unrepost);
postRouter.post("/comment/:postId", authUser, addComment);
postRouter.delete("/:postId", authUser, deletePost);

export default postRouter;
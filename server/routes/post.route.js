import express from 'express';
import { createPost, toggleLike, addComment, deletePost, getFeedPosts, getPostsByUser } from '../controllers/Post.controller.js';
import authUser from '../middleware/auth.middleware.js';


const postRouter = express.Router();

postRouter.post("/", authUser, createPost);
postRouter.get("/feed", authUser, getFeedPosts);
postRouter.get("/user/:userId", authUser, getPostsByUser)
postRouter.put("/like/:postId", authUser, toggleLike);
postRouter.post("/comment/:postId", authUser, addComment);
postRouter.delete("/:postId", authUser, deletePost);

export default postRouter;
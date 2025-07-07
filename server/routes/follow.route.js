import express from 'express';
import { followUser, unFollowUser, getFollowData } from '../controllers/follow.controller.js';
import authUser from '../middleware/auth.middleware.js';

const followRouter = express.Router();

followRouter.put("/follow-user/:id", authUser, followUser);
followRouter.put("/unfollow/:id", authUser, unFollowUser);
followRouter.get("/:id/follow-data", authUser, getFollowData);

export default followRouter;
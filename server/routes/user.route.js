import express from 'express'
import { getUser, loginUser, registerUser, oauthUser, changePassword } from '../controllers/User.authcontroller.js'
import authUser from '../middleware/auth.middleware.js';
import { followUser } from '../controllers/follow.controller.js';

const userRouter = express.Router();

userRouter.post('/add-user', registerUser)
userRouter.post('/login-user', loginUser)
userRouter.post('/oauth', oauthUser)
userRouter.get('/all-users', authUser, getUser)
userRouter.put("/follow/:id", authUser, followUser);
userRouter.put("/change-password", authUser, changePassword);

export default userRouter;
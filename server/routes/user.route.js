import express from 'express'
import { getUser, loginUser, registerUser } from '../controllers/User.authcontroller.js'
import authUser from '../middleware/auth.middleware.js';
import { followUser } from '../controllers/follow.controller.js';

const userRouter = express.Router();

userRouter.post('/add-user', registerUser)
userRouter.post('/login-user', loginUser)
userRouter.get('/all-users', authUser, getUser)
userRouter.put("/follow/:id", authUser, followUser);

export default userRouter;
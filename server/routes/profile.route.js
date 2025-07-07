import express from 'express';
import { createAndUpdateProfile, getMyProfile, getAllProfiles, getProfileById, deleteUserAndProfile } from '../controllers/profile.controller.js';
import authUser from '../middleware/auth.middleware.js';

const profileRouter = express.Router();

profileRouter.post("/create", authUser, createAndUpdateProfile);
profileRouter.get("/my", authUser, getMyProfile);
profileRouter.get("/all-profiles", getAllProfiles);
profileRouter.get("/user/:id", getProfileById);
profileRouter.delete("/delete-profiles", authUser, deleteUserAndProfile);



export default profileRouter;
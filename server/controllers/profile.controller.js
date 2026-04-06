import {
  deleteUserAndProfileService,
  getAllProfilesService,
  getMyProfileService,
  getProfileByIdService,
  upsertProfileService,
} from "../services/profile.service.js";
import { validateProfileInput } from "../validators/profile.validator.js";

//Create or Update user profile
export const createAndUpdateProfile = async (req, res) => {
  try {
    const payload = validateProfileInput(req.body);
    const profile = await upsertProfileService(req.user.id, payload);
    res.status(200).json({ message: "Profile saved successfully", profile });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal server error" });
  }
};

//Get current user's profile
export const getMyProfile = async (req, res) => {
  try {
    const profile = await getMyProfileService(req.user.id);

    res.status(200).json({ profile });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal server error" });
  }
};

//Get all profiles
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await getAllProfilesService();
    res.status(200).json({ profiles });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal server error" });
  }
};

//Get profile by user ID
export const getProfileById = async (req, res) => {
  try {
    const profile = await getProfileByIdService(req.params.id);

    res.status(200).json({ profile });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal server error" });
  }
};

//Delete User and Profile
export const deleteUserAndProfile = async (req, res) => {
  try {
    await deleteUserAndProfileService(req.user.id);
    res.status(200).json({ message: "User and profile deleted" });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal server error" });
  }
};

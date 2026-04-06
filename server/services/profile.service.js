import Profile from "../models/Profile.model.js";
import User from "../models/User.model.js";
import { createHttpError } from "../utils/httpError.js";
import { ensureObjectId } from "../utils/objectId.js";

const DEFAULT_AVATAR =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

export const upsertProfileService = async (userId, data) => {
  ensureObjectId(userId, "Invalid user ID.");

  const profileFields = {
    user: userId,
    bio: data.bio,
    skills: data.skills || [],
    github: data.github,
    linkedin: data.linkedin,
    website: data.website,
    location: data.location,
    education: data.education,
    avatar: data.avatar || DEFAULT_AVATAR,
  };

  const profile = await Profile.findOneAndUpdate(
    { user: userId },
    { $set: profileFields },
    { new: true, upsert: true }
  );

  if (typeof data.avatar === "string" && data.avatar.trim() !== "") {
    await User.findByIdAndUpdate(userId, { avatar: data.avatar.trim() });
  }

  return profile;
};

export const getMyProfileService = async (userId) => {
  ensureObjectId(userId, "Invalid user ID.");

  const profile = await Profile.findOne({ user: userId }).populate("user", [
    "name",
    "email",
    "avatar",
  ]);

  if (!profile) {
    throw createHttpError(404, "Profile not found");
  }

  return profile;
};

export const getAllProfilesService = async () => {
  return Profile.find().populate("user", ["name", "email", "avatar"]);
};

export const getProfileByIdService = async (userId) => {
  ensureObjectId(userId, "Invalid user ID.");

  const profile = await Profile.findOne({ user: userId }).populate("user", [
    "name",
    "email",
    "avatar",
  ]);

  if (!profile) {
    throw createHttpError(404, "Profile not found");
  }

  return profile;
};

export const deleteUserAndProfileService = async (userId) => {
  ensureObjectId(userId, "Invalid user ID.");

  const profile = await Profile.findOneAndDelete({ user: userId });
  const user = await User.findByIdAndDelete(userId);

  if (!profile && !user) {
    throw createHttpError(404, "User not found");
  }

  return true;
};

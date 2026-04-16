import Profile from "../models/Profile.model.js";
import User from "../models/User.model.js";
import Community from "../models/Community.model.js";
import { createHttpError } from "../utils/httpError.js";
import { ensureObjectId } from "../utils/objectId.js";

const DEFAULT_AVATAR =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

const normalizeSocialUrl = (value, basePath = "") => {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const withoutWww = trimmed.replace(/^www\./i, "");
  const hasDomain = /linkedin\.com|github\.com/i.test(withoutWww);
  if (hasDomain) return `https://${withoutWww}`;

  const handle = withoutWww.replace(/^@/, "");
  if (basePath) return `https://${basePath}/${handle}`;
  return `https://${withoutWww}`;
};

export const upsertProfileService = async (userId, data) => {
  ensureObjectId(userId, "Invalid user ID.");

  const profileFields = {
    user: userId,
    bio: data.bio,
    skills: data.skills || [],
    github: normalizeSocialUrl(data.github, "github.com"),
    linkedin: normalizeSocialUrl(data.linkedin, "www.linkedin.com/in"),
    website: normalizeSocialUrl(data.website),
    location: data.location,
    education: data.education,
  };

  const hasAvatar = typeof data.avatar === "string" && data.avatar.trim() !== "";
  if (hasAvatar) {
    profileFields.avatar = data.avatar.trim();
  }

  const profile = await Profile.findOneAndUpdate(
    { user: userId },
    { $set: profileFields },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (hasAvatar) {
    await User.findByIdAndUpdate(userId, { avatar: data.avatar.trim() });
  }

  await upsertAboutCommunity(userId, profile);

  return profile;
};

const upsertAboutCommunity = async (userId, profile) => {
  try {
    const user = await User.findById(userId).select("name").lean();
    const name = user?.name ? `About ${user.name}` : "About Me";
    const skillHint = (profile.skills || []).slice(0, 5).join(", ");
    const description = profile.bio || (skillHint ? `Skills: ${skillHint}` : "About-based community.");
    const slug = `about-${userId}`;

    const existing = await Community.findOne({ aboutOwner: userId, isAboutBased: true });

    if (!existing) {
      await Community.create({
        name,
        slug,
        description,
        visibility: "public",
        createdBy: userId,
        members: [userId],
        isAboutBased: true,
        aboutOwner: userId,
      });
      return;
    }

    const updates = {};
    if (existing.name !== name) updates.name = name;
    if (existing.description !== description) updates.description = description;
    if (existing.visibility !== "public") updates.visibility = "public";
    if (!existing.members?.some((id) => String(id) === String(userId))) {
      updates.members = [...(existing.members || []), userId];
    }

    if (Object.keys(updates).length > 0) {
      await Community.updateOne({ _id: existing._id }, { $set: updates });
    }
  } catch {
    // No-op
  }
};

export const getMyProfileService = async (userId) => {
  ensureObjectId(userId, "Invalid user ID.");

  const profile = await Profile.findOne({ user: userId }).populate("user", [
    "name",
    "email",
    "avatar",
    "lastSeen",
  ]);

  if (!profile) {
    throw createHttpError(404, "Profile not found");
  }

  return profile;
};

export const getAllProfilesService = async () => {
  return Profile.find().populate({
    path: "user",
    select: ["name", "email", "avatar", "lastSeen", "followers"],
    populate: { path: "followers", select: ["name", "avatar"] },
  });
};

export const getProfileByIdService = async (userId) => {
  ensureObjectId(userId, "Invalid user ID.");

  const profile = await Profile.findOne({ user: userId }).populate("user", [
    "name",
    "email",
    "avatar",
    "lastSeen",
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

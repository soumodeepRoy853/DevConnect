import User from "../models/User.model.js";
import { createHttpError } from "../utils/httpError.js";
import { ensureObjectId } from "../utils/objectId.js";

export const followUserService = async (currentUserId, targetUserId) => {
  ensureObjectId(targetUserId, "Invalid user ID.");
  ensureObjectId(currentUserId, "Invalid user ID.");

  if (targetUserId === currentUserId) {
    throw createHttpError(400, "You cannot follow yourself.");
  }

  const [targetUser, currentUser] = await Promise.all([
    User.findById(targetUserId),
    User.findById(currentUserId),
  ]);

  if (!targetUser || !currentUser) {
    throw createHttpError(404, "User not found.");
  }

  const alreadyFollowing = currentUser.following.some(
    (id) => id.toString() === targetUserId
  );

  if (alreadyFollowing) {
    throw createHttpError(400, "Already following.");
  }

  currentUser.following.push(targetUserId);
  targetUser.followers.push(currentUserId);

  await Promise.all([currentUser.save(), targetUser.save()]);
  return true;
};

export const unFollowUserService = async (currentUserId, targetUserId) => {
  ensureObjectId(targetUserId, "Invalid user ID.");
  ensureObjectId(currentUserId, "Invalid user ID.");

  if (targetUserId === currentUserId) {
    throw createHttpError(400, "You cannot unfollow yourself.");
  }

  const [targetUser, currentUser] = await Promise.all([
    User.findById(targetUserId),
    User.findById(currentUserId),
  ]);

  if (!targetUser || !currentUser) {
    throw createHttpError(404, "User not found.");
  }

  const isFollowing = currentUser.following.some(
    (id) => id.toString() === targetUserId
  );

  if (!isFollowing) {
    throw createHttpError(400, "Not following this user.");
  }

  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== targetUserId
  );
  targetUser.followers = targetUser.followers.filter(
    (id) => id.toString() !== currentUserId
  );

  await Promise.all([currentUser.save(), targetUser.save()]);
  return true;
};

export const getFollowDataService = async (userId) => {
  ensureObjectId(userId, "Invalid user ID.");

  const user = await User.findById(userId)
    .populate("followers", "name email avatar")
    .populate("following", "name email avatar");

  if (!user) {
    throw createHttpError(404, "User not found.");
  }

  return { followers: user.followers, following: user.following };
};

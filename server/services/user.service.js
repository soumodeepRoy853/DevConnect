import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { createHttpError } from "../utils/httpError.js";
import { ensureObjectId } from "../utils/objectId.js";

export const registerUserService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(400, "User already exist");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashedPassword });
  return user;
};

export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(400, "User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createHttpError(404, "Invalid Credentials");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { token, user };
};

export const getUserByIdService = async (userId) => {
  ensureObjectId(userId, "Invalid user ID.");

  const user = await User.findById(userId)
    .select("-password")
    .populate("following", "name email avatar");

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return user;
};

export const oauthLoginService = async ({ name, email, avatar }) => {
  let user = await User.findOne({ email });
  if (!user) {
    const safeName = name && String(name).trim() ? String(name).trim() : String(email).split("@")[0];
    // Generate a random password hash to satisfy the required field for OAuth-created users
    const salt = await bcrypt.genSalt(10);
    const randomPassword = crypto.randomBytes(24).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, salt);
    user = await User.create({ name: safeName, email, avatar, password: hashedPassword });
  } else {
    // update avatar/name if provided
    let updated = false;
    if (avatar && user.avatar !== avatar) {
      user.avatar = avatar;
      updated = true;
    }
    if (name && user.name !== name) {
      user.name = name;
      updated = true;
    }
    if (updated) await user.save();
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { token, user };
};

export const changePasswordService = async ({ userId, oldPassword, newPassword }) => {
  ensureObjectId(userId, "Invalid user ID.");

  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw createHttpError(400, "Old password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  await user.save();
  return true;
};

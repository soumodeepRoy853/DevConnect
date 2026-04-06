import bcrypt from "bcryptjs";
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

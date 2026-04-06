import validator from "validator";
import { createHttpError } from "../utils/httpError.js";

export const validateRegisterInput = ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw createHttpError(400, "All fields are required");
  }

  if (!validator.isEmail(email)) {
    throw createHttpError(400, "Please enter a valid email");
  }

  return {
    name: name.trim(),
    email: email.trim(),
    password,
  };
};

export const validateLoginInput = ({ email, password }) => {
  if (!email || !password) {
    throw createHttpError(400, "Email and Password are required");
  }

  return {
    email: email.trim(),
    password,
  };
};

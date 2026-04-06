import mongoose from "mongoose";
import { createHttpError } from "./httpError.js";

export const ensureObjectId = (id, message = "Invalid id.") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, message);
  }

  return id;
};

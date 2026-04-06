import { createHttpError } from "../utils/httpError.js";

export const validateCreatePostInput = ({ text, image }) => {
  if (!text && !image) {
    throw createHttpError(400, "Post text or image is required");
  }

  return { text, image };
};

export const validateCommentInput = ({ text }) => {
  if (!text || text.trim() === "") {
    throw createHttpError(400, "Comment text is required");
  }

  return { text: text.trim() };
};

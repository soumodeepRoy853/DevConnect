import { createHttpError } from "../utils/httpError.js";

export const validateCreatePostInput = ({ text, image, visibility }) => {
  if (!text && !image) {
    throw createHttpError(400, "Post text or image is required");
  }

  const allowed = ["public", "followers", "private"];
  const vis = visibility ? String(visibility).toLowerCase() : "public";

  if (!allowed.includes(vis)) {
    throw createHttpError(400, "Invalid visibility option");
  }

  return { text: text ? text.trim() : "", image, visibility: vis };
};

export const validateCommentInput = ({ text }) => {
  if (!text || text.trim() === "") {
    throw createHttpError(400, "Comment text is required");
  }

  return { text: text.trim() };
};

export const validateUpdatePostInput = ({ text, image, visibility, removeImage }) => {
  if (text == null && image == null && !removeImage && !visibility) {
    throw createHttpError(400, "No updates provided");
  }

  let vis = visibility;
  if (visibility) {
    const allowed = ["public", "followers", "private"];
    vis = String(visibility).toLowerCase();
    if (!allowed.includes(vis)) {
      throw createHttpError(400, "Invalid visibility option");
    }
  }

  return {
    text: text != null ? String(text).trim() : undefined,
    image,
    visibility: vis,
    removeImage: Boolean(removeImage),
  };
};

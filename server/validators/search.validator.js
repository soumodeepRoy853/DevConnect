import { createHttpError } from "../utils/httpError.js";

export const validateSearchQuery = (query) => {
  if (!query || query.trim() === "") {
    throw createHttpError(400, "Search query is required");
  }

  return query.trim();
};

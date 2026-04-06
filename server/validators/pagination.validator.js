import { createHttpError } from "../utils/httpError.js";

export const parsePagination = (
  query,
  { defaultLimit = 10, maxLimit = 50 } = {}
) => {
  const pageRaw = query?.page;
  const limitRaw = query?.limit;

  const page = pageRaw === undefined ? 1 : Number(pageRaw);
  const limit = limitRaw === undefined ? defaultLimit : Number(limitRaw);

  if (!Number.isInteger(page) || page < 1) {
    throw createHttpError(400, "Page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
    throw createHttpError(400, `Limit must be between 1 and ${maxLimit}`);
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

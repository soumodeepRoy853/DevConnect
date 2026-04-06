import { parsePagination } from "../validators/pagination.validator.js";

export const paginationMiddleware = (options = {}) => (req, res, next) => {
  try {
    const hasPagination =
      Object.prototype.hasOwnProperty.call(req.query, "page") ||
      Object.prototype.hasOwnProperty.call(req.query, "limit");

    if (!hasPagination) {
      req.pagination = null;
      return next();
    }

    req.pagination = parsePagination(req.query, options);
    next();
  } catch (err) {
    const status = err.status || 400;
    res.status(status).json({ message: err.message || "Invalid pagination" });
  }
};

import User from "../models/User.model.js";

const buildPaginationMeta = ({ page, limit, total }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export const searchUsersService = async (query, pagination) => {
  const filter = { name: { $regex: query, $options: "i" } };

  if (!pagination) {
    const users = await User.find(filter).select("name email avatar");
    return { users, pagination: null };
  }

  const { page, limit, skip } = pagination;

  const [users, total] = await Promise.all([
    User.find(filter).select("name email avatar").skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, pagination: buildPaginationMeta({ page, limit, total }) };
};

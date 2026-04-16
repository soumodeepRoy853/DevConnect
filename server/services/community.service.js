import Community from "../models/Community.model.js";
import CommunityPost from "../models/CommunityPost.model.js";
import CommunityMessage from "../models/CommunityMessage.model.js";
import User from "../models/User.model.js";
import Profile from "../models/Profile.model.js";
import { createHttpError } from "../utils/httpError.js";
import { ensureObjectId } from "../utils/objectId.js";

const DEFAULT_COMMUNITIES = [
  {
    name: "Backend Development",
    slug: "backend-development",
    description: "APIs, databases, and scalable services.",
  },
  {
    name: "Frontend Development",
    slug: "frontend-development",
    description: "UI engineering, performance, and user experience.",
  },
  {
    name: "Community",
    slug: "community",
    description: "General discussion and community updates.",
  },
  {
    name: "From About",
    slug: "from-about",
    description: "Topics inspired by member bios and skills.",
  },
];

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ensureUniqueSlug = async (base) => {
  const seed = base || "community";
  let slug = seed;
  let counter = 1;

  while (await Community.exists({ slug })) {
    slug = `${seed}-${counter}`;
    counter += 1;
  }

  return slug;
};

const ensureDefaults = async () => {
  const existing = await Community.find({ slug: { $in: DEFAULT_COMMUNITIES.map((c) => c.slug) } })
    .select("slug")
    .lean();
  const existingSlugs = new Set(existing.map((c) => c.slug));

  const missing = DEFAULT_COMMUNITIES.filter((c) => !existingSlugs.has(c.slug));
  if (missing.length > 0) {
    await Community.insertMany(missing.map((item) => ({ ...item, visibility: "public" })));
  }
};

const ensureAboutCommunity = async (userId) => {
  if (!userId) return null;

  const profile = await Profile.findOne({ user: userId }).lean();
  if (!profile) return null;

  const user = await User.findById(userId).select("name").lean();
  const name = user?.name ? `About ${user.name}` : "About Me";
  const skillHint = (profile.skills || []).slice(0, 5).join(", ");
  const description = profile.bio || (skillHint ? `Skills: ${skillHint}` : "About-based community.");

  const existing = await Community.findOne({ aboutOwner: userId, isAboutBased: true });
  if (existing) {
    const updates = {};
    if (existing.name !== name) updates.name = name;
    if (existing.description !== description) updates.description = description;
    if (existing.visibility !== "public") updates.visibility = "public";
    if (!existing.members?.some((id) => String(id) === String(userId))) {
      updates.members = [...(existing.members || []), userId];
    }
    if (Object.keys(updates).length > 0) {
      await Community.updateOne({ _id: existing._id }, { $set: updates });
    }
    return existing;
  }

  const slug = `about-${userId}`;
  const community = await Community.create({
    name,
    slug,
    description,
    visibility: "public",
    createdBy: userId,
    members: [userId],
    isAboutBased: true,
    aboutOwner: userId,
  });

  return community;
};

export const listCommunitiesService = async (userId) => {
  await ensureDefaults();
  await ensureAboutCommunity(userId);

  const filters = [
    { visibility: "public" },
    { visibility: { $exists: false } },
  ];

  if (userId) {
    filters.push({ members: userId }, { createdBy: userId }, { aboutOwner: userId });
  }

  const communities = await Community.find({ $or: filters }).sort({ name: 1 }).lean();
  const user = userId ? await User.findById(userId).select("_id").lean() : null;

  return communities.map((c) => {
    const memberIds = (c.members || []).map((id) => String(id));
    return {
      ...c,
      memberCount: memberIds.length,
      isMember: user ? memberIds.includes(String(user._id)) : false,
    };
  });
};

export const joinCommunityService = async (userId, communityId) => {
  ensureObjectId(userId, "Invalid user ID.");
  ensureObjectId(communityId, "Invalid community ID.");

  const community = await Community.findById(communityId);
  if (!community) throw createHttpError(404, "Community not found");

  const alreadyMember = (community.members || []).some((id) => String(id) === String(userId));
  if (!alreadyMember) {
    community.members.push(userId);
    await community.save();
  }

  return { joined: true };
};

export const leaveCommunityService = async (userId, communityId) => {
  ensureObjectId(userId, "Invalid user ID.");
  ensureObjectId(communityId, "Invalid community ID.");

  const community = await Community.findById(communityId);
  if (!community) throw createHttpError(404, "Community not found");

  community.members = (community.members || []).filter((id) => String(id) !== String(userId));
  await community.save();
  return { joined: false };
};

export const createCommunityService = async (userId, payload) => {
  ensureObjectId(userId, "Invalid user ID.");

  const baseSlug = slugify(payload.name);
  const slug = await ensureUniqueSlug(baseSlug);

  const community = await Community.create({
    name: payload.name,
    slug,
    description: payload.description,
    visibility: payload.visibility,
    createdBy: userId,
    members: [userId],
  });

  const plain = community.toObject();
  return {
    ...plain,
    memberCount: plain.members?.length || 0,
    isMember: true,
  };
};

export const getCommunityBySlugService = async (slug, userId) => {
  const community = await Community.findOne({ slug: String(slug).toLowerCase() }).lean();
  if (!community) throw createHttpError(404, "Community not found");

  const memberIds = (community.members || []).map((id) => String(id));
  const isMember = userId ? memberIds.includes(String(userId)) : false;

  return {
    ...community,
    memberCount: memberIds.length,
    isMember,
  };
};

export const listCommunityPostsService = async (communityId, userId) => {
  ensureObjectId(communityId, "Invalid community ID.");
  const community = await Community.findById(communityId).select("visibility members createdBy").lean();
  if (!community) throw createHttpError(404, "Community not found");

  const isMember = userId && (community.members || []).some((id) => String(id) === String(userId));
  if (community.visibility === "private" && !isMember && String(community.createdBy) !== String(userId)) {
    throw createHttpError(403, "Join the community to view posts");
  }

  const posts = await CommunityPost.find({ community: communityId })
    .sort({ createdAt: -1 })
    .populate("user", ["name", "avatar"])
    .lean();
  return posts;
};

export const createCommunityPostService = async (communityId, userId, payload) => {
  ensureObjectId(communityId, "Invalid community ID.");
  ensureObjectId(userId, "Invalid user ID.");

  const community = await Community.findById(communityId);
  if (!community) throw createHttpError(404, "Community not found");

  const isMember = (community.members || []).some((id) => String(id) === String(userId));
  if (!isMember) throw createHttpError(403, "Join the community to post");

  const post = await CommunityPost.create({
    community: communityId,
    user: userId,
    ...payload,
  });

  await post.populate("user", ["name", "avatar"]);
  return post;
};

export const listCommunityMessagesService = async (communityId, userId) => {
  ensureObjectId(communityId, "Invalid community ID.");
  const community = await Community.findById(communityId).select("visibility members createdBy").lean();
  if (!community) throw createHttpError(404, "Community not found");

  const isMember = userId && (community.members || []).some((id) => String(id) === String(userId));
  if (community.visibility === "private" && !isMember && String(community.createdBy) !== String(userId)) {
    throw createHttpError(403, "Join the community to view messages");
  }

  const messages = await CommunityMessage.find({ community: communityId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("user", ["name", "avatar"])
    .lean();
  return messages.reverse();
};

export const createCommunityMessageService = async (communityId, userId, payload) => {
  ensureObjectId(communityId, "Invalid community ID.");
  ensureObjectId(userId, "Invalid user ID.");

  const community = await Community.findById(communityId);
  if (!community) throw createHttpError(404, "Community not found");

  const isMember = (community.members || []).some((id) => String(id) === String(userId));
  if (!isMember) throw createHttpError(403, "Join the community to chat");

  const message = await CommunityMessage.create({
    community: communityId,
    user: userId,
    text: payload.text,
  });

  await message.populate("user", ["name", "avatar"]);
  return message;
};

import { createHttpError } from "../utils/httpError.js";

export const validateCommunityPostInput = ({ type, text, link, code, image, job }) => {
  const allowed = ["chat", "job", "snippet", "photo", "link"];
  const normalizedType = type ? String(type).toLowerCase() : "chat";
  if (!allowed.includes(normalizedType)) {
    throw createHttpError(400, "Invalid post type");
  }

  const payload = {
    type: normalizedType,
    text: text ? String(text).trim() : "",
    link: link ? String(link).trim() : "",
    code: code ? String(code).trim() : "",
    image: image ? String(image).trim() : "",
    job: {
      title: job?.title ? String(job.title).trim() : "",
      company: job?.company ? String(job.company).trim() : "",
      location: job?.location ? String(job.location).trim() : "",
    },
  };

  if (!payload.text && !payload.link && !payload.code && !payload.image) {
    throw createHttpError(400, "Post content is required");
  }

  return payload;
};

export const validateCommunityMessageInput = ({ text }) => {
  if (!text || String(text).trim() === "") {
    throw createHttpError(400, "Message text is required");
  }

  return { text: String(text).trim() };
};

export const validateCommunityInput = ({ name, description, visibility }) => {
  const trimmedName = name ? String(name).trim() : "";
  if (!trimmedName) {
    throw createHttpError(400, "Community name is required");
  }

  const normalizedVisibility = visibility ? String(visibility).toLowerCase() : "public";
  if (!["public", "private"].includes(normalizedVisibility)) {
    throw createHttpError(400, "Invalid visibility");
  }

  return {
    name: trimmedName,
    description: description ? String(description).trim() : "",
    visibility: normalizedVisibility,
  };
};

import { createHttpError } from "../utils/httpError.js";

export const validateProfileInput = ({
  bio,
  skills,
  github,
  linkedin,
  website,
  location,
  education,
  avatar,
}) => {
  let normalizedSkills = [];

  if (Array.isArray(skills)) {
    normalizedSkills = skills
      .map((skill) => String(skill).trim())
      .filter(Boolean);
  } else if (typeof skills === "string") {
    normalizedSkills = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  } else if (skills != null) {
    throw createHttpError(400, "Skills must be a string or array");
  }

  return {
    bio,
    skills: normalizedSkills,
    github,
    linkedin,
    website,
    location,
    education,
    avatar,
  };
};

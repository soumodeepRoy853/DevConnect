import express from "express";
import {
  buildFileUrl,
  createAvatarUploadMiddleware,
  createPostUploadMiddleware,
} from "../services/upload.service.js";

const uploadRouter = express.Router();

// POST /api/upload/post
uploadRouter.post(
  "/post",
  createPostUploadMiddleware().single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const filePath = `/uploads/posts/${req.file.filename}`;
    const fullUrl = buildFileUrl(req, filePath);
    res.status(200).json({ url: fullUrl });
  }
);

// POST /api/upload/avatar
uploadRouter.post(
  "/avatar",
  createAvatarUploadMiddleware().single("avatar"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const filePath = `/uploads/avatar/${req.file.filename}`;
    const fullUrl = buildFileUrl(req, filePath);
    res.status(200).json({ url: fullUrl });
  }
);

export default uploadRouter;

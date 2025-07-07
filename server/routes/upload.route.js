import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadRouter = express.Router();

// Create uploads folder if it doesn't exist
const POST_UPLOAD_DIR = "uploads/posts";
if (!fs.existsSync(POST_UPLOAD_DIR)) {
  fs.mkdirSync(POST_UPLOAD_DIR, { recursive: true });
}

const postStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, POST_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const uploadPost = multer({ storage: postStorage });

// POST /api/upload/post
uploadRouter.post("/post", uploadPost.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  const filePath = `/uploads/posts/${req.file.filename}`;
  const fullUrl = `${req.protocol}://${req.get("host")}${filePath}`;
  res.status(200).json({ url: fullUrl });
});

export default uploadRouter;

import fs from "fs";
import multer from "multer";
import path from "path";

const POST_UPLOAD_DIR = "uploads/posts";
const AVATAR_UPLOAD_DIR = "uploads/avatar";

const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createStorage = (dir) => {
  ensureUploadDir(dir);

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${ext}`;
      cb(null, filename);
    },
  });
};

export const createPostUploadMiddleware = () =>
  multer({ storage: createStorage(POST_UPLOAD_DIR) });

export const createAvatarUploadMiddleware = () =>
  multer({ storage: createStorage(AVATAR_UPLOAD_DIR) });

export const buildFileUrl = (req, filePath) =>
  `${req.protocol}://${req.get("host")}${filePath}`;

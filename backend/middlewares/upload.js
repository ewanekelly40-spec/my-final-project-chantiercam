import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `media_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow images, videos, audio, and pdf/doc documents
  const allowed = /jpeg|jpg|png|gif|webp|mp4|webm|mov|avi|pdf|doc|docx|xls|xlsx|csv|txt/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const mime = file.mimetype;
  if (allowed.test(ext) || mime.startsWith("image/") || mime.startsWith("video/") || mime.startsWith("application/pdf")) {
    cb(null, true);
  } else {
    cb(new Error("File format not supported"), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter,
});

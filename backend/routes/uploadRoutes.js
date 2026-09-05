import express from "express";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Upload single file
router.post("/single", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({
      ok: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        type: req.file.mimetype.startsWith("video/") ? "video" : req.file.mimetype.startsWith("image/") ? "image" : "document",
      },
    });
  } catch (err) {
    console.error("Upload single error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Upload multiple files
router.post("/multiple", upload.array("files", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ ok: false, error: "No files uploaded" });
    }

    const uploaded = req.files.map((f) => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      type: f.mimetype.startsWith("video/") ? "video" : f.mimetype.startsWith("image/") ? "image" : "document",
    }));

    return res.json({ ok: true, data: uploaded });
  } catch (err) {
    console.error("Upload multiple error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;

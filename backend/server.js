import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initDatabase } from "./config/db.js";
import { seedDatabase } from "./scripts/seed.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import phaseRoutes from "./routes/phaseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(
  cors({
    origin: "*", // allow frontend access from Vite dev server or production build
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploads folder
app.use("/uploads", express.static(uploadsDir));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "ChantierCam API is running smoothly", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/phases", phaseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/data", dataRoutes);

// Generic 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ ok: false, error: "API endpoint not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || "Internal Server Error",
  });
});

// Initialize database & Start Server
async function startServer() {
  try {
    console.log("[Server] Initializing MySQL database connection...");
    await initDatabase();
    await seedDatabase(false); // seed if empty

    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 ChantierCam API running on port ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`💾 MySQL Database: ${process.env.DB_NAME || "chantiercam"}`);
      console.log(`📂 Uploads served at http://localhost:${PORT}/uploads`);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error("[Server] Fatal error starting server:", err);
    process.exit(1);
  }
}

startServer();

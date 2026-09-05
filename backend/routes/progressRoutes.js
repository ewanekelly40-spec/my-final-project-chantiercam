import express from "express";
import {
  getProgress,
  createProgress,
  updateProgress,
  deleteProgress,
} from "../controllers/progressController.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(optionalAuth);

router.get("/", getProgress);
router.post("/", createProgress);
router.put("/:id", updateProgress);
router.delete("/:id", deleteProgress);

export default router;

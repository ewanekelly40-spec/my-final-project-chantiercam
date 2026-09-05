import express from "express";
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../controllers/materialController.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(optionalAuth);

router.get("/", getMaterials);
router.post("/", createMaterial);
router.put("/:id", updateMaterial);
router.delete("/:id", deleteMaterial);

export default router;

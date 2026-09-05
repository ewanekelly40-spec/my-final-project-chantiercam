import express from "express";
import { getPhases, createPhase, updatePhase, deletePhase } from "../controllers/phaseController.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(optionalAuth);

router.get("/", getPhases);
router.post("/", createPhase);
router.put("/:id", updatePhase);
router.delete("/:id", deletePhase);

export default router;

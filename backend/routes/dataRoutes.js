import express from "express";
import { getFullStore, resetDatabase } from "../controllers/dataController.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(optionalAuth);

router.get("/", getFullStore);
router.post("/reset", resetDatabase);

export default router;

import express from "express";
import { loginManager, loginProjectUser, signupManager, getMe } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login-manager", loginManager);
router.post("/login-user", loginProjectUser);
router.post("/signup-manager", signupManager);
router.get("/me", authenticateToken, getMe);

export default router;

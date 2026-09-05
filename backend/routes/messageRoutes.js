import express from "express";
import { getMessages, sendMessage, markMessagesAsRead } from "../controllers/messageController.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(optionalAuth);

router.get("/", getMessages);
router.post("/", sendMessage);
router.post("/read", markMessagesAsRead);

export default router;

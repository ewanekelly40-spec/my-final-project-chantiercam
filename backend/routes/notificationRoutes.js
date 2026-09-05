import express from "express";
import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(optionalAuth);

router.get("/", getNotifications);
router.post("/", createNotification);
router.put("/:id/read", markNotificationAsRead);
router.post("/read-all", markAllNotificationsRead);

export default router;

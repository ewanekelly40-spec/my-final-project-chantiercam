import express from "express";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/taskController.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(optionalAuth);

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;

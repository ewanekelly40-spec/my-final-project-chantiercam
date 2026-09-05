import express from "express";
import {
  getProjectUsers,
  createProjectUser,
  updateProjectUser,
  deleteProjectUser,
} from "../controllers/userController.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(optionalAuth);

router.get("/", getProjectUsers);
router.post("/", createProjectUser);
router.put("/:id", updateProjectUser);
router.delete("/:id", deleteProjectUser);

export default router;

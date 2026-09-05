import express from "express";
import { getDocuments, createDocument, deleteDocument } from "../controllers/documentController.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(optionalAuth);

router.get("/", getDocuments);
router.post("/", createDocument);
router.delete("/:id", deleteDocument);

export default router;

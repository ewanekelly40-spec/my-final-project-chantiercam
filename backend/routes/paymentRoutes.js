import express from "express";
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from "../controllers/paymentController.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(optionalAuth);

router.get("/", getPayments);
router.post("/", createPayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;

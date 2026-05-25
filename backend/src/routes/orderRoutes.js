import express from "express";
import { createOrder, duplicateOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/duplicate", duplicateOrder);

export default router;

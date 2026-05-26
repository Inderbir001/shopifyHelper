import express from "express";
import { createOrder, duplicateOrder, fetchOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/duplicate", duplicateOrder);
router.post("/fetch", fetchOrder);

export default router;

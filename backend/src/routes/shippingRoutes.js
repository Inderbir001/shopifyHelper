import express from "express";
import { setupStoreShipping } from "../controllers/shippingController.js";

const router = express.Router();

router.post("/setup", setupStoreShipping);

export default router;

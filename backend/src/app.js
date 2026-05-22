import "./utils/logBus.js"; // activate console.log intercept before anything else
import express from "express";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import storeSetupRoutes from "./routes/storeSetupRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/orders", orderRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/store-setup", storeSetupRoutes);
export default app;

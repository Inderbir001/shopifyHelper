import express from "express";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/orders", orderRoutes);
app.use("/api/stores", storeRoutes);
export default app;

import dotenv from "dotenv";

import { setupMarkets }
from "../services/shopify/setupMarkets.js";

dotenv.config();

await setupMarkets(
  process.env.SHOPIFY_STORE,
  process.env.SHOPIFY_ACCESS_TOKEN
);
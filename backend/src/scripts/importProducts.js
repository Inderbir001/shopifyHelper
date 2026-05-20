import dotenv from "dotenv";

dotenv.config();

import { importProductsFromCSV } from "../services/shopify/importCsvService.js";

await importProductsFromCSV(
  "./csv/products.csv",
);

console.log(
  "✅ CSV IMPORT FINISHED",
);
import fs from "fs";
import csv from "csv-parser";

import { createProduct } from "./productService.js";

export async function importProductsFromCSV(filePath, store, token) {
  const groupedProducts = {};

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)

      .pipe(csv())

      .on("data", (row) => {
        const handle = row.Handle;

        // -----------------------------------
        // CREATE PRODUCT GROUP
        // -----------------------------------

        if (!groupedProducts[handle]) {
          groupedProducts[handle] = {
            title: row.Title,

            body_html: row["Body (HTML)"] || "",

            vendor: row.Vendor || "PluginHive",

            product_type: row.Type || "",

            tags: row.Tags || "",

            status: row.Status || "active",

            options: [],

            variants: [],
          };
        }

        // -----------------------------------
        // OPTIONS
        // -----------------------------------

        const optionNames = [];

        if (row["Option1 Name"]) {
          optionNames.push({
            name: row["Option1 Name"],
          });
        }

        if (row["Option2 Name"]) {
          optionNames.push({
            name: row["Option2 Name"],
          });
        }

        if (row["Option3 Name"]) {
          optionNames.push({
            name: row["Option3 Name"],
          });
        }

        groupedProducts[handle].options = optionNames;

        // -----------------------------------
        // VARIANT
        // -----------------------------------

        groupedProducts[handle].variants.push({
          option1: row["Option1 Value"] || null,

          option2: row["Option2 Value"] || null,

          option3: row["Option3 Value"] || null,

          sku: row["Variant SKU"] || "",

          price: row["Variant Price"] || "0.00",

          inventory_quantity: parseInt(row["Variant Inventory Qty"] || 0),

          inventory_management: "shopify",

          inventory_policy: row["Variant Inventory Policy"] || "deny",

          fulfillment_service: "manual",

          taxable: row["Variant Taxable"] === "true",

          requires_shipping: row["Variant Requires Shipping"] === "true",

          grams: parseFloat(row["Variant Grams"] || 0),

          weight_unit: row["Variant Weight Unit"] || "kg",

          barcode: row["Variant Barcode"] || "",

          compare_at_price: row["Variant Compare At Price"] || null,

          cost: row["Cost per item"] || null,
        });
      })

      .on("end", async () => {
        try {
          const productHandles = Object.keys(groupedProducts);

          console.log(`Found ${productHandles.length} products`);

          // -----------------------------------
          // CREATE PRODUCTS
          // -----------------------------------

          for (const handle of productHandles) {
            const productPayload = groupedProducts[handle];

            const createdProduct = await createProduct(
              store,
              token,
              productPayload,
            );

            console.log(`✅ Product Created: ${productPayload.title}`);

            console.log(`Product ID: ${createdProduct.product.id}`);

            console.log(`Variants: ${productPayload.variants.length}`);
          }

          console.log("✅ ALL PRODUCTS IMPORTED");

          resolve();
        } catch (err) {
          console.log("❌ IMPORT FAILED");

          console.log(err.response?.data || err.message);

          reject(err);
        }
      });
  });
}

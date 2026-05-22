// import shopifyApi from "../../config/shopify.js";

// export async function createProduct(productData) {
//   const response = await shopifyApi.post("/products.json", {
//     product: productData,
//   });

//   return response.data;
// }

import { createShopifyApi } from "../../config/shopify.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, retries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isConnReset = err.code === "ECONNRESET" || err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT";
      if (isConnReset && attempt < retries) {
        console.log(`   Retrying (${attempt}/${retries}) after ${delayMs}ms — ${err.code}`);
        await sleep(delayMs * attempt);
      } else {
        throw err;
      }
    }
  }
}

export async function createProduct(store, token, productData) {
  const shopifyApi = createShopifyApi(store, token);
  const response = await shopifyApi.post("/products.json", { product: productData });
  return response.data;
}

export async function updateVariantShippingDetails(store, token, variant, locationGid) {
  const shopifyApi = createShopifyApi(store, token);
  const numericLocationId = Number(locationGid.toString().split("/").pop());

  await withRetry(() =>
    shopifyApi.put(`/inventory_items/${variant.inventory_item_id}.json`, {
      inventory_item: {
        harmonized_system_code: "611011",
        country_of_origin_code: "US",
      },
    })
  );

  await sleep(300);

  await withRetry(() =>
    shopifyApi.post("/inventory_levels/connect.json", {
      location_id: numericLocationId,
      inventory_item_id: variant.inventory_item_id,
      relocate_if_necessary: true,
    })
  );

  await sleep(300);

  await withRetry(() =>
    shopifyApi.post("/inventory_levels/set.json", {
      location_id: numericLocationId,
      inventory_item_id: variant.inventory_item_id,
      available: 111111,
    })
  );
}
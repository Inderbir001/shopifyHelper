// import shopifyApi from "../../config/shopify.js";

// export async function createProduct(productData) {
//   const response = await shopifyApi.post("/products.json", {
//     product: productData,
//   });

//   return response.data;
// }

import { createShopifyApi } from "../../config/shopify.js";

export async function createProduct(
  store,
  token,
  productData,
) {
  const shopifyApi =
    createShopifyApi(
      store,
      token,
    );

  const response =
    await shopifyApi.post(
      "/products.json",
      {
        product: productData,
      },
    );

  return response.data;
}
import { createShopifyApi } from "../config/shopify.js";

export const createOrderService = async (orderData, storeUrl, token) => {
  const shopifyApi = createShopifyApi(
    storeUrl || process.env.SHOPIFY_STORE,
    token || process.env.SHOPIFY_ACCESS_TOKEN
  );
  const response = await shopifyApi.post("/orders.json", {
    order: orderData,
  });
  return response.data;
};

import { createShopifyApi } from "../config/shopify.js";

export const createOrderService = async (orderData) => {
  const shopifyApi = createShopifyApi(
    process.env.SHOPIFY_STORE,
    process.env.SHOPIFY_ACCESS_TOKEN
  );
  const response = await shopifyApi.post("/orders.json", {
    order: orderData,
  });
  return response.data;
};

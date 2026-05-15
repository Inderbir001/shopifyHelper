import shopifyApi from "../config/shopify.js";

export const createOrderService = async (orderData) => {
  const response = shopifyApi.post("/orders.json", {
    order: orderData,
  });

  return response.data;
};

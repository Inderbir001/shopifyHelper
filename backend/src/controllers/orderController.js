import { createOrderService } from "../services/orderService.js";

export const createOrder = async (req, res) => {
  try {
    const { storeUrl, token, ...orderData } = req.body;
    const result = await createOrderService(orderData, storeUrl, token);
    res.json(result);
  } catch (error) {
    const shopifyError = error.response?.data;
    console.error("Order creation failed:", shopifyError ?? error.message);
    res.status(error.response?.status ?? 500).json({
      error: shopifyError ?? error.message,
    });
  }
};

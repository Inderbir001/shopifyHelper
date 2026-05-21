import { createOrderService } from "../services/orderService.js";

export const createOrder = async (req, res) => {
  try {
    const result = await createOrderService(req.body);
    res.json(result);
  } catch (error) {
    const shopifyError = error.response?.data;
    console.error("Order creation failed:", shopifyError ?? error.message);
    res.status(error.response?.status ?? 500).json({
      error: shopifyError ?? error.message,
    });
  }
};

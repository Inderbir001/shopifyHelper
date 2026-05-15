import { createOrderService } from "../services/orderService.js";

export const createOrder = async (req, res) => {
  try {
    const result = await createOrderService(req.body);
    res.json(result);
  } catch (error) {
    console.log(error.message.data);
    res.status(500).json({
      error: error.message,
    });
  }
};

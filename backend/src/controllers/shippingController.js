import { setupShipping } from "../services/shopify/setupShippingService.js";

export const setupStoreShipping = async (req, res) => {
  try {
    const { store, token } = req.body;
    const result = await setupShipping(store, token);
    res.json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

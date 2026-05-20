import { createStoreAutomation } from "../services/shopify/storeService.js";

export const createStore =
  async (req, res) => {
    try {
      const result =
        await createStoreAutomation(
          req.body,
        );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
import { setupMarkets } from "../services/shopify/setupMarkets.js";
import { importProductsFromCSV } from "../services/shopify/importCsvService.js";
import { activatePayment } from "../services/shopify/activatePaymentService.js";
import { getOrCreateUSLocation } from "../services/shopify/setupShippingService.js";

export const runSetupMarkets = async (req, res) => {
  try {
    const { store, token } = req.body;
    console.log(`\n▶ Running standalone: Setup Markets on ${store}`);
    await setupMarkets(store, token);
    res.json({ success: true });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const runImportProducts = async (req, res) => {
  try {
    const { store, token } = req.body;
    console.log(`\n▶ Running standalone: Import Products on ${store}`);
    console.log("   Fetching US Warehouse location...");
    const locationGid = await getOrCreateUSLocation(store, token);
    console.log(`   Using location: ${locationGid}`);
    const result = await importProductsFromCSV("./csv/products.csv", store, token, locationGid);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const runActivatePayment = async (req, res) => {
  try {
    const { store } = req.body;
    const storeName = store.replace(".myshopify.com", "");
    console.log(`\n▶ Running standalone: Activate Payment on ${storeName}`);
    await activatePayment(storeName);
    res.json({ success: true });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

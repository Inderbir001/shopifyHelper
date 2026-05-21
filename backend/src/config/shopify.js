import axios from "axios";

export function createShopifyApi(store, token) {
  return axios.create({
    baseURL: `https://${store}/admin/api/${process.env.SHOPIFY_API_VERSION}`,
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });
}

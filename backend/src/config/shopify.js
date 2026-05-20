// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();

// const shopifyApi = axios.create({
//   baseURL: `https://${process.env.SHOPIFY_STORE}/admin/api/${process.env.SHOPIFY_API_VERSION}`,
//   headers: {
//     "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
//     "Content-Type": "application/json",
//   },
// });

// export default shopifyApi;
import axios from "axios";

export function createShopifyApi(store, token) {
  return axios.create({
    baseURL: `https://${store}/admin/api/2023-01`,

    headers: {
      "X-Shopify-Access-Token": token,

      "Content-Type": "application/json",
    },
  });
}

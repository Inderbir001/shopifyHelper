import api from "./axios.js";

export const setupMarketsApi = (store, token) =>
  api.post("/api/store-setup/markets", { store, token });

export const setupShippingApi = (store, token) =>
  api.post("/api/store-setup/shipping", { store, token });

export const importProductsApi = (store, token) =>
  api.post("/api/store-setup/products", { store, token });

export const activatePaymentApi = (store) =>
  api.post("/api/store-setup/payment", { store });

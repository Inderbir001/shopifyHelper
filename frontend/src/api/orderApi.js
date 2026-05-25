import api from "./axios.js";

export const createOrderApi = async (orderData) => {
  const response = await api.post("api/orders/create", orderData);
  return response.data;
};

export const duplicateOrderApi = async (storeUrl, token, orderName) => {
  const response = await api.post("api/orders/duplicate", { storeUrl, token, orderName });
  return response.data;
};

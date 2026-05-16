import api from "./axios.js";

export const createOrderApi = async (orderData) => {
  const response = await api.post("api/orders/create", orderData);
  return response.data;
};

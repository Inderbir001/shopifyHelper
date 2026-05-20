// frontend/src/api/storeApi.js

import api from "./axios.js";

export const createStoreApi = async (storeData) => {
  const response = await api.post("/api/stores/create", storeData);

  return response.data;
};

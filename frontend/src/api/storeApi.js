// frontend/src/api/storeApi.js

import api from "./axios.js";

export const createStoreApi = async (storeData, signal) => {
  const response = await api.post("/api/stores/create", storeData, { signal });

  return response.data;
};

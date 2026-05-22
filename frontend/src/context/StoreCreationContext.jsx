import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createStoreApi } from "../api/storeApi";
import { useActivity } from "./ActivityContext";
import { useToast } from "./ToastContext";

const StoreCreationContext = createContext(null);

export function StoreCreationProvider({ children }) {
  const { addActivity } = useActivity();
  const { showToast } = useToast();

  const [storeName, setStoreNameState] = useState(
    () => localStorage.getItem("sc_storeName") ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [cancelled, setCancelled] = useState(false);
  const [logs, setLogs] = useState([]);

  const abortRef = useRef(null);
  const esRef = useRef(null);

  const setStoreName = (name) => {
    setStoreNameState(name);
    localStorage.setItem("sc_storeName", name);
  };

  const startCreation = async () => {
    if (loading) return;
    setCancelled(false);
    setLoading(true);
    setResult(null);
    setLogs([]);
    abortRef.current = new AbortController();

    // open SSE stream
    const es = new EventSource("http://localhost:5000/api/stores/stream");
    esRef.current = es;
    es.onmessage = (e) => {
      const { message } = JSON.parse(e.data);
      setLogs((prev) => [...prev, message]);
    };

    try {
      const response = await createStoreApi(
        { storeName },
        abortRef.current.signal
      );
      const data = response.data;
      setResult(data);
      addActivity("store", `Store "${storeName}" created — ${data.storeUrl}`);
      showToast("Store created successfully!", "success");
    } catch (error) {
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
        setCancelled(true);
        showToast("Store creation cancelled.", "error");
      } else {
        showToast("Failed to create store. Check console for details.", "error");
      }
    } finally {
      setLoading(false);
      es.close();
      esRef.current = null;
    }
  };

  const cancelCreation = () => {
    abortRef.current?.abort();
  };

  const clearResult = () => setResult(null);

  // cleanup on unmount
  useEffect(() => () => esRef.current?.close(), []);

  return (
    <StoreCreationContext.Provider
      value={{ storeName, setStoreName, loading, result, cancelled, logs, startCreation, cancelCreation, clearResult }}
    >
      {children}
    </StoreCreationContext.Provider>
  );
}

export const useStoreCreation = () => useContext(StoreCreationContext);

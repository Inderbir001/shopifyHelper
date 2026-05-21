import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import CreateStore from "./pages/CreateStore";
import { ActivityProvider } from "./context/ActivityContext";
import { StoreCreationProvider } from "./context/StoreCreationContext";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
    <ActivityProvider>
    <StoreCreationProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/orders" element={<Orders />} />

        <Route path="/products" element={<Products />} />

        <Route path="/settings" element={<Settings />} />

        <Route path="/create-store" element={<CreateStore />} />
      </Routes>
    </BrowserRouter>
    </StoreCreationProvider>
    </ActivityProvider>
    </ToastProvider>
  );
}

export default App;

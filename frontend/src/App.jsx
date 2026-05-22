import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import CreateStore from "./pages/CreateStore";
import SetupMarketsPage from "./pages/store-setup/SetupMarketsPage";
import SetupShippingPage from "./pages/store-setup/SetupShippingPage";
import ImportProductsPage from "./pages/store-setup/ImportProductsPage";
import ActivatePaymentPage from "./pages/store-setup/ActivatePaymentPage";
import { ActivityProvider } from "./context/ActivityContext";
import { StoreCreationProvider } from "./context/StoreCreationContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
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

        <Route path="/store-setup/markets" element={<SetupMarketsPage />} />

        <Route path="/store-setup/shipping" element={<SetupShippingPage />} />

        <Route path="/store-setup/products" element={<ImportProductsPage />} />

        <Route path="/store-setup/payment" element={<ActivatePaymentPage />} />
      </Routes>
    </BrowserRouter>
    </StoreCreationProvider>
    </ActivityProvider>
    </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

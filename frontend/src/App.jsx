import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import CreateStore from "./pages/CreateStore";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/orders" element={<Orders />} />

        <Route path="/products" element={<Products />} />

        <Route path="/settings" element={<Settings />} />

        <Route path="/create-store" element={<CreateStore />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

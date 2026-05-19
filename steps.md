# SHOPIFY HELPER — FULL PROJECT SETUP GUIDE

---

# PHASE 1 — CREATE PROJECT

Create root folder:

```txt
shopifyHelper/
 ├── backend
 └── frontend
```

Open project in VS Code.

---

# PHASE 1.5 — GITHUB SETUP

---

# STEP 1 — Initialize Git

Inside root folder:

```bash
git init
```

---

# STEP 2 — Create Root .gitignore

Create:

```txt
shopifyHelper/.gitignore
```

Add:

```txt
node_modules
.env
dist
coverage
```

---

# STEP 3 — Add Files

```bash
git add .
```

---

# STEP 4 — First Commit

```bash
git commit -m "Initial project setup"
```

---

# STEP 5 — Rename Branch

```bash
git branch -M main
```

---

# STEP 6 — Connect GitHub Repository

```bash
git remote add origin git@github.com:Inderbir001/shopifyHelper.git
```

---

# STEP 7 — Push Code

```bash
git push -u origin main
```

---

# PHASE 2 — SETUP BACKEND

Go inside backend:

```bash
cd backend
```

---

# STEP 1 — Initialize Node Project

```bash
npm init -y
```

---

# STEP 2 — Install Packages

Main packages:

```bash
npm install express cors dotenv axios
```

Dev package:

```bash
npm install -D nodemon
```

---

# STEP 3 — Create Backend Structure

```txt
backend/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── config/
│   ├── middlewares/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── nodemon.json
```

---

# STEP 4 — Create Backend .gitignore

Inside backend:

```txt
node_modules
.env
```

---

# STEP 5 — Setup package.json Scripts

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

---

# STEP 6 — Enable ES Modules

Add in package.json:

```json
"type": "module"
```

---

# IMPORTANT — ES MODULE IMPORT RULE

ALL local imports must include `.js`

✅ Correct:

```js
import app from "./app.js";
```

❌ Wrong:

```js
import app from "./app";
```

---

# STEP 7 — Create app.js

Path:

```txt
src/app.js
```

Code:

```js
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

export default app;
```

---

# STEP 8 — Create server.js

Path:

```txt
src/server.js
```

Code:

```js
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

# STEP 9 — Create .env

```env
PORT=5000
```

---

# STEP 10 — Run Backend

```bash
npm run dev
```

Visit:

```txt
http://localhost:5000
```

Expected:

```txt
API Running
```

---

# PHASE 3 — SETUP FRONTEND

Open new terminal.

Go inside frontend:

```bash
cd frontend
```

---

# STEP 1 — Create React App Using Vite

```bash
npm create vite@latest . -- --template react
```

IMPORTANT:

`.` means current folder.

---

# STEP 2 — Install Dependencies

```bash
npm install
```

Install frontend packages:

```bash
npm install axios react-router-dom
```

---

# STEP 3 — Run Frontend

```bash
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

# PHASE 4 — CLEAN FRONTEND

Delete:

```txt
src/assets
src/App.css
```

---

# STEP 1 — Replace main.jsx

```js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

---

# STEP 2 — Replace App.jsx

```js
function App() {
  return (
    <div>
      <h1>Shopify Helper</h1>
    </div>
  );
}

export default App;
```

---

# PHASE 5 — CREATE FRONTEND STRUCTURE

Inside frontend/src create:

```txt
src/
│
├── api/
├── components/
├── pages/
├── services/
├── utils/
├── hooks/
├── layout/
├── styles/
│
├── App.jsx
└── main.jsx
```

---

# PHASE 6 — CONNECT FRONTEND TO BACKEND

---

# STEP 1 — Create Axios Instance

Create:

```txt
src/api/axios.js
```

Code:

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

export default api;
```

---

# IMPORTANT — FRONTEND/BACKEND PORTS

| Service         | Port |
| --------------- | ---- |
| React + Vite    | 5173 |
| Express Backend | 5000 |

---

# STEP 2 — Test API Connection

Update App.jsx

```js
import { useEffect } from "react";
import api from "./api/axios.js";

function App() {
  useEffect(() => {
    fetchApi();
  }, []);

  const fetchApi = async () => {
    try {
      const response = await api.get("/");

      console.log(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Shopify Helper</h1>
    </div>
  );
}

export default App;
```

---

# PHASE 7 — CREATE ORDER MODULE

---

# STEP 1 — Create Backend Route

Create:

```txt
src/routes/orderRoutes.js
```

Code:

```js
import express from "express";

const router = express.Router();

router.post("/create", (req, res) => {
  res.json({
    message: "Order Created",
  });
});

export default router;
```

---

# STEP 2 — Connect Route

Update app.js

```js
import express from "express";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/orders", orderRoutes);

export default app;
```

---

# IMPORTANT — POST ROUTES CANNOT BE TESTED DIRECTLY IN BROWSER

Typing URL in browser sends:

```txt
GET request
```

POST routes must be tested using:

* Postman
* Thunder Client
* frontend axios requests

---

# STEP 3 — Test Route

POST request:

```txt
http://localhost:5000/api/orders/create
```

---

# PHASE 8 — SHOPIFY API CONNECTION

---

# STEP 1 — Create Shopify Config

Create:

```txt
src/config/shopify.js
```

Code:

```js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const shopifyApi = axios.create({
  baseURL: `https://${process.env.SHOPIFY_STORE}/admin/api/${process.env.SHOPIFY_API_VERSION}`,

  headers: {
    "X-Shopify-Access-Token":
      process.env.SHOPIFY_ACCESS_TOKEN,

    "Content-Type": "application/json",
  },
});

export default shopifyApi;
```

---

# IMPORTANT — Shopify URL STRUCTURE

Shopify Admin API format:

```txt
https://your-store.myshopify.com/admin/api/2025-01
```

Endpoints are appended:

```txt
/orders.json
/graphql.json
/products.json
```

Example:

```js
shopifyApi.post("/orders.json")
```

---

# STEP 2 — Update .env

```env
PORT=5000

SHOPIFY_STORE=your-store.myshopify.com

SHOPIFY_ACCESS_TOKEN=shpat_xxxxx

SHOPIFY_API_VERSION=2025-01
```

---

# PHASE 9 — REAL ORDER CREATION

---

# STEP 1 — Create Service

Create:

```txt
src/services/orderService.js
```

Code:

```js
import shopifyApi from "../config/shopify.js";

export const createOrderService = async (
  orderData
) => {
  const response = await shopifyApi.post(
    "/orders.json",
    {
      order: orderData,
    }
  );

  return response.data;
};
```

---

# STEP 2 — Create Controller

Create:

```txt
src/controllers/orderController.js
```

Code:

```js
import { createOrderService } from "../services/orderService.js";

export const createOrder = async (
  req,
  res
) => {
  try {
    const result = await createOrderService(
      req.body
    );

    res.json(result);

  } catch (error) {

    console.log(error.response?.data);

    res.status(500).json({
      error: error.message,
    });
  }
};
```

---

# STEP 3 — Update Routes

```js
import express from "express";
import { createOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/create", createOrder);

export default router;
```

---

# IMPORTANT — REST API VS GRAPHQL API

Current implementation uses:

```txt
REST Admin API
```

Correct REST field names:

```txt
line_items
```

Wrong GraphQL fields:

```txt
lineItems
priceSet
shopMoney
```

Endpoint used:

```txt
/orders.json
```

---

# STEP 4 — Test Using Postman

POST request body:

```json
{
  "line_items": [
    {
      "quantity": 1,
      "price": 10,
      "title": "Big Brown Bear Boots"
    }
  ]
}
```

Orders should now be created in Shopify.

---

# PHASE 10 — FRONTEND ORDER UI

---

# STEP 1 — Create Pages

Inside:

```txt
frontend/src/pages
```

Create:

```txt
Dashboard.jsx
Orders.jsx
Products.jsx
Settings.jsx
```

---

# STEP 2 — Create Components Structure

Inside:

```txt
frontend/src/components
```

Create:

```txt
orders/
common/
layout/
```

Inside orders:

```txt
OrderForm.jsx
```

---

# STEP 3 — Create Order API File

Create:

```txt
frontend/src/api/orderApi.js
```

Code:

```js
import api from "./axios.js";

export const createOrderApi = async (
  orderData
) => {
  const response = await api.post(
    "/api/orders/create",
    orderData
  );

  return response.data;
};
```

---

# PHASE 10.5 — SEPARATE ORDER PAYLOAD LOGIC

Create:

```txt
frontend/src/utils/orderPayload.js
```

Code:

```js
export const buildOrderPayload = ({
  email,
  title,
  quantity,
  price,
}) => {
  return {
    email,

    line_items: [
      {
        title,
        quantity: Number(quantity),
        price: Number(price),
      },
    ],
  };
};
```

---

# STEP 4 — Create Order Form Component

Create:

```txt
frontend/src/components/orders/OrderForm.jsx
```

Code:

```jsx
import { useState } from "react";

import { createOrderApi } from "../../api/orderApi.js";

import { buildOrderPayload } from "../../utils/orderPayload.js";

function OrderForm() {
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const orderData = buildOrderPayload({
        email,
        title,
        quantity,
        price,
      });

      const response = await createOrderApi(
        orderData
      );

      console.log(response);

      alert("Order created successfully");

    } catch (error) {

      console.log(error);

      alert("Order Creation failed");

    } finally {

      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Order</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>

          <input
            type="email"
            placeholder="Customer Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <div>
          <label>Title</label>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Quantity</label>

          <input
            type="number"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Price</label>

          <input
            type="number"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
          />
        </div>

        <br />

        <button type="submit">
          {loading
            ? "Creating..."
            : "Create Order"}
        </button>
      </form>
    </div>
  );
}

export default OrderForm;
```

---

# STEP 5 — Create Orders Page

```jsx
import OrderForm from "../components/orders/OrderForm";

function Orders() {
  return (
    <div>
      <h1>Orders Page</h1>

      <OrderForm />
    </div>
  );
}

export default Orders;
```

---

# STEP 6 — Setup React Router

Update App.jsx

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

# STEP 7 — Create Temporary Pages

Dashboard.jsx

```jsx
function Dashboard() {
  return <h1>Dashboard</h1>;
}

export default Dashboard;
```

Products.jsx

```jsx
function Products() {
  return <h1>Products</h1>;
}

export default Products;
```

Settings.jsx

```jsx
function Settings() {
  return <h1>Settings</h1>;
}

export default Settings;
```

---

# STEP 8 — Start Frontend

```bash
npm run dev
```

Open:

```txt
http://localhost:5173/orders
```

---

# COMPLETE APPLICATION FLOW

```txt
React Form
   ↓
Axios API Call
   ↓
Express Route
   ↓
Controller
   ↓
Service
   ↓
Shopify API
   ↓
Response
   ↓
Frontend UI
```

---

# PHASE 11 — INSTALL TAILWIND CSS

Inside frontend:

```bash
npm install tailwindcss @tailwindcss/vite
```

---

# STEP 1 — Update vite.config.js

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

---

# STEP 2 — Create index.css

Create:

```txt
src/index.css
```

Add:

```css
@import "tailwindcss";
```

---

# STEP 3 — Import index.css

Update main.jsx

```js
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

---

# PHASE 12 — CREATE LAYOUT SYSTEM

Create inside:

```txt
src/components/layout
```

Files:

```txt
Sidebar.jsx
Navbar.jsx
MainLayout.jsx
```

---

# STEP 1 — Sidebar.jsx

```jsx
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-10">
        Shopify Helper
      </h1>

      <nav className="flex flex-col gap-4">
        <Link to="/">Dashboard</Link>

        <Link to="/orders">Orders</Link>

        <Link to="/products">Products</Link>

        <Link to="/settings">Settings</Link>
      </nav>
    </div>
  );
}

export default Sidebar;
```

---

# STEP 2 — Navbar.jsx

```jsx
function Navbar() {
  return (
    <div className="h-16 bg-white shadow flex items-center px-6">
      <h2 className="text-xl font-semibold">
        Shopify Admin Panel
      </h2>
    </div>
  );
}

export default Navbar;
```

---

# STEP 3 — MainLayout.jsx

```jsx
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function MainLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Navbar />

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
```

---

# PHASE 13 — USE LAYOUT

Update pages to use MainLayout.

Example Orders.jsx

```jsx
import MainLayout from "../components/layout/MainLayout";

import OrderForm from "../components/orders/OrderForm";

function Orders() {
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Orders
      </h1>

      <OrderForm />
    </MainLayout>
  );
}

export default Orders;
```

---

# PHASE 14 — IMPROVE ORDER FORM UI

Add Tailwind classes to OrderForm.jsx for professional UI styling.

---

# NEXT FEATURES

Recommended next steps:

1. Get Orders
2. Orders Table
3. Delete/Cancel Order
4. Product Management
5. Search Orders
6. Pagination
7. Dashboard Cards
8. Toast Notifications
9. Authentication
10. Webhooks

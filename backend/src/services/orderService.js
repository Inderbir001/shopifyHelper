import { createShopifyApi } from "../config/shopify.js";

export const createOrderService = async (orderData, storeUrl, token) => {
  const shopifyApi = createShopifyApi(
    storeUrl || process.env.SHOPIFY_STORE,
    token || process.env.SHOPIFY_ACCESS_TOKEN
  );
  const response = await shopifyApi.post("/orders.json", { order: orderData });
  return response.data;
};

export const fetchOrderService = async (orderId, storeUrl, token) => {
  const shopifyApi = createShopifyApi(storeUrl, token);

  const isNumeric = /^\d+$/.test(orderId.toString().trim());
  if (isNumeric) {
    const response = await shopifyApi.get(`/orders/${orderId}.json`);
    return response.data.order;
  }

  const name = orderId.toString().trim().startsWith("#") ? orderId : `#${orderId}`;
  const search = await shopifyApi.get(
    `/orders.json?name=${encodeURIComponent(name)}&status=any`
  );
  const orders = search.data.orders;
  if (!orders?.length) throw new Error(`Order ${name} not found`);
  return orders[0];
};

export const duplicateOrderService = async (orderName, storeUrl, token) => {
  const shopifyApi = createShopifyApi(storeUrl, token);

  // Fetch source order by name (with or without #)
  const name = orderName.toString().startsWith("#") ? orderName : `#${orderName}`;
  const search = await shopifyApi.get(
    `/orders.json?name=${encodeURIComponent(name)}&status=any`
  );
  const orders = search.data.orders;
  if (!orders?.length) throw new Error(`Order ${name} not found`);

  const src = orders[0];

  const newOrder = {
    line_items: src.line_items.map((item) => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price,
    })),
    shipping_address: src.shipping_address,
    billing_address: src.billing_address,
    email: src.email,
    financial_status: "paid",
    send_receipt: false,
    send_fulfillment_receipt: false,
  };

  const response = await shopifyApi.post("/orders.json", { order: newOrder });
  return { source: src, order: response.data.order };
};

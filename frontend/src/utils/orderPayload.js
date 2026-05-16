export const buildOrderPayload = ({
  email,
  title,
  quantity,
  price,
}) => {
  return {
    email,

    financial_status: "paid",

    fulfillment_status: null,

    send_receipt: true,

    currency: "EUR",

    note: "Created from Shopify Helper",

    tags: "shopify-helper,test-order",

    customer: {
      first_name: "Inder",
      last_name: "Singh",
      email,
    },

    billing_address: {
      first_name: "Inder",
      last_name: "Singh",
      address1: "Street 1",
      city: "Bangalore",
      province: "Karnataka",
      country: "India",
      zip: "560001",
      phone: "9999999999",
    },

    shipping_address: {
      first_name: "Inder",
      last_name: "Singh",
      address1: "Street 1",
      city: "Bangalore",
      province: "Karnataka",
      country: "India",
      zip: "560001",
      phone: "9999999999",
    },

    line_items: [
      {
        title,
        quantity: Number(quantity),
        price: Number(price),
      },
    ],

    shipping_lines: [
      {
        title: "Standard Shipping",
        price: "10.00",
        code: "STANDARD",
      },
    ],

    tax_lines: [
      {
        price: "5.00",
        rate: 0.05,
        title: "GST",
      },
    ],

    transactions: [
      {
        kind: "sale",
        status: "success",
        amount: Number(price) * Number(quantity),
      },
    ],

    note_attributes: [
      {
        name: "source",
        value: "shopify-helper-app",
      },
    ],

    metafields: [
      {
        namespace: "custom",
        key: "test_key",
        value: "test_value",
        type: "single_line_text_field",
      },
    ],
  };
};
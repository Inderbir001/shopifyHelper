import { faker } from "@faker-js/faker";

export const buildOrderPayload = ({
  quantity,
  price,
  productId,
  variantId,
  firstName = faker.person.firstName(),
  lastName = faker.person.lastName(),
  phone = faker.helpers.arrayElement([
    "+14155552671",
    "+14155552672",
    "+14155552673",
    "+14155552674",
    "+14155552675",
    "+14155552676",
    "+14155552677",
    "+14155552678",
    "+14155552679",
    "+14155552613",
    "+14155552623",
    "+14155552633",
    "+14155552653",
    "+14155552673",
  ]),
  email = faker.internet.email(),
  address1 = "121 Evelyn Rd",
  address2 = "",
  city = "Needham Heights",
  province = "Massachusetts",
  country = "United States",
  zip = "02494",
  company = faker.company.name(),
  currency = "USD",
  shippingPrice = price,
  vendor = faker.company.name(),
  tags = faker.helpers
    .arrayElements(
      [
        "shopify-helper",
        "test-order",
        "sale",
        "featured",
        "new",
        "premium",
        "bestseller",
        "summer",
        "winter",
        "trending",
      ],
      { min: 2, max: 5 },
    )
    .join(","),
  note = "Created from Shopify Helper",
}) => {
  return {
    email,
    phone,
    currency,
    financial_status: "paid",
    note,
    tags,
    source_name: "shopify-helper",

    billing_address: {
      first_name: firstName,
      last_name: lastName,
      company,
      address1,
      address2,
      city,
      province,
      country,
      zip,
      phone,
    },

    shipping_address: {
      first_name: firstName,
      last_name: lastName,
      company,
      address1,
      address2,
      city,
      province,
      country,
      zip,
      phone,
    },

    line_items: [
      {
        variant_id: Number(variantId),
        quantity: Number(quantity),
        price: Number(price),
      },
    ],
  };
};

import dotenv from "dotenv";

import { createShopifyApi } from "../config/shopify.js";

dotenv.config();

async function testGraphql() {
  const shopifyApi = createShopifyApi(
    process.env.SHOPIFY_STORE,
    process.env.SHOPIFY_ACCESS_TOKEN,
  );

  const query = `
query {

  markets(first: 20) {

    edges {

      node {

        id
        name
        status

        conditions {
          regionsCondition {
            regions(first: 250) {
              edges {
                node {

                  ... on MarketRegionCountry {
                    name
                    code
                  }
                }
              }
            }
          }
        }

        regions(first: 250) {

          edges {

            node {

              ... on MarketRegionCountry {

                id
                name
                code
              }
            }
          }
        }
      }
    }
  }
}
`;

  try {
    const response = await shopifyApi.post("/graphql.json", {
      query,
    });

    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
  }
}

testGraphql();

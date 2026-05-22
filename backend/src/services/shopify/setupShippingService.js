import { createShopifyApi } from "../../config/shopify.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gql(response, field) {
  const body = response.data;
  if (body.errors?.length) {
    throw new Error(`GraphQL errors on ${field}: ${body.errors.map((e) => e.message).join(", ")}`);
  }
  if (!body.data) {
    console.error("Unexpected GraphQL response:", JSON.stringify(body, null, 2));
    throw new Error(`No data returned for ${field}`);
  }
  return body.data[field];
}

function throwOnUserErrors(result, label) {
  const errors = result?.userErrors;
  if (errors?.length) {
    throw new Error(`${label}: ${errors.map((e) => e.message).join(", ")}`);
  }
}

const FLAT_RATE_METHOD = {
  name: "Flat Rate",
  description: "3-4 business days",
  active: true,
  rateDefinition: {
    price: { amount: "0.00", currencyCode: "USD" },
  },
};

// ─── Step 1: Create US Location ───────────────────────────────────────────────

async function createUSLocation(shopifyApi) {
  console.log("\n--- STEP 1: Creating US Location ---");

  const response = await shopifyApi.post("/graphql.json", {
    query: `
      mutation locationAdd($input: LocationAddInput!) {
        locationAdd(input: $input) {
          location { id name }
          userErrors { field message }
        }
      }
    `,
    variables: {
      input: {
        name: "US Warehouse",
        address: {
          address1: "1178 Broadway",
          city: "New York",
          provinceCode: "NY",
          zip: "10001",
          countryCode: "US",
          phone: "+12125551234",
        },
      },
    },
  });

  const result = gql(response, "locationAdd");
  const alreadyExists = result?.userErrors?.some((e) =>
    e.message.toLowerCase().includes("already have a location with this name"),
  );

  if (alreadyExists) {
    console.log("   Location already exists — fetching existing...");
    return getExistingLocationId(shopifyApi, "US Warehouse");
  }

  throwOnUserErrors(result, "locationAdd");

  console.log("✅ Location created:", result.location.id, result.location.name);
  return result.location.id;
}

async function getExistingLocationId(shopifyApi, name) {
  const response = await shopifyApi.post("/graphql.json", {
    query: `
      query {
        locations(first: 50) {
          edges {
            node { id name }
          }
        }
      }
    `,
  });

  const locations = gql(response, "locations").edges;
  const match = locations.find((l) => l.node.name === name);
  if (!match) throw new Error(`Location "${name}" not found`);

  console.log("✅ Reusing existing location:", match.node.id, match.node.name);
  return match.node.id;
}

// ─── Step 2: Get Delivery Profile ─────────────────────────────────────────────

async function getDeliveryProfile(shopifyApi) {
  console.log("\n--- STEP 2: Fetching Delivery Profile ---");

  const response = await shopifyApi.post("/graphql.json", {
    query: `
      query {
        deliveryProfiles(first: 5) {
          edges {
            node {
              id
              name
              default
              profileLocationGroups {
                locationGroup { id }
                locationGroupZones(first: 20) {
                  edges {
                    node {
                      zone { id name }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
  });

  const profiles = gql(response, "deliveryProfiles").edges;
  if (!profiles.length) throw new Error("No delivery profiles found");

  // prefer default (General) profile
  const profile = profiles.find((p) => p.node.default) ?? profiles[0];
  const { id: profileId, name, profileLocationGroups } = profile.node;

  console.log("✅ Using profile:", name, profileId);

  const locationGroups = profileLocationGroups.map((lg) => ({
    id: lg.locationGroup.id,
    zoneIds: lg.locationGroupZones.edges.map((e) => e.node.zone.id),
  }));

  console.log(
    `   ${locationGroups.length} existing location group(s), ` +
      `${locationGroups.flatMap((lg) => lg.zoneIds).length} existing zone(s)`,
  );

  return { profileId, locationGroups };
}

// ─── Step 3: Update Delivery Profile ─────────────────────────────────────────

async function updateDeliveryProfile(
  shopifyApi,
  profileId,
  locationId,
  locationGroups,
) {
  console.log("\n--- STEP 3: Updating Delivery Profile ---");

  const zonesToCreate = [
    {
      name: "DOM - US",
      countries: [{ code: "US", includeAllProvinces: true }],
      methodDefinitionsToCreate: [FLAT_RATE_METHOD],
    },
    {
      name: "INTL - All Other Zones",
      countries: [{ restOfWorld: true }],
      methodDefinitionsToCreate: [FLAT_RATE_METHOD],
    },
  ];

  const profileInput = {};

  // delete old location groups entirely (cleaner than deleting zones one by one)
  if (locationGroups.length > 0) {
    profileInput.locationGroupsToDelete = locationGroups.map((lg) => lg.id);
  }

  // create new location group with US warehouse + DOM + INTL zones
  profileInput.locationGroupsToCreate = [
    {
      locations: [locationId],
      zonesToCreate,
    },
  ];

  const response = await shopifyApi.post("/graphql.json", {
    query: `
      mutation deliveryProfileUpdate($id: ID!, $profile: DeliveryProfileInput!) {
        deliveryProfileUpdate(id: $id, profile: $profile) {
          profile { id name }
          userErrors { field message }
        }
      }
    `,
    variables: {
      id: profileId,
      profile: profileInput,
    },
  });

  const result = gql(response, "deliveryProfileUpdate");
  throwOnUserErrors(result, "deliveryProfileUpdate");

  console.log("✅ Profile updated:", result.profile.name);
}

// ─── Step 4: Verify ───────────────────────────────────────────────────────────

async function verifyShipping(shopifyApi, profileId) {
  console.log("\n--- STEP 4: Verifying Shipping Setup ---");

  const response = await shopifyApi.post("/graphql.json", {
    query: `
      query {
        deliveryProfiles(first: 5) {
          edges {
            node {
              id
              name
              profileLocationGroups {
                locationGroup { id }
                locationGroupZones(first: 10) {
                  edges {
                    node {
                      zone { id name }
                      methodDefinitions(first: 5) {
                        edges {
                          node { id name active }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
  });

  const profiles = gql(response, "deliveryProfiles").edges;
  const profile = profiles.find((p) => p.node.id === profileId);

  const zones = profile?.node.profileLocationGroups.flatMap((lg) =>
    lg.locationGroupZones.edges.map((e) => e.node.zone.name),
  );

  console.log("✅ Active zones:", zones?.join(", ") ?? "none");
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function setupShipping(store, token) {
  const shopifyApi = createShopifyApi(store, token);

  try {
    console.log("\n=================================");
    console.log("SETTING UP SHIPPING");
    console.log("=================================\n");

    const locationId = await createUSLocation(shopifyApi);
    const { profileId, locationGroups } = await getDeliveryProfile(shopifyApi);
    await updateDeliveryProfile(shopifyApi, profileId, locationId, locationGroups);
    await verifyShipping(shopifyApi, profileId);

    console.log("\n=================================");
    console.log("SHIPPING SETUP COMPLETE");
    console.log("=================================\n");

    return { success: true, locationId, profileId };
  } catch (error) {
    console.error("\nSHIPPING SETUP FAILED:");
    console.error(JSON.stringify(error.response?.data || error.message, null, 2));
    throw error;
  }
}

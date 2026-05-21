import { createShopifyApi } from "../../config/shopify.js";

export async function setupMarkets(store, token) {
  const shopifyApi = createShopifyApi(store, token);

  try {
    console.log("\n=================================");
    console.log("RESETTING MARKETS");
    console.log("=================================\n");

    // -----------------------------------
    // GET ALL MARKETS
    // -----------------------------------

    const marketsQuery = `
      query {

        markets(first: 50) {

          edges {

            node {

              id
              name
              status
            }
          }
        }
      }
    `;

    const marketsResponse = await shopifyApi.post("/graphql.json", {
      query: marketsQuery,
    });

    const markets = marketsResponse.data.data.markets.edges;

    console.log("\nCURRENT MARKETS:\n");

    console.log(JSON.stringify(markets, null, 2));

    // -----------------------------------
    // DELETE ALL NON-US MARKETS
    // -----------------------------------

    for (const market of markets) {
      const name = market.node.name;

      const id = market.node.id;

      // keep US market only

      if (name !== "United States" && name !== "US" && name !== "Domestic") {
        console.log(`\nDELETING MARKET: ${name}\n`);

        const deleteMutation = `
          mutation {

            marketDelete(
              id: "${id}"
            ) {

              deletedId

              userErrors {
                field
                message
              }
            }
          }
        `;

        const deleteResponse = await shopifyApi.post("/graphql.json", {
          query: deleteMutation,
        });

        console.log(JSON.stringify(deleteResponse.data, null, 2));
      }
    }

    // -----------------------------------
    // REFETCH MARKETS
    // -----------------------------------

    const refreshedResponse = await shopifyApi.post("/graphql.json", {
      query: marketsQuery,
    });

    const refreshedMarkets = refreshedResponse.data.data.markets.edges;

    // -----------------------------------
    // FIND US MARKET
    // -----------------------------------

    const usMarket = refreshedMarkets.find(
      (m) =>
        m.node.name === "United States" ||
        m.node.name === "US" ||
        m.node.name === "Domestic",
    );

    if (!usMarket) {
      throw new Error("US market not found");
    }

    console.log("\nUS MARKET:", usMarket.node.id);

    // -----------------------------------
    // RENAME TO DOMESTIC
    // -----------------------------------

    if (usMarket.node.name !== "Domestic") {
      console.log("\nRENAMING US → DOMESTIC\n");

      const renameMutation = `
        mutation {

          marketUpdate(

            id: "${usMarket.node.id}",

            input: {
              name: "Domestic"
            }

          ) {

            market {
              id
              name
            }

            userErrors {
              field
              message
            }
          }
        }
      `;

      const renameResponse = await shopifyApi.post("/graphql.json", {
        query: renameMutation,
      });

      console.log(JSON.stringify(renameResponse.data, null, 2));
    }

    // -----------------------------------
    // INTERNATIONAL COUNTRIES
    // -----------------------------------

    const regionsString = `

{ countryCode: AC }
{ countryCode: AD }
{ countryCode: AE }
{ countryCode: AF }
{ countryCode: AG }
{ countryCode: AI }
{ countryCode: AL }
{ countryCode: AM }
{ countryCode: AO }
{ countryCode: AR }
{ countryCode: AT }
{ countryCode: AU }
{ countryCode: AW }
{ countryCode: AX }
{ countryCode: AZ }
{ countryCode: BA }
{ countryCode: BB }
{ countryCode: BD }
{ countryCode: BE }
{ countryCode: BF }
{ countryCode: BG }
{ countryCode: BH }
{ countryCode: BI }
{ countryCode: BJ }
{ countryCode: BL }
{ countryCode: BM }
{ countryCode: BN }
{ countryCode: BO }
{ countryCode: BQ }
{ countryCode: BR }
{ countryCode: BS }
{ countryCode: BT }
{ countryCode: BW }
{ countryCode: BY }
{ countryCode: BZ }
{ countryCode: CA }
{ countryCode: CC }
{ countryCode: CD }
{ countryCode: CF }
{ countryCode: CG }
{ countryCode: CH }
{ countryCode: CI }
{ countryCode: CK }
{ countryCode: CL }
{ countryCode: CM }
{ countryCode: CN }
{ countryCode: CO }
{ countryCode: CR }
{ countryCode: CV }
{ countryCode: CW }
{ countryCode: CX }
{ countryCode: CY }
{ countryCode: CZ }
{ countryCode: DE }
{ countryCode: DJ }
{ countryCode: DK }
{ countryCode: DM }
{ countryCode: DO }
{ countryCode: DZ }
{ countryCode: EC }
{ countryCode: EE }
{ countryCode: EG }
{ countryCode: ER }
{ countryCode: ES }
{ countryCode: ET }
{ countryCode: FI }
{ countryCode: FJ }
{ countryCode: FK }
{ countryCode: FO }
{ countryCode: FR }
{ countryCode: GA }
{ countryCode: GB }
{ countryCode: GD }
{ countryCode: GE }
{ countryCode: GF }
{ countryCode: GG }
{ countryCode: GH }
{ countryCode: GI }
{ countryCode: GL }
{ countryCode: GM }
{ countryCode: GN }
{ countryCode: GP }
{ countryCode: GQ }
{ countryCode: GR }
{ countryCode: GT }
{ countryCode: GW }
{ countryCode: GY }
{ countryCode: HK }
{ countryCode: HN }
{ countryCode: HR }
{ countryCode: HT }
{ countryCode: HU }
{ countryCode: ID }
{ countryCode: IE }
{ countryCode: IL }
{ countryCode: IM }
{ countryCode: IN }
{ countryCode: IO }
{ countryCode: IQ }
{ countryCode: IS }
{ countryCode: IT }
{ countryCode: JE }
{ countryCode: JM }
{ countryCode: JO }
{ countryCode: JP }
{ countryCode: KE }
{ countryCode: KG }
{ countryCode: KH }
{ countryCode: KI }
{ countryCode: KM }
{ countryCode: KN }
{ countryCode: KR }
{ countryCode: KW }
{ countryCode: KY }
{ countryCode: KZ }
{ countryCode: LA }
{ countryCode: LB }
{ countryCode: LC }
{ countryCode: LI }
{ countryCode: LK }
{ countryCode: LR }
{ countryCode: LS }
{ countryCode: LT }
{ countryCode: LU }
{ countryCode: LV }
{ countryCode: LY }
{ countryCode: MA }
{ countryCode: MC }
{ countryCode: MD }
{ countryCode: ME }
{ countryCode: MF }
{ countryCode: MG }
{ countryCode: MK }
{ countryCode: ML }
{ countryCode: MM }
{ countryCode: MN }
{ countryCode: MO }
{ countryCode: MQ }
{ countryCode: MR }
{ countryCode: MS }
{ countryCode: MT }
{ countryCode: MU }
{ countryCode: MV }
{ countryCode: MW }
{ countryCode: MX }
{ countryCode: MY }
{ countryCode: MZ }
{ countryCode: NA }
{ countryCode: NC }
{ countryCode: NE }
{ countryCode: NF }
{ countryCode: NG }
{ countryCode: NI }
{ countryCode: NL }
{ countryCode: NO }
{ countryCode: NP }
{ countryCode: NR }
{ countryCode: NU }
{ countryCode: NZ }
{ countryCode: OM }
{ countryCode: PA }
{ countryCode: PE }
{ countryCode: PF }
{ countryCode: PG }
{ countryCode: PH }
{ countryCode: PK }
{ countryCode: PL }
{ countryCode: PM }
{ countryCode: PN }
{ countryCode: PS }
{ countryCode: PT }
{ countryCode: PY }
{ countryCode: QA }
{ countryCode: RE }
{ countryCode: RO }
{ countryCode: RS }
{ countryCode: RU }
{ countryCode: RW }
{ countryCode: SA }
{ countryCode: SB }
{ countryCode: SC }
{ countryCode: SD }
{ countryCode: SE }
{ countryCode: SG }
{ countryCode: SH }
{ countryCode: SI }
{ countryCode: SJ }
{ countryCode: SK }
{ countryCode: SL }
{ countryCode: SM }
{ countryCode: SN }
{ countryCode: SO }
{ countryCode: SR }
{ countryCode: SS }
{ countryCode: ST }
{ countryCode: SV }
{ countryCode: SX }
{ countryCode: SZ }
{ countryCode: TC }
{ countryCode: TD }
{ countryCode: TF }
{ countryCode: TG }
{ countryCode: TH }
{ countryCode: TJ }
{ countryCode: TK }
{ countryCode: TL }
{ countryCode: TM }
{ countryCode: TN }
{ countryCode: TO }
{ countryCode: TR }
{ countryCode: TT }
{ countryCode: TV }
{ countryCode: TW }
{ countryCode: TZ }
{ countryCode: UA }
{ countryCode: UG }
{ countryCode: UY }
{ countryCode: UZ }
{ countryCode: VA }
{ countryCode: VC }
{ countryCode: VE }
{ countryCode: VG }
{ countryCode: VN }
{ countryCode: VU }
{ countryCode: WF }
{ countryCode: WS }
{ countryCode: XK }
{ countryCode: YE }
{ countryCode: YT }
{ countryCode: ZA }
{ countryCode: ZM }
{ countryCode: ZW }


    `;

    // -----------------------------------
    // CREATE INTERNATIONAL MARKET
    // -----------------------------------

    console.log("\nCREATING INTERNATIONAL MARKET\n");

    const createMutation = `
      mutation {

        marketCreate(

          input: {

            name: "International"

            status: ACTIVE

            conditions: {

              regionsCondition: {

                regions: [

                  ${regionsString}

                ]
              }
            }
          }

        ) {

          market {

            id
            name
            status
          }

          userErrors {
            field
            message
          }
        }
      }
    `;

    const createResponse = await shopifyApi.post("/graphql.json", {
      query: createMutation,
    });

    console.log(JSON.stringify(createResponse.data, null, 2));

    // -----------------------------------
    // FINAL VERIFY
    // -----------------------------------

    const finalQuery = `
      query {

        markets(first: 50) {

          edges {

            node {

              id
              name
              status

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
        }
      }
    `;

    const finalResponse = await shopifyApi.post("/graphql.json", {
      query: finalQuery,
    });

    console.log("\nFINAL MARKETS:\n");

    // console.log(JSON.stringify(finalResponse.data, null, 2));

    console.log("\n=================================");
    console.log("MARKETS RESET COMPLETE");
    console.log("=================================\n");

    return {
      success: true,
    };
  } catch (error) {
    console.error("\nMARKETS SETUP FAILED:\n");

    console.error(
      JSON.stringify(error.response?.data || error.message, null, 2),
    );

    throw error;
  }
}

import { chromium } from "playwright";
import fs from "fs";
import dotenv from "dotenv";

import { importProductsFromCSV } from "../../services/shopify/importCsvService.js";

dotenv.config();

export async function createStoreAutomation(storeData) {
  let storeName = "";
  let shpat = "";

  const sessionFile = "auth-partner.json";

  const context = await chromium.launchPersistentContext(
    "./playwright-user-data",
    {
      headless: false,

      viewport: {
        width: 1440,
        height: 900,
      },

      args: ["--disable-blink-features=AutomationControlled"],
    },
  );

  const page = await context.newPage();

  // -----------------------------------
  // Restore session if exists
  // -----------------------------------

  if (fs.existsSync(sessionFile)) {
    const storage = JSON.parse(fs.readFileSync(sessionFile, "utf-8"));

    await context.addCookies(storage.cookies);

    console.log("✅ Existing session loaded");
  }

  // -----------------------------------
  // Open Shopify Partner
  // -----------------------------------

  await page.goto("https://dev.shopify.com/dashboard/129786666/stores", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // -----------------------------------
  // Check login screen
  // -----------------------------------

  const emailInput = page.locator("#account_email");

  const emailVisible = await emailInput.isVisible().catch(() => false);

  if (emailVisible) {
    console.log("🔐 Logging in...");

    // -----------------------------------
    // Email
    // -----------------------------------

    await emailInput.fill(process.env.USER_EMAIL);

    await page.locator('button:has-text("Continue with email")').click();

    await page
      .waitForLoadState("networkidle", {
        timeout: 15000,
      })
      .catch(() => {});

    // -----------------------------------
    // Password
    // -----------------------------------

    const passwordInput = page.locator("#account_password");

    await passwordInput.waitFor({
      state: "attached",
      timeout: 15000,
    });

    const filled = await page.evaluate((pwd) => {
      const input = document.querySelector("#account_password");

      if (!input) return false;

      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;

      nativeSetter.call(input, pwd);

      input.dispatchEvent(new Event("input", { bubbles: true }));

      input.dispatchEvent(new Event("change", { bubbles: true }));

      return true;
    }, process.env.USER_PASSWORD);

    if (!filled) {
      throw new Error("Could not fill password field");
    }

    // -----------------------------------
    // Submit Login
    // -----------------------------------

    await page.evaluate(() => {
      const btn =
        document.querySelector('button[type="submit"]') ||
        document.querySelector("div.footer-form-submit");

      btn?.click();
    });

    await page.waitForTimeout(5000);

    // -----------------------------------
    // Save Session
    // -----------------------------------

    await context.storageState({
      path: sessionFile,
    });

    console.log("✅ Session saved");
  }

  await page.waitForTimeout(3000);

  // -----------------------------------
  // Create Store
  // -----------------------------------

  const page1Promise = page.waitForEvent("popup");

  await page
    .getByRole("link", {
      name: "Add dev store",
    })
    .click({
      delay: 120,
    });

  const page1 = await page1Promise;

  await page1.waitForLoadState("domcontentloaded");

  await page1.waitForTimeout(3000);

  // -----------------------------------
  // Store Name
  // -----------------------------------

  storeName = `teststore${Date.now()}`;

  const nameField = page1.locator('input[name="storeName"]');

  await nameField.waitFor({
    state: "visible",
    timeout: 15000,
  });

  for (const char of storeName) {
    await nameField.type(char, {
      delay: 80 + Math.random() * 80,
    });
  }

  await page1.waitForTimeout(1500);

  // -----------------------------------
  // Shopify Plan
  // -----------------------------------

  await page1.locator('select[name="Shopify plan"]').selectOption("Advanced");

  // -----------------------------------
  // Create Store
  // -----------------------------------

  await page1.getByText("Create store").click({
    delay: 100,
  });

  await page1.waitForLoadState("domcontentloaded");

  await page1.waitForTimeout(5000);

  // -----------------------------------
  // Account Card
  // -----------------------------------

  const accountCard = page1.getByRole("link", {
    name: new RegExp(process.env.USER_EMAIL, "i"),
  });

  if ((await accountCard.count()) > 0) {
    await accountCard.click();
  }

  // -----------------------------------
  // Wait Store Creation
  // -----------------------------------

  await page1.waitForTimeout(20000);

  const storeNameLocator = page1.locator("div.Polaris-Box > div > span > p");

  await storeNameLocator.waitFor({
    state: "visible",
    timeout: 30000,
  });

  console.log("✅ Store Created");

  console.log("Store:", await storeNameLocator.innerText());

  console.log(page1.url());

  // -----------------------------------
  // ENABLE CUSTOM APP DEVELOPMENT
  // -----------------------------------

  await page1.goto(`${page1.url()}/settings/apps/development/enable`, {
    waitUntil: "domcontentloaded",
  });

  await page1.waitForTimeout(5000);

  const allowCustomAppsBtn = page1.getByRole("button", {
    name: /allow custom app development/i,
  });

  if (await allowCustomAppsBtn.isVisible().catch(() => false)) {
    await allowCustomAppsBtn.click({
      delay: 120,
    });

    await page1.waitForLoadState("networkidle");

    await page1.waitForTimeout(5000);
  }

  // -----------------------------------
  // CREATE LEGACY CUSTOM APP
  // -----------------------------------

  await page1
    .getByRole("button", {
      name: "Create a legacy custom app",
    })
    .click({
      delay: 120,
    });

  await page1.waitForTimeout(4000);

  // -----------------------------------
  // APP NAME
  // -----------------------------------

  const appName = `AutomationApp${Date.now()}`;

  await page1.locator('input[name="appName"]').fill(appName);

  await page1.waitForTimeout(1500);

  // -----------------------------------
  // CREATE APP
  // -----------------------------------

  await page1
    .getByRole("button", {
      name: /^create app$/i,
    })
    .click({
      delay: 120,
    });

  await page1.waitForLoadState("networkidle");

  await page1.waitForTimeout(5000);

  // -----------------------------------
  // CONFIGURE ADMIN API SCOPES
  // -----------------------------------

  await page1.getByText("Configure Admin API scopes").click({
    delay: 120,
  });

  await page1.waitForLoadState("domcontentloaded");

  await page1.waitForTimeout(5000);

  // -----------------------------------
  // ENABLE ALL CHECKBOXES
  // -----------------------------------

  const allCheckboxes = page1.locator('input[type="checkbox"]');

  const checkboxCount = await allCheckboxes.count();

  console.log(`Checked ${checkboxCount} checkboxes`);

  for (let i = 0; i < checkboxCount; i++) {
    const checkbox = allCheckboxes.nth(i);

    try {
      const checked = await checkbox.isChecked();

      if (!checked) {
        await checkbox.check({
          force: true,
        });

        await page1.waitForTimeout(50);
      }
    } catch (err) {
      console.log(`Skipping checkbox ${i}`);
    }
  }

  // -----------------------------------
  // SAVE
  // -----------------------------------

  await page1.waitForTimeout(2000);

  await page1
    .getByRole("button", {
      name: /^save$/i,
    })
    .first()
    .click({
      delay: 120,
    });

  await page1.waitForLoadState("networkidle");

  await page1.waitForTimeout(5000);

  // -----------------------------------
  // GO TO OVERVIEW
  // -----------------------------------

  await page1.locator('button[role="tab"]#overview').click({
    delay: 120,
  });

  await page1.waitForTimeout(5000);

  // -----------------------------------
  // INSTALL APP
  // -----------------------------------

  const installAppBtn = page1.locator('button:has-text("Install app")').first();

  await installAppBtn.waitFor({
    state: "visible",
    timeout: 30000,
  });

  await installAppBtn.click({
    delay: 120,
  });

  await page1.waitForTimeout(3000);

  // -----------------------------------
  // CONFIRM INSTALL
  // -----------------------------------

  await page1
    .getByRole("button", {
      name: /^Install$/,
    })
    .last()
    .click({
      delay: 120,
    });

  await page1.waitForLoadState("networkidle");

  await page1.waitForTimeout(5000);

  // -----------------------------------
  // REVEAL TOKEN
  // -----------------------------------

  for (let attempt = 1; attempt <= 5; attempt++) {
    console.log(`Trying to reveal token - Attempt ${attempt}`);

    await page1.evaluate(() => {
      const internalButtons = document.querySelectorAll("s-internal-button");

      for (const btn of internalButtons) {
        if (btn.innerText.includes("Reveal token once")) {
          const shadow = btn.shadowRoot;

          const realButton = shadow?.querySelector("button");

          realButton?.click();

          break;
        }
      }
    });

    await page1.waitForTimeout(3000);

    const textInputs = page1.locator('input[type="text"]');

    const inputCount = await textInputs.count();

    for (let i = 0; i < inputCount; i++) {
      const value = await textInputs.nth(i).inputValue();

      console.log(`INPUT ${i}: ${value}`);

      if (value && value.startsWith("shpat_")) {
        shpat = value;
        break;
      }
    }

    if (shpat && shpat.startsWith("shpat_")) {
      console.log("✅ Token captured successfully");

      break;
    }

    console.log("❌ Token empty, retrying...");

    await page1.waitForTimeout(2000);
  }

  if (!shpat || !shpat.startsWith("shpat_")) {
    throw new Error("Failed to capture Shopify token after retries");
  }

  // -----------------------------------
  // URLS
  // -----------------------------------

  const partnerUrl = page.url();

  const storeUrl = `https://${storeName}.myshopify.com`;

  const appUrl = `https://admin.shopify.com/store/${storeName}/apps/mcsl-qa`;

  // -----------------------------------
  // TEMP ENV FILE
  // -----------------------------------

  const tempEnvPath = `./temp-store-env/${storeName}.env`;

  fs.writeFileSync(
    tempEnvPath,
    `
SHOPIFY_STORE=${storeName}.myshopify.com
SHOPIFY_ACCESS_TOKEN=${shpat}
SHOPIFY_API_VERSION=2023-01
`,
  );

  console.log(`✅ Temp env created: ${tempEnvPath}`);

  // -----------------------------------
  // IMPORT PRODUCTS
  // -----------------------------------

  await importProductsFromCSV(
    "./csv/products.csv",
    `${storeName}.myshopify.com`,
    shpat,
  );

  console.log("✅ PRODUCTS IMPORTED INTO NEW STORE");

  // -----------------------------------
  // DELETE TEMP ENV
  // -----------------------------------

  fs.unlinkSync(tempEnvPath);

  console.log("✅ Temp env deleted");

  await context.close();

  return {
    success: true,
    storeName,
    storeUrl,
    partnerUrl,
    appUrl,
    token: shpat,
  };
}

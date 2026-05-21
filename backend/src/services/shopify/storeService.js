import { chromium } from "playwright";
import fs from "fs";
import dotenv from "dotenv";

import { importProductsFromCSV } from "../../services/shopify/importCsvService.js";
import { setupMarkets } from "./setupMarkets.js";

dotenv.config();

const BROWSER_DATA_DIR = "./playwright-user-data";
const SESSION_FILE = "auth-partner.json";
const PARTNER_STORES_URL = "https://dev.shopify.com/dashboard/129786666/stores";

// ─── Browser ────────────────────────────────────────────────────────────────

async function launchBrowser() {
  return chromium.launchPersistentContext(BROWSER_DATA_DIR, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });
}

// ─── Session ─────────────────────────────────────────────────────────────────

async function restoreSession(context) {
  if (!fs.existsSync(SESSION_FILE)) return;
  const storage = JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
  await context.addCookies(storage.cookies);
  console.log("✅ Session restored");
}

async function saveSession(context) {
  await context.storageState({ path: SESSION_FILE });
  console.log("✅ Session saved");
}

// ─── Login ───────────────────────────────────────────────────────────────────

async function ensureLoggedIn(page, context) {
  await page.goto(PARTNER_STORES_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  const emailInput = page.locator("#account_email");
  const emailVisible = await emailInput.isVisible().catch(() => false);
  if (!emailVisible) return;

  console.log("🔐 Logging in...");

  await emailInput.fill(process.env.USER_EMAIL);
  await page.locator('button:has-text("Continue with email")').click();
  await page
    .waitForLoadState("networkidle", { timeout: 15000 })
    .catch(() => {});

  const passwordInput = page.locator("#account_password");
  await passwordInput.waitFor({ state: "attached", timeout: 15000 });

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

  if (!filled) throw new Error("Could not fill password field");

  await page.evaluate(() => {
    const btn =
      document.querySelector('button[type="submit"]') ||
      document.querySelector("div.footer-form-submit");
    btn?.click();
  });

  await page.waitForTimeout(5000);
  await saveSession(context);
}

// ─── Store Creation ───────────────────────────────────────────────────────────

async function createDevStore(page, storeName) {
  await page.waitForTimeout(3000);

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Add dev store" }).click({ delay: 120 });
  const storePage = await popupPromise;

  await storePage.waitForLoadState("domcontentloaded");
  await storePage.waitForTimeout(3000);

  const nameField = storePage.locator('input[name="storeName"]');
  await nameField.waitFor({ state: "visible", timeout: 15000 });

  for (const char of storeName) {
    await nameField.type(char, { delay: 80 + Math.random() * 80 });
  }

  await storePage.waitForTimeout(1500);
  await storePage
    .locator('select[name="Shopify plan"]')
    .selectOption("Advanced");
  await storePage.getByText("Create store").click({ delay: 100 });
  await storePage.waitForLoadState("domcontentloaded");
  await storePage.waitForTimeout(5000);

  const accountCard = storePage.getByRole("link", {
    name: new RegExp(process.env.USER_EMAIL, "i"),
  });
  if ((await accountCard.count()) > 0) await accountCard.click();

  await storePage.waitForTimeout(20000);

  const storeNameLocator = storePage.locator(
    "div.Polaris-Box > div > span > p",
  );
  await storeNameLocator.waitFor({ state: "visible", timeout: 30000 });

  console.log("✅ Store created:", await storeNameLocator.innerText());

  return storePage;
}

// ─── Custom App Setup ─────────────────────────────────────────────────────────

async function enableCustomApps(storePage) {
  await storePage.goto(`${storePage.url()}/settings/apps/development/enable`, {
    waitUntil: "domcontentloaded",
  });
  await storePage.waitForTimeout(5000);

  const allowBtn = storePage.getByRole("button", {
    name: /allow custom app development/i,
  });
  if (await allowBtn.isVisible().catch(() => false)) {
    await allowBtn.click({ delay: 120 });
    await storePage.waitForLoadState("networkidle");
    await storePage.waitForTimeout(5000);
  }
}

async function createLegacyApp(storePage) {
  await storePage
    .getByRole("button", { name: "Create a legacy custom app" })
    .click({ delay: 120 });
  await storePage.waitForTimeout(4000);

  const appName = `AutomationApp${Date.now()}`;
  await storePage.locator('input[name="appName"]').fill(appName);
  await storePage.waitForTimeout(1500);

  await storePage
    .getByRole("button", { name: /^create app$/i })
    .click({ delay: 120 });
  await storePage.waitForLoadState("networkidle");
  await storePage.waitForTimeout(5000);
}

// ─── API Scopes ───────────────────────────────────────────────────────────────

async function configureApiScopes(storePage) {
  await storePage.getByText("Configure Admin API scopes").click({ delay: 120 });
  await storePage.waitForLoadState("domcontentloaded");
  await storePage.waitForTimeout(5000);

  const checkboxes = storePage.locator('input[type="checkbox"]');
  const count = await checkboxes.count();
  console.log(`Checking ${count} API scope checkboxes`);

  for (let i = 0; i < count; i++) {
    try {
      const checkbox = checkboxes.nth(i);
      if (!(await checkbox.isChecked())) {
        await checkbox.check({ force: true });
        await storePage.waitForTimeout(50);
      }
    } catch {
      console.log(`Skipping checkbox ${i}`);
    }
  }

  await storePage.waitForTimeout(2000);
  await storePage
    .getByRole("button", { name: /^save$/i })
    .first()
    .click({ delay: 120 });
  await storePage.waitForLoadState("networkidle");
  await storePage.waitForTimeout(5000);
}

// ─── App Install ──────────────────────────────────────────────────────────────

async function installApp(storePage) {
  await storePage.locator('button[role="tab"]#overview').click({ delay: 120 });
  await storePage.waitForTimeout(5000);

  const installBtn = storePage
    .locator('button:has-text("Install app")')
    .first();
  await installBtn.waitFor({ state: "visible", timeout: 30000 });
  await installBtn.click({ delay: 120 });
  await storePage.waitForTimeout(3000);

  const confirmInstallBtn = storePage
    .getByRole("button", { name: /^Install$/ })
    .last();

  const isDisabled = await confirmInstallBtn.isDisabled().catch(() => true);
  if (isDisabled) {
    await storePage
      .locator('button[role="tab"]#configuration')
      .click({ delay: 120 });
    await storePage.waitForTimeout(2000);
    await storePage
      .locator('button[role="tab"]#overview')
      .click({ delay: 120 });
    await storePage.waitForTimeout(2000);
  }

  await confirmInstallBtn.click({ delay: 120 });
  await storePage.waitForLoadState("networkidle");
  await storePage.waitForTimeout(5000);
}

// ─── Token Capture ────────────────────────────────────────────────────────────

async function captureToken(storePage) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    console.log(`Revealing token — attempt ${attempt}`);

    await storePage.evaluate(() => {
      const buttons = document.querySelectorAll("s-internal-button");
      for (const btn of buttons) {
        if (btn.innerText.includes("Reveal token once")) {
          btn.shadowRoot?.querySelector("button")?.click();
          break;
        }
      }
    });

    await storePage.waitForTimeout(3000);

    const inputs = storePage.locator('input[type="text"]');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const value = await inputs.nth(i).inputValue();
      if (value?.startsWith("shpat_")) {
        console.log("✅ Token captured");
        return value;
      }
    }

    console.log("❌ Token not found, retrying...");
    await storePage.waitForTimeout(2000);
  }

  throw new Error("Failed to capture Shopify token after 5 attempts");
}

// ─── API Version ─────────────────────────────────────────────────────────────

async function fetchApiVersion(storePage) {
  // -----------------------------------
  // OPEN CONFIGURATION TAB
  // -----------------------------------

  const configurationTab = storePage.locator("#app-configuration");

  await configurationTab.waitFor({
    state: "visible",
    timeout: 30000,
  });

  await configurationTab.click({
    delay: 120,
  });

  await storePage.waitForTimeout(4000);

  // -----------------------------------
  // GET WEBHOOK VERSION
  // -----------------------------------

  const webhookCode = storePage
    .locator("code")
    .filter({
      hasText: /^\d{4}-\d{2}$/,
    })
    .last();

  await webhookCode.waitFor({
    state: "visible",
    timeout: 15000,
  });

  const webhookVersion = await webhookCode.innerText();

  console.log(`✅ Webhook Version: ${webhookVersion}`);

  return webhookVersion;
}
// ─── Product Import ───────────────────────────────────────────────────────────

async function importProducts(storeName, storeUrl, token) {
  const tempEnvPath = `./temp-store-env/${storeName}.env`;

  fs.writeFileSync(
    tempEnvPath,
    `SHOPIFY_STORE=${storeUrl}\nSHOPIFY_ACCESS_TOKEN=${token}\nSHOPIFY_API_VERSION=${process.env.SHOPIFY_API_VERSION}\n`,
  );

  const products = await importProductsFromCSV(
    "./csv/products.csv",
    storeUrl,
    token,
  );
  console.log("✅ Products imported");

  fs.unlinkSync(tempEnvPath);
  return products;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractStoreUrl(adminUrl) {
  const handle = adminUrl.split("/store/")[1]?.split("/")[0];
  return `${handle}.myshopify.com`;
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function createStoreAutomation(storeData) {
  const context = await launchBrowser();
  const page = await context.newPage();

  try {
    await restoreSession(context);
    await ensureLoggedIn(page, context);

    const storePage = await createDevStore(page, storeData.storeName);

    await enableCustomApps(storePage);
    await createLegacyApp(storePage);
    await configureApiScopes(storePage);
    await installApp(storePage);

    const token = await captureToken(storePage);
    const apiVersion = await fetchApiVersion(storePage);
    const storeUrl = extractStoreUrl(storePage.url());
    const partnerUrl = page.url();
    const appUrl = `https://admin.shopify.com/store/${storeData.storeName}/apps/mcsl-qa`;

    const { simpleProducts, variableProducts, digitalProducts } =
      await importProducts(storeData.storeName, storeUrl, token);

    await setupMarkets(storeUrl, token);
    console.log("✅ Markets configured");
    const result = {
      success: true,
      storeName: storeData.storeName,
      storeUrl,
      partnerUrl,
      appUrl,
      token,
      apiVersion,
      simpleProducts,
      variableProducts,
      digitalProducts,
    };
    console.log("/n/n✅ Final result:", JSON.stringify(result, null, 2));
    return result;
  } finally {
    await context.close();
  }
}

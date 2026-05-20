import { test, chromium } from "@playwright/test";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
test.describe("Shopify Partner Store Creation", () => {
  test.setTimeout(300000);

  test("Create Store", async () => {
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

      // VERY IMPORTANT
      // Shopify renders password after async API call
      // -----------------------------------

      await page
        .waitForLoadState("networkidle", {
          timeout: 15000,
        })
        .catch(() => {});

      // -----------------------------------
      // Wait password field
      // -----------------------------------

      const passwordInput = page.locator("#account_password");

      await passwordInput.waitFor({
        state: "attached",
        timeout: 15000,
      });

      // -----------------------------------
      // Fill password using evaluate
      // avoids Shopify weird rerenders
      // -----------------------------------

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
      // Submit login
      // -----------------------------------

      await page.evaluate(() => {
        const btn =
          document.querySelector('button[type="submit"]') ||
          document.querySelector("div.footer-form-submit");

        btn?.click();
      });

      // -----------------------------------
      // Wait successful login
      // -----------------------------------

      await page.waitForTimeout(5000);

      // -----------------------------------
      // Save session
      // -----------------------------------

      await context.storageState({
        path: sessionFile,
      });

      console.log("✅ Session saved");
    }

    // -----------------------------------
    // Human-like waits
    // -----------------------------------

    await page.waitForTimeout(3000);

    // -----------------------------------
    // Create Store
    // -----------------------------------

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

    // popup page
    const page1 = await page1Promise;

    await page1.waitForLoadState("domcontentloaded");

    await page1.waitForTimeout(3000);

    // -----------------------------------
    // Store Name
    // -----------------------------------

    const storeName = `teststore${Date.now()}`;
    // const storeName = `rest-apc-logistics-mcsl-automation`;

    const nameField = page1.locator('input[name="storeName"]');

    await nameField.waitFor({
      state: "visible",
      timeout: 15000,
    });

    // Human typing
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

    // -----------------------------------
    // Account Card
    // -----------------------------------

    await page1.waitForLoadState("domcontentloaded");

    await page1.waitForTimeout(5000);

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
    // Wait store creation
    // -----------------------------------

    await page.waitForLoadState("networkidle");

    console.log("✅ Store Created");

    console.log(page.url());
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

    // Your uploaded html confirms all
    // checkboxes use:
    // input[type="checkbox"]
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

    const installAppBtn = page1
      .locator('button:has-text("Install app")')
      .first();

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

    // -----------------------------------
    // GET ADMIN API TOKEN
    // -----------------------------------

    await page1.waitForTimeout(3000);

    const textInputs = page1.locator('input[type="text"]');

    const inputCount = await textInputs.count();

    let shpat = "";

    for (let i = 0; i < inputCount; i++) {
      const value = await textInputs.nth(i).inputValue();
      if (value && value.startsWith("shpat_")) {
        shpat = value;
        break;
      }
    }

    console.log("=================================");

    console.log("SHOPIFY TOKEN:");
    console.log(shpat);

    console.log("=================================");

    // -----------------------------------
    // FINAL OUTPUT
    // -----------------------------------

    const partnerUrl = page.url();

    const shopifyUrl = `https://admin.shopify.com/store/${storeName}`;

    const appUrl = `https://admin.shopify.com/store/${storeName}/apps/mcsl-qa`;

    console.log("\n=================================");

    console.log(`PARTNER_URL = ${partnerUrl}`);

    console.log(`SHOPIFYURL = ${shopifyUrl}`);

    console.log(`APPURL = ${appUrl}`);

    console.log(`USER_EMAIL = ${process.env.USER_EMAIL}`);

    console.log(`USER_PASSWORD = ${process.env.USER_PASSWORD || ""}`);

    console.log(`SHOPIFY_API_VERSION = 2026-04`);

    console.log(`SHOPIFY_STORE_NAME = ${storeName}`);

    console.log(`SHOPIFY_ACCESS_TOKEN = ${shpat}`);

    console.log("=================================\n");
  });
});

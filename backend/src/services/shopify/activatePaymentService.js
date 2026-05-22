import { chromium } from "playwright";

const BROWSER_DATA_DIR = "./playwright-user-data";

export async function activatePayment(storeName) {
  const url = `https://admin.shopify.com/store/${storeName}/settings/payments/third-party-providers/24`;

  console.log("🌐 Launching browser for payment activation...");
  const context = await chromium.launchPersistentContext(BROWSER_DATA_DIR, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });

  try {
    const page = await context.newPage();
    console.log(`💳 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);
    console.log("   Clicking Activate button...");
    await page.getByRole("button", { name: "Activate" }).last().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    console.log("✅ Payment provider activated");
    return { success: true };
  } finally {
    await context.close();
  }
}

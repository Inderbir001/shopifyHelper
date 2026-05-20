import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/playwright/tests",

  use: {
    headless: false,

    // Disable test artifacts
    screenshot: "off",
    video: "off",
    trace: "off",
  },
});

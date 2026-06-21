import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  timeout: 120000,
  retries: 0,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    browserName: "firefox",
    viewport: { width: 1280, height: 720 },
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 30000,
  },
});

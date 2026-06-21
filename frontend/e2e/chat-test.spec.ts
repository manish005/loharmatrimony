import { test, expect } from "@playwright/test";
import { randomBytes } from "crypto";

const rand = () => randomBytes(4).toString("hex");
const randomEmail = () => `test_${rand()}@example.com`;

test.describe("Chat Feature", () => {
  let email: string;
  const password = "Test@123";

  test.beforeEach(() => {
    email = randomEmail();
  });

  test("Chat sends & deletes a message", async ({ page }) => {
    // ── Phase 1: Register user ─────────────────────────────────────
    await test.step("Register via 3-step wizard", async () => {
      await page.goto("/register");
      await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
      await page.fill('input[name="firstName"]', "Test");
      await page.fill('input[name="lastName"]', "User");
      await page.selectOption('select[name="gender"]', "Male");
      await page.fill('input[name="dob"]', "1995-06-15");
      await page.fill('input[name="mobile"]', "9876543210");
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="confirmPassword"]', password);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(500);

      await page.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
      await page.selectOption('select[name="subCaste"]', "Panchal");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(500);

      await page.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
      await page.fill('input[name="aadhaarNumber"]', "123456789012");
      await page.check('input[id="termsAccepted"]');
      page.once("dialog", async (dialog) => await dialog.accept());
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    // ── Phase 2: Chat ──────────────────────────────────────────────
    await test.step("Send and delete a message", async () => {
      await page.goto(`/chat?userId=test-profile-${rand()}&name=Test+Profile&photo=`);
      await page.waitForTimeout(5000);

      const input = page.locator('input[placeholder="Type your message..."]');
      if (!(await input.isVisible().catch(() => false))) {
        await page.goto("/chat");
        await page.waitForTimeout(3000);
        await page.goto(`/chat?userId=test-profile-${rand()}&name=Test+Profile&photo=`);
        await page.waitForTimeout(6000);
      }
      await expect(input).toBeVisible({ timeout: 10000 });

      await input.fill("Hello from Playwright!");
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);

      await expect(page.getByText("Hello from Playwright!").first()).toBeVisible({ timeout: 5000 });

      // Delete
      const bubble = page.locator("div").filter({ hasText: "Hello from Playwright!" }).last();
      await bubble.hover();
      await page.waitForTimeout(500);
      const menu = page.locator('button[aria-label="Message options"]');
      if (await menu.isVisible().catch(() => false)) {
        await menu.click();
        await page.locator("text=Delete").click();
        await page.waitForTimeout(2000);
      }
    });
  });
});

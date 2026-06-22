import { test, expect } from "@playwright/test";
import { resetDatabaseAndSeed } from "./helpers/db-reset";

async function loginUser(page: any, email: string) {
  page.on("console", (msg: any) => console.log(`[Browser - ${email}]:`, msg.text()));
  page.on("pageerror", (err: any) => console.error(`[Browser Error - ${email}]:`, err.message));

  await page.goto("/login");
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', "Test@123!!");
  
  try {
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
  } catch (err) {
    const errorDiv = page.locator('div.bg-red-50, div.text-red-650');
    if (await errorDiv.first().isVisible()) {
      const errorText = await errorDiv.first().innerText();
      throw new Error(`Login failed for ${email} with error: ${errorText}`);
    }
    throw err;
  }
  await page.waitForTimeout(1000);
}

test.describe("Marriage Proposal E2E Flow", () => {
  const maleEmail = "manishgadekar1111@gmail.com";
  const femaleEmail = "gadekarmanish62@gmail.com";
  const femaleEmail2 = "msgadekar284@gmail.com";

  const maleName = "Manish Gadekar";
  const femaleName = "Manisha Gadekar";
  const femaleName2 = "Priya Gadekar";

  // Clean the database and Cloudinary and seed the three users before each test runs
  test.beforeEach(async () => {
    console.log("Cleaning and seeding database before test...");
    await resetDatabaseAndSeed();
  });

  test("Mutual Interest, and Send & Accept Marriage Proposal", async ({ browser }) => {
    // Open separate browser contexts for Manish and Manisha
    const contextManish = await browser.newContext();
    const pageManish = await contextManish.newPage();

    const contextManisha = await browser.newContext();
    const pageManisha = await contextManisha.newPage();

    // ── STEP 1: Log in both users ─────────────────────────────────────
    await test.step("Log in Manish (Male) and Manisha (Female)", async () => {
      await loginUser(pageManish, maleEmail);
      await loginUser(pageManisha, femaleEmail);
    });

    // ── STEP 2: Send Interest from Manisha (Female) to Manish (Male) ───
    await test.step("Send Interest to Manish Gadekar", async () => {
      // Go to Advanced Search Tab
      await pageManisha.goto("/dashboard?tab=search");
      await pageManisha.waitForTimeout(2050);

      // Search specifically for the male name
      const searchInput = pageManisha.locator('input[type="text"]');
      await searchInput.fill(maleName);
      await pageManisha.waitForTimeout(2050);

      // Click "Interest" on Manish's card
      const sendInterestBtn = pageManisha.locator('button').filter({ hasText: /^Interest$/ }).first();
      await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
      await sendInterestBtn.click();
      
      // Wait for button state to update to "Sent"
      await expect(pageManisha.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
      await pageManisha.waitForTimeout(1000);
    });

    // ── STEP 3: Approve Interest as Manish ──────────────────────────────
    await test.step("Approve Manisha's Interest as Manish", async () => {
      // Go to Manish's Interests tab directly to fetch newly registered Manisha's profile
      await pageManish.goto("/dashboard?tab=interests");
      await pageManish.waitForTimeout(2000);

      // Assert: Marriage Requests sub-tab should not be visible before interest is approved
      await expect(pageManish.locator('button:has-text("Marriage Requests")')).not.toBeVisible();

      // Accept Manisha Gadekar's interest request
      const approveBtn = pageManish.locator('button:has-text("Approve")').first();
      await expect(approveBtn).toBeVisible({ timeout: 10000 });
      await approveBtn.click();

      // Wait for the Approve button to disappear, meaning it was processed
      await expect(approveBtn).not.toBeVisible({ timeout: 10000 });
      await pageManish.waitForTimeout(1000);

      // Assert: Marriage Requests tab is now visible after interest acceptance
      await expect(pageManish.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });
    });

    // ── STEP 4: Send Marriage Proposal from Manisha to Manish ───────────
    await test.step("Manisha Sends Marriage Proposal to Manish", async () => {
      // Go to Manisha's Interests tab directly to fetch accepted connection state
      await pageManisha.goto("/dashboard?tab=interests");
      await pageManisha.waitForTimeout(2000);

      // Click on "Sent Requests" sub-tab
      const sentRequestsTabBtn = pageManisha.locator('button:has-text("Sent Requests")');
      await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
      await sentRequestsTabBtn.click();
      await pageManisha.waitForTimeout(1000);

      // Assert: Marriage Requests tab is visible to Manisha
      await expect(pageManisha.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });

      // Click on Manish's card image to redirect to his profile view
      const manishCardImage = pageManisha.locator(`img[alt="${maleName}"]`);
      await expect(manishCardImage).toBeVisible({ timeout: 5000 });
      await manishCardImage.click({ force: true });
      await pageManisha.waitForTimeout(2000);

      // Verify URL redirect to view-profile tab
      await expect(pageManisha.url()).toContain("tab=view-profile");

      // Verify the "Let's Get Married!" button is visible and click it
      const letsGetMarriedBtn = pageManisha.locator('button:has-text("Let\'s Get Married!")');
      await expect(letsGetMarriedBtn).toBeVisible({ timeout: 10000 });
      await letsGetMarriedBtn.click();

      // In Marriage Proposal Modal, fill out details:
      await pageManisha.fill('input[type="date"]', "2027-12-25");
      await pageManisha.fill('input[type="time"]', "18:00");
      await pageManisha.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");

      // Click "Send Marriage Request"
      await pageManisha.click('button:has-text("Send Marriage Request")');
      await pageManisha.waitForTimeout(2500);
    });

    // ── STEP 5: Accept Proposal as Manish ───────────────────────────────
    await test.step("Accept Proposal as Manish", async () => {
      // Go to Manish's dashboard to fetch newly created marriage request
      await pageManish.goto("/dashboard");

      // Open Notification dropdown and click on the proposal notification
      const notificationBell = pageManish.locator('button[aria-label="Notifications"]');
      await expect(notificationBell).toBeVisible({ timeout: 5000 });
      await notificationBell.click();
      await pageManish.waitForTimeout(1000);

      const proposalNotification = pageManish.locator(`text=${femaleName} proposed a marriage setup!`);
      await expect(proposalNotification).toBeVisible({ timeout: 5000 });
      await proposalNotification.click();
      await pageManish.waitForTimeout(2000);

      // Verify we are on Interests tab -> Marriage Requests sub-tab
      const marriageReqTabBtn = pageManish.locator('button:has-text("Marriage Requests")');
      await expect(marriageReqTabBtn).toBeVisible({ timeout: 5000 });
      await marriageReqTabBtn.click();
      await pageManish.waitForTimeout(1000);

      // Find the pending proposal Accept button and click it
      const acceptProposalBtn = pageManish.locator('button:has-text("Accept")').first();
      await expect(acceptProposalBtn).toBeVisible({ timeout: 5000 });
      await acceptProposalBtn.click();
      
      // Wait for updates & celebration animation
      await pageManish.waitForTimeout(3000);

      // We should be redirected to the "Success Stories" tab
      await expect(pageManish.url()).toContain("tab=stories");
    });

    // ── STEP 6: Verify UI Banners ───────────────────────────────────────
    await test.step("Verify Partner UI Banner displays Marriage Fixed & Verify notifications", async () => {
      // Navigate to My Profile tab to verify partner banner
      await pageManish.goto("/dashboard?tab=my-profile");
      await pageManish.waitForTimeout(2000);

      const partnerNameLabel = pageManish.locator(`text=${femaleName}`);
      await expect(partnerNameLabel).toBeVisible({ timeout: 5000 });

      const bannerStatus = pageManish.locator('button:has-text("Getting Married")');
      await expect(bannerStatus).toBeVisible({ timeout: 5000 });

      // Go to Manisha's dashboard to fetch updated profile state with banner
      await pageManisha.goto("/dashboard");

      // Open notifications dropdown on Manisha's page
      await pageManisha.locator('button[aria-label="Notifications"]').click();
      await pageManisha.waitForTimeout(1000);

      // Assert notification of acceptance in bell
      const acceptedNotification = pageManisha.locator(`text=${maleName} accepted your marriage proposal! Congratulations!`);
      await expect(acceptedNotification).toBeVisible({ timeout: 5000 });
    });

    await contextManish.close();
    await contextManisha.close();
  });

  test("Interest Rejection and Marriage Proposal Rejection Connection Reset Flow", async ({ browser }) => {
    // Open separate browser contexts for Manish and Priya
    const contextManish = await browser.newContext();
    const pageManish = await contextManish.newPage();

    const contextPriya = await browser.newContext();
    const pagePriya = await contextPriya.newPage();

    // ── STEP 1: Log in both users ─────────────────────────────────────
    await test.step("Log in Manish (Male) and Priya (Female)", async () => {
      await loginUser(pageManish, maleEmail);
      await loginUser(pagePriya, femaleEmail2);
    });

    // ── STEP 2: Send Interest from Manish (Male) to Priya (Female) ─────
    await test.step("Manish Sends Interest to Priya", async () => {
      // Search for Priya directly
      await pageManish.goto("/dashboard?tab=search");
      await pageManish.waitForTimeout(2050);
      const searchInput = pageManish.locator('input[type="text"]');
      await searchInput.fill(femaleName2);
      await pageManish.waitForTimeout(2050);

      // Click Interest
      const sendInterestBtn = pageManish.locator('button').filter({ hasText: /^Interest$/ }).first();
      await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
      await sendInterestBtn.click();
      await expect(pageManish.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
    });

    // ── STEP 3: Priya Declines Manish's Interest (Rejection Flow) ───────
    await test.step("Priya Declines Manish's Interest", async () => {
      // Go to Priya's Interests tab directly
      await pagePriya.goto("/dashboard?tab=interests");
      await pagePriya.waitForTimeout(2000);

      // Assert: Marriage Requests sub-tab should not be visible before interest is approved
      await expect(pagePriya.locator('button:has-text("Marriage Requests")')).not.toBeVisible();

      // Reject connection
      const rejectBtn = pagePriya.locator('button:has-text("Reject")').first();
      await expect(rejectBtn).toBeVisible({ timeout: 10000 });
      await rejectBtn.click();
      await expect(rejectBtn).not.toBeVisible({ timeout: 10000 });
    });

    // ── STEP 4: Manish Verifies Interest Rejection Reset ────────────────
    await test.step("Manish Verifies Interest Rejection Reset", async () => {
      // Go to Manish's dashboard directly
      await pageManish.goto("/dashboard");

      // Check notification bell for rejection
      await pageManish.locator('button[aria-label="Notifications"]').click();
      await pageManish.waitForTimeout(1000);
      const declineNoti = pageManish.locator(`text=${femaleName2} respectfully declined your interest.`);
      await expect(declineNoti).toBeVisible({ timeout: 5000 });
      await declineNoti.click();
      await pageManish.waitForTimeout(1000);

      // Verify Sent Requests tab is empty (Manish doesn't see Priya's card in Interests Sent anymore)
      const sentRequestsTabBtn = pageManish.locator('button:has-text("Sent Requests")');
      await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
      await sentRequestsTabBtn.click();
      await pageManish.waitForTimeout(1500);

      // Assert Priya Gadekar is not visible in Interests Sent
      await expect(pageManish.locator(`text=${femaleName2}`)).not.toBeVisible({ timeout: 2000 });
    });

    // ── STEP 5: Send Interest Again & Approve Interest ─────────────────
    await test.step("Manish Sends Interest Again & Priya Approves", async () => {
      // Go to Search, find Priya, and click Interest again
      await pageManish.goto("/dashboard?tab=search");
      await pageManish.waitForTimeout(2050);
      const searchInput = pageManish.locator('input[type="text"]');
      await searchInput.fill(femaleName2);
      await pageManish.waitForTimeout(2050);

      const sendInterestBtn = pageManish.locator('button').filter({ hasText: /^Interest$/ }).first();
      await expect(sendInterestBtn).toBeVisible({ timeout: 5000 });
      await sendInterestBtn.click();
      await expect(pageManish.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 5000 });

      // Go to Interests, approve Manish on Priya's page directly
      await pagePriya.goto("/dashboard?tab=interests");
      await pagePriya.waitForTimeout(2000);

      // Assert: Marriage Requests sub-tab should not be visible before interest is approved
      await expect(pagePriya.locator('button:has-text("Marriage Requests")')).not.toBeVisible();

      const approveBtn = pagePriya.locator('button:has-text("Approve")').first();
      await expect(approveBtn).toBeVisible({ timeout: 10000 });
      await approveBtn.click();
      await expect(approveBtn).not.toBeVisible({ timeout: 5000 });

      // Assert: Marriage Requests sub-tab is now visible after interest acceptance
      await expect(pagePriya.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });
    });

    // ── STEP 6: Manish Sends Marriage Proposal ─────────────────────────
    await test.step("Manish Sends Marriage Proposal to Priya", async () => {
      // Go to Manish's Interests tab directly
      await pageManish.goto("/dashboard?tab=interests");
      await pageManish.waitForTimeout(2000);
      const sentRequestsTabBtn = pageManish.locator('button:has-text("Sent Requests")');
      await sentRequestsTabBtn.click();
      await pageManish.waitForTimeout(1000);

      const priyaCardImage = pageManish.locator(`img[alt="${femaleName2}"]`);
      await expect(priyaCardImage).toBeVisible({ timeout: 5000 });
      await priyaCardImage.click({ force: true });
      await pageManish.waitForTimeout(2000);

      // Send Marriage Proposal
      const letsGetMarriedBtn = pageManish.locator('button:has-text("Let\'s Get Married!")');
      await expect(letsGetMarriedBtn).toBeVisible({ timeout: 5000 });
      await letsGetMarriedBtn.click();

      await pageManish.fill('input[type="date"]', "2027-12-25");
      await pageManish.fill('input[type="time"]', "18:00");
      await pageManish.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");
      await pageManish.click('button:has-text("Send Marriage Request")');
      await pageManish.waitForTimeout(2500);
    });

    // ── STEP 7: Priya Declines Marriage Proposal ───────────────────────
    await test.step("Priya Declines Marriage Proposal & Verifies Reset", async () => {
      // Go to Priya's dashboard directly
      await pagePriya.goto("/dashboard");

      // Open Notifications and click proposal notification
      await pagePriya.locator('button[aria-label="Notifications"]').click();
      await pagePriya.waitForTimeout(1000);
      const proposalNoti = pagePriya.locator(`text=${maleName} proposed a marriage setup!`);
      await expect(proposalNoti).toBeVisible({ timeout: 5000 });
      await proposalNoti.click();
      await pagePriya.waitForTimeout(2000);

      // Go to Interests -> Marriage Requests sub-tab
      const marriageReqTabBtn = pagePriya.locator('button:has-text("Marriage Requests")');
      await expect(marriageReqTabBtn).toBeVisible({ timeout: 5000 });
      await marriageReqTabBtn.click();
      await pagePriya.waitForTimeout(1000);

      // Decline proposal
      const declineProposalBtn = pagePriya.locator('button:has-text("Decline")').first();
      await expect(declineProposalBtn).toBeVisible({ timeout: 5000 });
      await declineProposalBtn.click();
      await expect(declineProposalBtn).not.toBeVisible({ timeout: 5000 });
      await pagePriya.waitForTimeout(1500);

      // Assert: Marriage Requests sub-tab is now hidden because interest was also deleted
      await expect(pagePriya.locator('button:has-text("Marriage Requests")')).not.toBeVisible({ timeout: 5000 });

      // Assert that Interests tab is empty and connection is cleared
      await pagePriya.goto("/dashboard?tab=interests");
      await pagePriya.waitForTimeout(1500);
      await expect(pagePriya.locator(`text=${maleName}`)).not.toBeVisible({ timeout: 2000 });
    });

    // ── STEP 8: Manish Verifies Rejection and Connection Reset ─────────
    await test.step("Manish Verifies Marriage Rejection Reset", async () => {
      // Go to Manish's dashboard directly
      await pageManish.goto("/dashboard");

      // Check notification bell for marriage rejection
      await pageManish.locator('button[aria-label="Notifications"]').click();
      await pageManish.waitForTimeout(1000);
      const declineMarriageNoti = pageManish.locator(`text=${femaleName2} declined your marriage proposal.`);
      await expect(declineMarriageNoti).toBeVisible({ timeout: 5000 });
      await declineMarriageNoti.click();
      await pageManish.waitForTimeout(1500);

      // Assert: Marriage Requests sub-tab should not be visible for Manish
      await expect(pageManish.locator('button:has-text("Marriage Requests")')).not.toBeVisible();

      // Assert Manish's Interests Sent page is empty for Priya
      await pageManish.goto("/dashboard?tab=interests");
      await pageManish.waitForTimeout(1000);
      const sentRequestsTabBtn = pageManish.locator('button:has-text("Sent Requests")');
      await sentRequestsTabBtn.click();
      await pageManish.waitForTimeout(1500);
      await expect(pageManish.locator(`text=${femaleName2}`)).not.toBeVisible({ timeout: 2000 });
    });

    await contextManish.close();
    await contextPriya.close();
  });
});

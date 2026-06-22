# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marriage-proposal.spec.ts >> Marriage Proposal E2E Flow >> Mutual Interest, and Send & Accept Marriage Proposal
- Location: e2e\marriage-proposal.spec.ts:32:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 35000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard" until "load"
============================================================
```

# Page snapshot

```yaml
- main [ref=e4]:
  - generic [ref=e5]:
    - button "Back to Home" [ref=e6] [cursor=pointer]:
      - img [ref=e7]
      - text: Back to Home
    - generic [ref=e10]:
      - generic [ref=e11]:
        - img [ref=e13]
        - heading "Welcome Back" [level=2] [ref=e15]
        - paragraph [ref=e16]: Connect to find your perfect partner in Lohar community
      - generic [ref=e17]:
        - img [ref=e18]
        - generic [ref=e22]: "Firebase: Error (auth/invalid-credential)."
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e25]: Email Address
          - generic [ref=e26]:
            - img [ref=e27]
            - textbox "example@mail.com" [ref=e30]: manishgadekar1111@gmail.com
        - generic [ref=e31]:
          - generic [ref=e32]: Password
          - generic [ref=e33]:
            - img [ref=e34]
            - textbox "••••••••" [ref=e37]: Test@123!!
            - button [ref=e38] [cursor=pointer]:
              - img [ref=e39]
        - link "Forgot password?" [ref=e43] [cursor=pointer]:
          - /url: /forgot-password
        - button "Sign In" [ref=e44] [cursor=pointer]
      - generic [ref=e47]: or continue with
      - generic [ref=e49]:
        - button "Google" [ref=e50] [cursor=pointer]:
          - img [ref=e51]
          - text: Google
        - button "Facebook" [ref=e53] [cursor=pointer]:
          - img [ref=e54]
          - text: Facebook
      - generic [ref=e56]:
        - text: New to the portal?
        - link "Register Free" [ref=e57] [cursor=pointer]:
          - /url: /register
          - text: Register Free
          - img [ref=e58]
      - generic [ref=e61]:
        - link "Privacy Policy" [ref=e62] [cursor=pointer]:
          - /url: /privacy
        - text: •
        - link "Terms & Conditions" [ref=e63] [cursor=pointer]:
          - /url: /terms
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { resetDatabaseAndSeed } from "./helpers/db-reset";
  3   | 
  4   | async function loginUser(page: any, email: string) {
  5   |   page.on("console", (msg: any) => console.log(`[Browser - ${email}]:`, msg.text()));
  6   |   page.on("pageerror", (err: any) => console.error(`[Browser Error - ${email}]:`, err.message));
  7   | 
  8   |   await page.goto("/login");
  9   |   await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  10  |   await page.fill('input[name="email"]', email);
  11  |   await page.fill('input[name="password"]', "Test@123!!");
  12  |   await page.click('button[type="submit"]');
> 13  |   await page.waitForURL("**/dashboard", { timeout: 35000 });
      |              ^ TimeoutError: page.waitForURL: Timeout 35000ms exceeded.
  14  |   await page.waitForTimeout(1000);
  15  | }
  16  | 
  17  | test.describe("Marriage Proposal E2E Flow", () => {
  18  |   const maleEmail = "manishgadekar1111@gmail.com";
  19  |   const femaleEmail = "gadekarmanish62@gmail.com";
  20  |   const femaleEmail2 = "msgadekar284@gmail.com";
  21  | 
  22  |   const maleName = "Manish Gadekar";
  23  |   const femaleName = "Manisha Gadekar";
  24  |   const femaleName2 = "Priya Gadekar";
  25  | 
  26  |   // Clean the database and Cloudinary and seed the three users before each test runs
  27  |   test.beforeEach(async () => {
  28  |     console.log("Cleaning and seeding database before test...");
  29  |     await resetDatabaseAndSeed();
  30  |   });
  31  | 
  32  |   test("Mutual Interest, and Send & Accept Marriage Proposal", async ({ browser }) => {
  33  |     // Open separate browser contexts for Manish and Manisha
  34  |     const contextManish = await browser.newContext();
  35  |     const pageManish = await contextManish.newPage();
  36  | 
  37  |     const contextManisha = await browser.newContext();
  38  |     const pageManisha = await contextManisha.newPage();
  39  | 
  40  |     // ── STEP 1: Log in both users ─────────────────────────────────────
  41  |     await test.step("Log in Manish (Male) and Manisha (Female)", async () => {
  42  |       await loginUser(pageManish, maleEmail);
  43  |       await loginUser(pageManisha, femaleEmail);
  44  |     });
  45  | 
  46  |     // ── STEP 2: Send Interest from Manisha (Female) to Manish (Male) ───
  47  |     await test.step("Send Interest to Manish Gadekar", async () => {
  48  |       // Go to Advanced Search Tab
  49  |       await pageManisha.goto("/dashboard?tab=search");
  50  |       await pageManisha.waitForTimeout(2050);
  51  | 
  52  |       // Search specifically for the male name
  53  |       const searchInput = pageManisha.locator('input[type="text"]');
  54  |       await searchInput.fill(maleName);
  55  |       await pageManisha.waitForTimeout(2050);
  56  | 
  57  |       // Click "Interest" on Manish's card
  58  |       const sendInterestBtn = pageManisha.locator('button').filter({ hasText: /^Interest$/ }).first();
  59  |       await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
  60  |       await sendInterestBtn.click();
  61  |       
  62  |       // Wait for button state to update to "Sent"
  63  |       await expect(pageManisha.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
  64  |       await pageManisha.waitForTimeout(1000);
  65  |     });
  66  | 
  67  |     // ── STEP 3: Approve Interest as Manish ──────────────────────────────
  68  |     await test.step("Approve Manisha's Interest as Manish", async () => {
  69  |       // Go to Manish's Interests tab directly to fetch newly registered Manisha's profile
  70  |       await pageManish.goto("/dashboard?tab=interests");
  71  |       await pageManish.waitForTimeout(2000);
  72  | 
  73  |       // Assert: Marriage Requests sub-tab should not be visible before interest is approved
  74  |       await expect(pageManish.locator('button:has-text("Marriage Requests")')).not.toBeVisible();
  75  | 
  76  |       // Accept Manisha Gadekar's interest request
  77  |       const approveBtn = pageManish.locator('button:has-text("Approve")').first();
  78  |       await expect(approveBtn).toBeVisible({ timeout: 10000 });
  79  |       await approveBtn.click();
  80  | 
  81  |       // Wait for the Approve button to disappear, meaning it was processed
  82  |       await expect(approveBtn).not.toBeVisible({ timeout: 10000 });
  83  |       await pageManish.waitForTimeout(1000);
  84  | 
  85  |       // Assert: Marriage Requests tab is now visible after interest acceptance
  86  |       await expect(pageManish.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });
  87  |     });
  88  | 
  89  |     // ── STEP 4: Send Marriage Proposal from Manisha to Manish ───────────
  90  |     await test.step("Manisha Sends Marriage Proposal to Manish", async () => {
  91  |       // Go to Manisha's Interests tab directly to fetch accepted connection state
  92  |       await pageManisha.goto("/dashboard?tab=interests");
  93  |       await pageManisha.waitForTimeout(2000);
  94  | 
  95  |       // Click on "Sent Requests" sub-tab
  96  |       const sentRequestsTabBtn = pageManisha.locator('button:has-text("Sent Requests")');
  97  |       await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
  98  |       await sentRequestsTabBtn.click();
  99  |       await pageManisha.waitForTimeout(1000);
  100 | 
  101 |       // Assert: Marriage Requests tab is visible to Manisha
  102 |       await expect(pageManisha.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });
  103 | 
  104 |       // Click on Manish's card image to redirect to his profile view
  105 |       const manishCardImage = pageManisha.locator(`img[alt="${maleName}"]`);
  106 |       await expect(manishCardImage).toBeVisible({ timeout: 5000 });
  107 |       await manishCardImage.click({ force: true });
  108 |       await pageManisha.waitForTimeout(2000);
  109 | 
  110 |       // Verify URL redirect to view-profile tab
  111 |       await expect(pageManisha.url()).toContain("tab=view-profile");
  112 | 
  113 |       // Verify the "Let's Get Married!" button is visible and click it
```
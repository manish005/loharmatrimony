# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marriage-proposal.spec.ts >> Marriage Proposal E2E Flow >> Interest Rejection and Marriage Proposal Rejection Connection Reset Flow
- Location: e2e\marriage-proposal.spec.ts:200:3

# Error details

```
Error: Login failed for manishgadekar1111@gmail.com with error: Firebase: Error (auth/invalid-credential).
```

# Page snapshot

```yaml
- main [ref=e4]:
  - generic [ref=e5]:
    - button "Back to Home" [ref=e6] [cursor=pointer]:
      - img [ref=e7]
      - text: Back to Home
    - generic [ref=e9]:
      - generic [ref=e10]:
        - img [ref=e12]
        - heading "Welcome Back" [level=2] [ref=e14]
        - paragraph [ref=e15]: Connect to find your perfect partner in Lohar community
      - generic [ref=e16]:
        - img [ref=e17]
        - generic [ref=e19]: "Firebase: Error (auth/invalid-credential)."
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: Email Address
          - generic [ref=e23]:
            - img [ref=e24]
            - textbox "example@mail.com" [ref=e27]: manishgadekar1111@gmail.com
        - generic [ref=e28]:
          - generic [ref=e29]: Password
          - generic [ref=e30]:
            - img [ref=e31]
            - textbox "••••••••" [ref=e34]: Test@123!!
            - button [ref=e35] [cursor=pointer]:
              - img [ref=e36]
        - link "Forgot password?" [ref=e40] [cursor=pointer]:
          - /url: /forgot-password
        - button "Sign In" [ref=e41] [cursor=pointer]
      - generic [ref=e44]: or continue with
      - generic [ref=e46]:
        - button "Google" [ref=e47] [cursor=pointer]:
          - img [ref=e48]
          - text: Google
        - button "Facebook" [ref=e50] [cursor=pointer]:
          - img [ref=e51]
          - text: Facebook
      - generic [ref=e53]:
        - text: New to the portal?
        - link "Register Free" [ref=e54] [cursor=pointer]:
          - /url: /register
          - text: Register Free
          - img [ref=e55]
      - generic [ref=e57]:
        - link "Privacy Policy" [ref=e58] [cursor=pointer]:
          - /url: /privacy
        - text: •
        - link "Terms & Conditions" [ref=e59] [cursor=pointer]:
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
  12  |   
  13  |   try {
  14  |     await page.click('button[type="submit"]');
  15  |     await page.waitForURL("**/dashboard", { timeout: 15000 });
  16  |   } catch (err) {
  17  |     const errorDiv = page.locator('div.bg-red-50, div.text-red-650');
  18  |     if (await errorDiv.first().isVisible()) {
  19  |       const errorText = await errorDiv.first().innerText();
> 20  |       throw new Error(`Login failed for ${email} with error: ${errorText}`);
      |             ^ Error: Login failed for manishgadekar1111@gmail.com with error: Firebase: Error (auth/invalid-credential).
  21  |     }
  22  |     throw err;
  23  |   }
  24  |   await page.waitForTimeout(1000);
  25  | }
  26  | 
  27  | test.describe("Marriage Proposal E2E Flow", () => {
  28  |   const maleEmail = "manishgadekar1111@gmail.com";
  29  |   const femaleEmail = "gadekarmanish62@gmail.com";
  30  |   const femaleEmail2 = "msgadekar284@gmail.com";
  31  | 
  32  |   const maleName = "Manish Gadekar";
  33  |   const femaleName = "Manisha Gadekar";
  34  |   const femaleName2 = "Priya Gadekar";
  35  | 
  36  |   // Clean the database and Cloudinary and seed the three users before each test runs
  37  |   test.beforeEach(async () => {
  38  |     console.log("Cleaning and seeding database before test...");
  39  |     await resetDatabaseAndSeed();
  40  |   });
  41  | 
  42  |   test("Mutual Interest, and Send & Accept Marriage Proposal", async ({ browser }) => {
  43  |     // Open separate browser contexts for Manish and Manisha
  44  |     const contextManish = await browser.newContext();
  45  |     const pageManish = await contextManish.newPage();
  46  | 
  47  |     const contextManisha = await browser.newContext();
  48  |     const pageManisha = await contextManisha.newPage();
  49  | 
  50  |     // ── STEP 1: Log in both users ─────────────────────────────────────
  51  |     await test.step("Log in Manish (Male) and Manisha (Female)", async () => {
  52  |       await loginUser(pageManish, maleEmail);
  53  |       await loginUser(pageManisha, femaleEmail);
  54  |     });
  55  | 
  56  |     // ── STEP 2: Send Interest from Manisha (Female) to Manish (Male) ───
  57  |     await test.step("Send Interest to Manish Gadekar", async () => {
  58  |       // Go to Advanced Search Tab
  59  |       await pageManisha.goto("/dashboard?tab=search");
  60  |       await pageManisha.waitForTimeout(2050);
  61  | 
  62  |       // Search specifically for the male name
  63  |       const searchInput = pageManisha.locator('input[type="text"]');
  64  |       await searchInput.fill(maleName);
  65  |       await pageManisha.waitForTimeout(2050);
  66  | 
  67  |       // Click "Interest" on Manish's card
  68  |       const sendInterestBtn = pageManisha.locator('button').filter({ hasText: /^Interest$/ }).first();
  69  |       await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
  70  |       await sendInterestBtn.click();
  71  |       
  72  |       // Wait for button state to update to "Sent"
  73  |       await expect(pageManisha.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
  74  |       await pageManisha.waitForTimeout(1000);
  75  |     });
  76  | 
  77  |     // ── STEP 3: Approve Interest as Manish ──────────────────────────────
  78  |     await test.step("Approve Manisha's Interest as Manish", async () => {
  79  |       // Go to Manish's Interests tab directly to fetch newly registered Manisha's profile
  80  |       await pageManish.goto("/dashboard?tab=interests");
  81  |       await pageManish.waitForTimeout(2000);
  82  | 
  83  |       // Assert: Marriage Requests sub-tab should not be visible before interest is approved
  84  |       await expect(pageManish.locator('button:has-text("Marriage Requests")')).not.toBeVisible();
  85  | 
  86  |       // Accept Manisha Gadekar's interest request
  87  |       const approveBtn = pageManish.locator('button:has-text("Approve")').first();
  88  |       await expect(approveBtn).toBeVisible({ timeout: 10000 });
  89  |       await approveBtn.click();
  90  | 
  91  |       // Wait for the Approve button to disappear, meaning it was processed
  92  |       await expect(approveBtn).not.toBeVisible({ timeout: 10000 });
  93  |       await pageManish.waitForTimeout(1000);
  94  | 
  95  |       // Assert: Marriage Requests tab is now visible after interest acceptance
  96  |       await expect(pageManish.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });
  97  |     });
  98  | 
  99  |     // ── STEP 4: Send Marriage Proposal from Manisha to Manish ───────────
  100 |     await test.step("Manisha Sends Marriage Proposal to Manish", async () => {
  101 |       // Go to Manisha's Interests tab directly to fetch accepted connection state
  102 |       await pageManisha.goto("/dashboard?tab=interests");
  103 |       await pageManisha.waitForTimeout(2000);
  104 | 
  105 |       // Click on "Sent Requests" sub-tab
  106 |       const sentRequestsTabBtn = pageManisha.locator('button:has-text("Sent Requests")');
  107 |       await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
  108 |       await sentRequestsTabBtn.click();
  109 |       await pageManisha.waitForTimeout(1000);
  110 | 
  111 |       // Assert: Marriage Requests tab is visible to Manisha
  112 |       await expect(pageManisha.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });
  113 | 
  114 |       // Click on Manish's card image to redirect to his profile view
  115 |       const manishCardImage = pageManisha.locator(`img[alt="${maleName}"]`);
  116 |       await expect(manishCardImage).toBeVisible({ timeout: 5000 });
  117 |       await manishCardImage.click({ force: true });
  118 |       await pageManisha.waitForTimeout(2000);
  119 | 
  120 |       // Verify URL redirect to view-profile tab
```
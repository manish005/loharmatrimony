# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marriage-proposal.spec.ts >> Marriage Proposal E2E Flow >> Register, Seed, Mutual Interest, and Send & Accept Marriage Proposal
- Location: e2e\marriage-proposal.spec.ts:78:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('img[alt="Priya Patil5778029d"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('img[alt="Priya Patil5778029d"]')

```

```yaml
- banner:
  - link "LOHAR समाज ॥ विवाह मंडळ ॥":
    - /url: /
  - button "Toggle Theme"
  - button "Notifications"
- main:
  - complementary:
    - heading "Dashboard Menu" [level=3]
    - navigation:
      - button "Recommended Profiles 69"
      - button "Advanced Search"
      - button "Shortlisted Profiles 0"
      - button "Interests 0"
      - button "Messages"
      - button "Profile"
      - button "KYC Verification"
      - button "Success Stories"
      - button "Subscriptions"
      - button "Settings"
  - main:
    - heading "Interests" [level=2]
    - paragraph: Manage your sent and received connection requests
    - button "Received Requests"
    - button "Sent Requests"
    - button "Marriage Requests"
    - paragraph: No interests sent yet
    - paragraph: When you send an interest to someone, it will appear here so you can track its status.
```

# Test source

```ts
  225 |           district: "Mumbai Suburban",
  226 |           address: "Bandra East",
  227 |           familyDetails: "Joint family.",
  228 |           fatherOccupation: "Government Employee",
  229 |           motherOccupation: "Homemaker",
  230 |           siblings: "1 Sister",
  231 |           photos: [
  232 |             "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  233 |             "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  234 |             "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
  235 |             "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
  236 |             "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop"
  237 |           ],
  238 |           photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  239 |           isVerified: true,
  240 |           isPremium: true,
  241 |           occupation: "Financial Analyst",
  242 |           education: "MBA in Finance",
  243 |           income: "₹10 Lakh - ₹12 Lakh",
  244 |           height: "5'4\"",
  245 |           weight: "58 kg",
  246 |           lifestyle: "Modern",
  247 |           foodPreference: "Vegetarian",
  248 |           smoking: "No",
  249 |           drinking: "Occasionally",
  250 |           hobbies: "Dancing, Cooking",
  251 |           subCaste: "Deshmukh" // Direct override to Deshmukh in seed data
  252 |         }
  253 |       });
  254 |       await page.waitForTimeout(2000);
  255 |     });
  256 | 
  257 |     // ── STEP 6: Send Interest from Priya (Female) to Raj (Male) ────────
  258 |     await test.step("Send Interest to Raj Sharma", async () => {
  259 |       // Go to Advanced Search Tab
  260 |       await page.goto("/dashboard?tab=search");
  261 |       await page.waitForTimeout(2050);
  262 | 
  263 |       // Search specifically for the unique male name
  264 |       const searchInput = page.locator('input[type="text"]');
  265 |       await searchInput.fill(maleName);
  266 |       await page.waitForTimeout(2050);
  267 | 
  268 |       // Click "Interest" on Raj's card
  269 |       const sendInterestBtn = page.locator('button').filter({ hasText: /^Interest$/ }).first();
  270 |       await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
  271 |       await sendInterestBtn.click();
  272 |       
  273 |       // Wait for button state to update to "Sent"
  274 |       await expect(page.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
  275 |       await page.waitForTimeout(1000);
  276 |     });
  277 | 
  278 |     // ── STEP 7: Logout Female User ────────────────────────────────────
  279 |     await test.step("Logout Female User", async () => {
  280 |       await page.evaluate(() => {
  281 |         (window as any).firebaseAuth.signOut();
  282 |       }).catch(() => {});
  283 |       await page.waitForTimeout(2000);
  284 |       await page.goto("/login");
  285 |       await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  286 |     });
  287 | 
  288 |     // ── STEP 8: Login Male User (Raj) & Approve Interest ──────────────
  289 |     await test.step("Login Raj and Approve Priya's Interest", async () => {
  290 |       // Login
  291 |       await page.fill('input[type="email"]', maleEmail);
  292 |       await page.fill('input[type="password"]', password);
  293 |       await page.click('button[type="submit"]');
  294 |       await page.waitForURL("**/dashboard", { timeout: 20000 });
  295 |       await page.waitForTimeout(2000);
  296 | 
  297 |       // Go to Interests Tab
  298 |       await page.goto("/dashboard?tab=interests");
  299 |       await page.waitForTimeout(2000);
  300 | 
  301 |       // Accept Priya Patil's interest request
  302 |       const approveBtn = page.locator('button:has-text("Approve")').first();
  303 |       await expect(approveBtn).toBeVisible({ timeout: 10000 });
  304 |       await approveBtn.click();
  305 | 
  306 |       // Wait for the Approve button to disappear, meaning it was processed
  307 |       await expect(approveBtn).not.toBeVisible({ timeout: 10000 });
  308 |       await page.waitForTimeout(1000);
  309 |     });
  310 | 
  311 |     // ── STEP 9: View Priya's Profile & Send Marriage Proposal ─────────
  312 |     await test.step("Send Marriage Proposal to Priya", async () => {
  313 |       // Go to Interests tab
  314 |       await page.goto("/dashboard?tab=interests");
  315 |       await page.waitForTimeout(2000);
  316 | 
  317 |       // Click on "Sent Requests" sub-tab
  318 |       const sentRequestsTabBtn = page.locator('button:has-text("Sent Requests")');
  319 |       await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
  320 |       await sentRequestsTabBtn.click();
  321 |       await page.waitForTimeout(1000);
  322 | 
  323 |       // Click on Priya's card image to redirect to her profile view
  324 |       const priyaCardImage = page.locator(`img[alt="${femaleName}"]`);
> 325 |       await expect(priyaCardImage).toBeVisible({ timeout: 5000 });
      |                                    ^ Error: expect(locator).toBeVisible() failed
  326 |       await priyaCardImage.click();
  327 |       await page.waitForTimeout(2000);
  328 | 
  329 |       // Verify URL redirect to view-profile tab
  330 |       await expect(page.url()).toContain("tab=view-profile");
  331 | 
  332 |       // Verify the "Let's Get Married!" button is visible and click it
  333 |       const letsGetMarriedBtn = page.locator('button:has-text("Let\'s Get Married!")');
  334 |       await expect(letsGetMarriedBtn).toBeVisible({ timeout: 10000 });
  335 |       await letsGetMarriedBtn.click();
  336 | 
  337 |       // In Marriage Proposal Modal, fill out details:
  338 |       await page.fill('input[type="date"]', "2027-12-25");
  339 |       await page.fill('input[type="time"]', "18:00");
  340 |       await page.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");
  341 | 
  342 |       // Click "Send Marriage Request"
  343 |       await page.click('button:has-text("Send Marriage Request")');
  344 |       await page.waitForTimeout(2500);
  345 |     });
  346 | 
  347 |     // ── STEP 10: Logout Male User ────────────────────────────────────
  348 |     await test.step("Logout Male User", async () => {
  349 |       await page.evaluate(() => {
  350 |         (window as any).firebaseAuth.signOut();
  351 |       }).catch(() => {});
  352 |       await page.waitForTimeout(2000);
  353 |       await page.goto("/login");
  354 |       await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  355 |     });
  356 | 
  357 |     // ── STEP 11: Login Female User (Priya) & Accept Proposal ──────────
  358 |     await test.step("Login Priya and Accept Proposal", async () => {
  359 |       // Login
  360 |       await page.fill('input[type="email"]', femaleEmail);
  361 |       await page.fill('input[type="password"]', password);
  362 |       await page.click('button[type="submit"]');
  363 |       await page.waitForURL("**/dashboard", { timeout: 20000 });
  364 |       await page.waitForTimeout(2000);
  365 | 
  366 |       // Open Notification dropdown and click on the proposal notification
  367 |       const notificationBell = page.locator('button[aria-label="Notifications"]');
  368 |       await expect(notificationBell).toBeVisible({ timeout: 5000 });
  369 |       await notificationBell.click();
  370 |       await page.waitForTimeout(1000);
  371 | 
  372 |       const proposalNotification = page.locator(`text=${maleName} proposed a marriage setup!`);
  373 |       await expect(proposalNotification).toBeVisible({ timeout: 5000 });
  374 |       await proposalNotification.click();
  375 |       await page.waitForTimeout(2000);
  376 | 
  377 |       // Verify we are on Interests tab -> Marriage Requests sub-tab
  378 |       const marriageReqTabBtn = page.locator('button:has-text("Marriage Requests")');
  379 |       await expect(marriageReqTabBtn).toBeVisible({ timeout: 5000 });
  380 |       await marriageReqTabBtn.click();
  381 |       await page.waitForTimeout(1000);
  382 | 
  383 |       // Find the pending proposal Accept button and click it
  384 |       const acceptProposalBtn = page.locator('button:has-text("Accept")').first();
  385 |       await expect(acceptProposalBtn).toBeVisible({ timeout: 5000 });
  386 |       await acceptProposalBtn.click();
  387 |       
  388 |       // Wait for updates & celebration animation
  389 |       await page.waitForTimeout(3000);
  390 | 
  391 |       // We should be redirected to the "Success Stories" tab
  392 |       await expect(page.url()).toContain("tab=stories");
  393 |     });
  394 | 
  395 |     // ── STEP 12: Verify UI Banners ────────────────────────────────────
  396 |     await test.step("Verify Partner UI Banner displays Marriage Fixed & Verify notifications", async () => {
  397 |       // Navigate to My Profile tab to verify partner banner
  398 |       await page.goto("/dashboard?tab=my-profile");
  399 |       await page.waitForTimeout(2000);
  400 | 
  401 |       const partnerNameLabel = page.locator(`text=${maleName}`);
  402 |       await expect(partnerNameLabel).toBeVisible({ timeout: 5000 });
  403 | 
  404 |       const bannerStatus = page.locator('button:has-text("Marriage Fixed")');
  405 |       await expect(bannerStatus).toBeVisible({ timeout: 5000 });
  406 | 
  407 |       // Logout Priya
  408 |       await page.evaluate(() => {
  409 |         (window as any).firebaseAuth.signOut();
  410 |       }).catch(() => {});
  411 |       await page.waitForTimeout(2000);
  412 |       await page.goto("/login");
  413 | 
  414 |       // Login Raj
  415 |       await page.fill('input[type="email"]', maleEmail);
  416 |       await page.fill('input[type="password"]', password);
  417 |       await page.click('button[type="submit"]');
  418 |       await page.waitForURL("**/dashboard", { timeout: 20000 });
  419 |       await page.waitForTimeout(2000);
  420 | 
  421 |       // Open notifications dropdown
  422 |       await page.locator('button[aria-label="Notifications"]').click();
  423 |       await page.waitForTimeout(1000);
  424 | 
  425 |       // Assert notification of acceptance in bell
```
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

Locator: locator('text=Priya Patilb510b241 proposed a marriage setup!')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Priya Patilb510b241 proposed a marriage setup!')

```

```yaml
- banner:
  - link "LOHAR समाज ॥ विवाह मंडळ ॥":
    - /url: /
  - button "Toggle Theme"
  - button "Notifications"
  - text: Notifications No notifications yet.
- main:
  - complementary:
    - heading "Dashboard Menu" [level=3]
    - navigation:
      - button "Recommended Profiles 104"
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
    - heading "Recommended Profiles" [level=2]
    - paragraph: Personalized recommendations based on your preferences
    - button "More Filters"
    - img "Priya Patil"
    - img "Priya Patil"
    - img "Priya Patil"
    - img "Priya Patil"
    - img "Priya Patil"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patil" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Riya Singh"
    - button "Shortlist Profile"
    - text: 90% Match
    - heading "Riya Singh" [level=4]
    - text: 27 yrs 5'5" Rajput Never Married M.Sc
    - paragraph: Pune, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patel"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patel" [level=4]
    - text: Verified 24 yrs 5'2" Leuva Never Married B.Tech 12 LPA
    - paragraph: Ahmedabad, Gujarat
    - button "Interest"
    - button "Chat"
    - img "Priya Patilc9b8e060"
    - img "Priya Patilc9b8e060"
    - img "Priya Patilc9b8e060"
    - img "Priya Patilc9b8e060"
    - img "Priya Patilc9b8e060"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patilc9b8e060" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patilf69018a2"
    - img "Priya Patilf69018a2"
    - img "Priya Patilf69018a2"
    - img "Priya Patilf69018a2"
    - img "Priya Patilf69018a2"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patilf69018a2" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patil"
    - img "Priya Patil"
    - img "Priya Patil"
    - img "Priya Patil"
    - img "Priya Patil"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patil" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patilee57f8c5"
    - img "Priya Patilee57f8c5"
    - img "Priya Patilee57f8c5"
    - img "Priya Patilee57f8c5"
    - img "Priya Patilee57f8c5"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patilee57f8c5" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patil"
    - img "Priya Patil"
    - img "Priya Patil"
    - img "Priya Patil"
    - img "Priya Patil"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patil" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patilaec2cb86"
    - img "Priya Patilaec2cb86"
    - img "Priya Patilaec2cb86"
    - img "Priya Patilaec2cb86"
    - img "Priya Patilaec2cb86"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patilaec2cb86" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Kavya Reddy"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Kavya Reddy" [level=4]
    - text: Verified 28 yrs 5'6" Reddy Never Married MBBS
    - paragraph: Hyderabad, Telangana
    - button "Interest"
    - button "Chat"
    - img "Ananya Sharma"
    - img "Ananya Sharma"
    - button "Shortlist Profile"
    - text: 80% Match
    - heading "Ananya Sharma" [level=4]
    - text: Verified 26 yrs 5'4" Saraswat Never Married MBA 15 LPA
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patilc5276204"
    - img "Priya Patilc5276204"
    - img "Priya Patilc5276204"
    - img "Priya Patilc5276204"
    - img "Priya Patilc5276204"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patilc5276204" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - button "Shortlist Profile"
    - text: 90% Match
    - heading "Nisha Shahd66fc76e" [level=4]
    - text: Verified 25 yrs Gadi Lohar Never Married
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patil"
    - img "Priya Patil"
    - img "Priya Patil"
    - img "Priya Patil"
    - img "Priya Patil"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patil" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patil4f65f6ab"
    - img "Priya Patil4f65f6ab"
    - img "Priya Patil4f65f6ab"
    - img "Priya Patil4f65f6ab"
    - img "Priya Patil4f65f6ab"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patil4f65f6ab" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patil687d1dad"
    - img "Priya Patil687d1dad"
    - img "Priya Patil687d1dad"
    - img "Priya Patil687d1dad"
    - img "Priya Patil687d1dad"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patil687d1dad" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patil2253f21c"
    - img "Priya Patil2253f21c"
    - img "Priya Patil2253f21c"
    - img "Priya Patil2253f21c"
    - img "Priya Patil2253f21c"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patil2253f21c" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patila370dc4d"
    - img "Priya Patila370dc4d"
    - img "Priya Patila370dc4d"
    - img "Priya Patila370dc4d"
    - img "Priya Patila370dc4d"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patila370dc4d" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patil e87bfe01"
    - img "Priya Patil e87bfe01"
    - img "Priya Patil e87bfe01"
    - img "Priya Patil e87bfe01"
    - img "Priya Patil e87bfe01"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya e87bfe01" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patilb510b241"
    - img "Priya Patilb510b241"
    - img "Priya Patilb510b241"
    - img "Priya Patilb510b241"
    - img "Priya Patilb510b241"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patilb510b241" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patil5778029d"
    - img "Priya Patil5778029d"
    - img "Priya Patil5778029d"
    - img "Priya Patil5778029d"
    - img "Priya Patil5778029d"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patil5778029d" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - button "Shortlist Profile"
    - text: 90% Match
    - heading "Nisha Shah938e9eab" [level=4]
    - text: Verified 25 yrs Gadi Lohar Never Married
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patil1bdb9b00"
    - img "Priya Patil1bdb9b00"
    - img "Priya Patil1bdb9b00"
    - img "Priya Patil1bdb9b00"
    - img "Priya Patil1bdb9b00"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patil1bdb9b00" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - img "Priya Patil4e5ea29f"
    - img "Priya Patil4e5ea29f"
    - img "Priya Patil4e5ea29f"
    - img "Priya Patil4e5ea29f"
    - img "Priya Patil4e5ea29f"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Priya Patil4e5ea29f" [level=4]
    - text: Verified 25 yrs 5'4" Deshmukh Never Married MBA in Finance ₹10 Lakh - ₹12 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
```

# Test source

```ts
  247 |           subCaste: "Deshmukh"
  248 |         }
  249 |       });
  250 |       await pagePriya.waitForTimeout(2000);
  251 |     });
  252 | 
  253 |     // ── STEP 5: Send Interest from Priya (Female) to Raj (Male) ────────
  254 |     await test.step("Send Interest to Raj Sharma", async () => {
  255 |       // Go to Advanced Search Tab
  256 |       await pagePriya.goto("/dashboard?tab=search");
  257 |       await pagePriya.waitForTimeout(2050);
  258 | 
  259 |       // Search specifically for the unique male name
  260 |       const searchInput = pagePriya.locator('input[type="text"]');
  261 |       await searchInput.fill(maleName);
  262 |       await pagePriya.waitForTimeout(2050);
  263 | 
  264 |       // Click "Interest" on Raj's card
  265 |       const sendInterestBtn = pagePriya.locator('button').filter({ hasText: /^Interest$/ }).first();
  266 |       await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
  267 |       await sendInterestBtn.click();
  268 |       
  269 |       // Wait for button state to update to "Sent"
  270 |       await expect(pagePriya.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
  271 |       await pagePriya.waitForTimeout(1000);
  272 |     });
  273 | 
  274 |     // ── STEP 6: Approve Interest as Raj ───────────────────────────────
  275 |     await test.step("Approve Priya's Interest as Raj", async () => {
  276 |       // Go to Raj's Interests tab directly to fetch newly registered Priya's profile
  277 |       await pageRaj.goto("/dashboard?tab=interests");
  278 |       await pageRaj.waitForTimeout(2000);
  279 | 
  280 |       // Assert: Marriage Requests sub-tab should not be visible before interest is approved
  281 |       await expect(pageRaj.locator('button:has-text("Marriage Requests")')).not.toBeVisible();
  282 | 
  283 |       // Accept Priya Patil's interest request
  284 |       const approveBtn = pageRaj.locator('button:has-text("Approve")').first();
  285 |       await expect(approveBtn).toBeVisible({ timeout: 10000 });
  286 |       await approveBtn.click();
  287 | 
  288 |       // Wait for the Approve button to disappear, meaning it was processed
  289 |       await expect(approveBtn).not.toBeVisible({ timeout: 10000 });
  290 |       await pageRaj.waitForTimeout(1000);
  291 | 
  292 |       // Assert: Marriage Requests tab is now visible after interest acceptance
  293 |       await expect(pageRaj.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });
  294 |     });
  295 | 
  296 |     // ── STEP 7: Send Marriage Proposal from Priya to Raj ────────────────
  297 |     await test.step("Priya Sends Marriage Proposal to Raj", async () => {
  298 |       // Go to Priya's Interests tab directly to fetch accepted connection state
  299 |       await pagePriya.goto("/dashboard?tab=interests");
  300 |       await pagePriya.waitForTimeout(2000);
  301 | 
  302 |       // Click on "Sent Requests" sub-tab
  303 |       const sentRequestsTabBtn = pagePriya.locator('button:has-text("Sent Requests")');
  304 |       await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
  305 |       await sentRequestsTabBtn.click();
  306 |       await pagePriya.waitForTimeout(1000);
  307 | 
  308 |       // Assert: Marriage Requests tab is visible to Priya
  309 |       await expect(pagePriya.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });
  310 | 
  311 |       // Click on Raj's card image to redirect to his profile view
  312 |       const rajCardImage = pagePriya.locator(`img[alt="${maleName}"]`);
  313 |       await expect(rajCardImage).toBeVisible({ timeout: 5000 });
  314 |       await rajCardImage.click({ force: true });
  315 |       await pagePriya.waitForTimeout(2000);
  316 | 
  317 |       // Verify URL redirect to view-profile tab
  318 |       await expect(pagePriya.url()).toContain("tab=view-profile");
  319 | 
  320 |       // Verify the "Let's Get Married!" button is visible and click it
  321 |       const letsGetMarriedBtn = pagePriya.locator('button:has-text("Let\'s Get Married!")');
  322 |       await expect(letsGetMarriedBtn).toBeVisible({ timeout: 10000 });
  323 |       await letsGetMarriedBtn.click();
  324 | 
  325 |       // In Marriage Proposal Modal, fill out details:
  326 |       await pagePriya.fill('input[type="date"]', "2027-12-25");
  327 |       await pagePriya.fill('input[type="time"]', "18:00");
  328 |       await pagePriya.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");
  329 | 
  330 |       // Click "Send Marriage Request"
  331 |       await pagePriya.click('button:has-text("Send Marriage Request")');
  332 |       await pagePriya.waitForTimeout(2500);
  333 |     });
  334 | 
  335 |     // ── STEP 8: Accept Proposal as Raj ─────────────────────────────────
  336 |     await test.step("Accept Proposal as Raj", async () => {
  337 |       // Go to Raj's dashboard to fetch newly created marriage request
  338 |       await pageRaj.goto("/dashboard");
  339 | 
  340 |       // Open Notification dropdown and click on the proposal notification
  341 |       const notificationBell = pageRaj.locator('button[aria-label="Notifications"]');
  342 |       await expect(notificationBell).toBeVisible({ timeout: 5000 });
  343 |       await notificationBell.click();
  344 |       await pageRaj.waitForTimeout(1000);
  345 | 
  346 |       const proposalNotification = pageRaj.locator(`text=${femaleName} proposed a marriage setup!`);
> 347 |       await expect(proposalNotification).toBeVisible({ timeout: 5000 });
      |                                          ^ Error: expect(locator).toBeVisible() failed
  348 |       await proposalNotification.click();
  349 |       await pageRaj.waitForTimeout(2000);
  350 | 
  351 |       // Verify we are on Interests tab -> Marriage Requests sub-tab
  352 |       const marriageReqTabBtn = pageRaj.locator('button:has-text("Marriage Requests")');
  353 |       await expect(marriageReqTabBtn).toBeVisible({ timeout: 5000 });
  354 |       await marriageReqTabBtn.click();
  355 |       await pageRaj.waitForTimeout(1000);
  356 | 
  357 |       // Find the pending proposal Accept button and click it
  358 |       const acceptProposalBtn = pageRaj.locator('button:has-text("Accept")').first();
  359 |       await expect(acceptProposalBtn).toBeVisible({ timeout: 5000 });
  360 |       await acceptProposalBtn.click();
  361 |       
  362 |       // Wait for updates & celebration animation
  363 |       await pageRaj.waitForTimeout(3000);
  364 | 
  365 |       // We should be redirected to the "Success Stories" tab
  366 |       await expect(pageRaj.url()).toContain("tab=stories");
  367 |     });
  368 | 
  369 |     // ── STEP 9: Verify UI Banners ─────────────────────────────────────
  370 |     await test.step("Verify Partner UI Banner displays Marriage Fixed & Verify notifications", async () => {
  371 |       // Navigate to My Profile tab to verify partner banner
  372 |       await pageRaj.goto("/dashboard?tab=my-profile");
  373 |       await pageRaj.waitForTimeout(2000);
  374 | 
  375 |       const partnerNameLabel = pageRaj.locator(`text=${femaleName}`);
  376 |       await expect(partnerNameLabel).toBeVisible({ timeout: 5000 });
  377 | 
  378 |       const bannerStatus = pageRaj.locator('button:has-text("Marriage Fixed")');
  379 |       await expect(bannerStatus).toBeVisible({ timeout: 5000 });
  380 | 
  381 |       // Go to Priya's dashboard to fetch updated profile state with banner
  382 |       await pagePriya.goto("/dashboard");
  383 | 
  384 |       // Open notifications dropdown on Priya's page
  385 |       await pagePriya.locator('button[aria-label="Notifications"]').click();
  386 |       await pagePriya.waitForTimeout(1000);
  387 | 
  388 |       // Assert notification of acceptance in bell
  389 |       const acceptedNotification = pagePriya.locator(`text=${maleName} accepted your marriage proposal! Congratulations!`);
  390 |       await expect(acceptedNotification).toBeVisible({ timeout: 5000 });
  391 |     });
  392 | 
  393 |     await contextRaj.close();
  394 |     await contextPriya.close();
  395 |   });
  396 | 
  397 |   test("Interest Rejection and Marriage Proposal Rejection Connection Reset Flow", async ({ browser }) => {
  398 |     // Open separate browser contexts for Aman and Neha
  399 |     const contextAman = await browser.newContext();
  400 |     const pageAman = await contextAman.newPage();
  401 | 
  402 |     const contextNeha = await browser.newContext();
  403 |     const pageNeha = await contextNeha.newPage();
  404 | 
  405 |     let boyEmail = `boy_${rand()}@example.com`;
  406 |     let girlEmail = `girl_${rand()}@example.com`;
  407 |     let bSuffix = rand();
  408 |     let boyName = `Aman Sen${bSuffix}`;
  409 |     let girlName = `Nisha Shah${bSuffix}`;
  410 | 
  411 |     // 1. Register Boy (Aman)
  412 |     await test.step("Register Boy (Aman)", async () => {
  413 |       await pageAman.goto("/register");
  414 |       await pageAman.waitForSelector('input[name="firstName"]', { timeout: 10000 });
  415 |       await pageAman.fill('input[name="firstName"]', "Aman");
  416 |       await pageAman.fill('input[name="lastName"]', `Sen${bSuffix}`);
  417 |       await pageAman.selectOption('select[name="gender"]', "Male");
  418 |       await pageAman.fill('input[name="dob"]', "1993-05-12");
  419 |       await pageAman.fill('input[name="mobile"]', "9123456780");
  420 |       await pageAman.fill('input[name="email"]', boyEmail);
  421 |       await pageAman.fill('input[name="password"]', password);
  422 |       await pageAman.fill('input[name="confirmPassword"]', password);
  423 |       await pageAman.click('button:has-text("Continue")');
  424 |       await pageAman.waitForTimeout(1000);
  425 | 
  426 |       await pageAman.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
  427 |       await pageAman.selectOption('select[name="subCaste"]', "Panchal");
  428 |       await pageAman.click('button:has-text("Continue")');
  429 |       await pageAman.waitForTimeout(1000);
  430 | 
  431 |       await pageAman.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
  432 |       await pageAman.fill('input[name="aadhaarNumber"]', "123456789014");
  433 |       await pageAman.check('input[id="termsAccepted"]');
  434 |       pageAman.once("dialog", async (dialog) => await dialog.accept());
  435 |       await pageAman.click('button[type="submit"]');
  436 |       await pageAman.waitForURL("**/dashboard", { timeout: 20000 });
  437 |       await pageAman.waitForTimeout(2000);
  438 |       await completeOnboarding(pageAman, boyName);
  439 |     });
  440 | 
  441 |     // 2. Seed Boy details
  442 |     await test.step("Seed Boy Profile (Aman)", async () => {
  443 |       await pageAman.evaluate(async ({ email, profileData }) => {
  444 |         const { collection, query, where, getDocs, doc, updateDoc } = (window as any).firestoreHelpers;
  445 |         const db = (window as any).firebaseDb;
  446 |         const q = query(collection(db, "profiles"), where("email", "==", email));
  447 |         const snapshot = await getDocs(q);
```
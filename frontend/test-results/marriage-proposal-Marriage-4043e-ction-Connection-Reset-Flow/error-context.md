# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marriage-proposal.spec.ts >> Marriage Proposal E2E Flow >> Interest Rejection and Marriage Proposal Rejection Connection Reset Flow
- Location: e2e\marriage-proposal.spec.ts:200:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: /^Interest$/ }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button').filter({ hasText: /^Interest$/ }).first()

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
      - button "Recommended Profiles 3"
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
    - heading "Advanced Partner Search" [level=2]
    - paragraph: Filter the Lohar matrimonial directory using specific preferences
    - textbox "Name, job, city...": Priya Gadekar
    - button "More Filters"
    - paragraph: No matching profiles found.
    - paragraph: Try broadening your search keywords or sub-caste selections.
```

# Test source

```ts
  125 |       await expect(letsGetMarriedBtn).toBeVisible({ timeout: 10000 });
  126 |       await letsGetMarriedBtn.click();
  127 | 
  128 |       // In Marriage Proposal Modal, fill out details:
  129 |       await pageManisha.fill('input[type="date"]', "2027-12-25");
  130 |       await pageManisha.fill('input[type="time"]', "18:00");
  131 |       await pageManisha.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");
  132 | 
  133 |       // Click "Send Marriage Request"
  134 |       await pageManisha.click('button:has-text("Send Marriage Request")');
  135 |       await pageManisha.waitForTimeout(2500);
  136 |     });
  137 | 
  138 |     // ── STEP 5: Accept Proposal as Manish ───────────────────────────────
  139 |     await test.step("Accept Proposal as Manish", async () => {
  140 |       // Go to Manish's dashboard to fetch newly created marriage request
  141 |       await pageManish.goto("/dashboard");
  142 | 
  143 |       // Open Notification dropdown and click on the proposal notification
  144 |       const notificationBell = pageManish.locator('button[aria-label="Notifications"]');
  145 |       await expect(notificationBell).toBeVisible({ timeout: 5000 });
  146 |       await notificationBell.click();
  147 |       await pageManish.waitForTimeout(1000);
  148 | 
  149 |       const proposalNotification = pageManish.locator(`text=${femaleName} proposed a marriage setup!`);
  150 |       await expect(proposalNotification).toBeVisible({ timeout: 5000 });
  151 |       await proposalNotification.click();
  152 |       await pageManish.waitForTimeout(2000);
  153 | 
  154 |       // Verify we are on Interests tab -> Marriage Requests sub-tab
  155 |       const marriageReqTabBtn = pageManish.locator('button:has-text("Marriage Requests")');
  156 |       await expect(marriageReqTabBtn).toBeVisible({ timeout: 5000 });
  157 |       await marriageReqTabBtn.click();
  158 |       await pageManish.waitForTimeout(1000);
  159 | 
  160 |       // Find the pending proposal Accept button and click it
  161 |       const acceptProposalBtn = pageManish.locator('button:has-text("Accept")').first();
  162 |       await expect(acceptProposalBtn).toBeVisible({ timeout: 5000 });
  163 |       await acceptProposalBtn.click();
  164 |       
  165 |       // Wait for updates & celebration animation
  166 |       await pageManish.waitForTimeout(3000);
  167 | 
  168 |       // We should be redirected to the "Success Stories" tab
  169 |       await expect(pageManish.url()).toContain("tab=stories");
  170 |     });
  171 | 
  172 |     // ── STEP 6: Verify UI Banners ───────────────────────────────────────
  173 |     await test.step("Verify Partner UI Banner displays Marriage Fixed & Verify notifications", async () => {
  174 |       // Navigate to My Profile tab to verify partner banner
  175 |       await pageManish.goto("/dashboard?tab=my-profile");
  176 |       await pageManish.waitForTimeout(2000);
  177 | 
  178 |       const partnerNameLabel = pageManish.locator(`text=${femaleName}`);
  179 |       await expect(partnerNameLabel).toBeVisible({ timeout: 5000 });
  180 | 
  181 |       const bannerStatus = pageManish.locator('button:has-text("Marriage Fixed")');
  182 |       await expect(bannerStatus).toBeVisible({ timeout: 5000 });
  183 | 
  184 |       // Go to Manisha's dashboard to fetch updated profile state with banner
  185 |       await pageManisha.goto("/dashboard");
  186 | 
  187 |       // Open notifications dropdown on Manisha's page
  188 |       await pageManisha.locator('button[aria-label="Notifications"]').click();
  189 |       await pageManisha.waitForTimeout(1000);
  190 | 
  191 |       // Assert notification of acceptance in bell
  192 |       const acceptedNotification = pageManisha.locator(`text=${maleName} accepted your marriage proposal! Congratulations!`);
  193 |       await expect(acceptedNotification).toBeVisible({ timeout: 5000 });
  194 |     });
  195 | 
  196 |     await contextManish.close();
  197 |     await contextManisha.close();
  198 |   });
  199 | 
  200 |   test("Interest Rejection and Marriage Proposal Rejection Connection Reset Flow", async ({ browser }) => {
  201 |     // Open separate browser contexts for Manish and Priya
  202 |     const contextManish = await browser.newContext();
  203 |     const pageManish = await contextManish.newPage();
  204 | 
  205 |     const contextPriya = await browser.newContext();
  206 |     const pagePriya = await contextPriya.newPage();
  207 | 
  208 |     // ── STEP 1: Log in both users ─────────────────────────────────────
  209 |     await test.step("Log in Manish (Male) and Priya (Female)", async () => {
  210 |       await loginUser(pageManish, maleEmail);
  211 |       await loginUser(pagePriya, femaleEmail2);
  212 |     });
  213 | 
  214 |     // ── STEP 2: Send Interest from Manish (Male) to Priya (Female) ─────
  215 |     await test.step("Manish Sends Interest to Priya", async () => {
  216 |       // Search for Priya directly
  217 |       await pageManish.goto("/dashboard?tab=search");
  218 |       await pageManish.waitForTimeout(2050);
  219 |       const searchInput = pageManish.locator('input[type="text"]');
  220 |       await searchInput.fill(femaleName2);
  221 |       await pageManish.waitForTimeout(2050);
  222 | 
  223 |       // Click Interest
  224 |       const sendInterestBtn = pageManish.locator('button').filter({ hasText: /^Interest$/ }).first();
> 225 |       await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
      |                                     ^ Error: expect(locator).toBeVisible() failed
  226 |       await sendInterestBtn.click();
  227 |       await expect(pageManish.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
  228 |     });
  229 | 
  230 |     // ── STEP 3: Priya Declines Manish's Interest (Rejection Flow) ───────
  231 |     await test.step("Priya Declines Manish's Interest", async () => {
  232 |       // Go to Priya's Interests tab directly
  233 |       await pagePriya.goto("/dashboard?tab=interests");
  234 |       await pagePriya.waitForTimeout(2000);
  235 | 
  236 |       // Assert: Marriage Requests sub-tab should not be visible before interest is approved
  237 |       await expect(pagePriya.locator('button:has-text("Marriage Requests")')).not.toBeVisible();
  238 | 
  239 |       // Reject connection
  240 |       const rejectBtn = pagePriya.locator('button:has-text("Reject")').first();
  241 |       await expect(rejectBtn).toBeVisible({ timeout: 10000 });
  242 |       await rejectBtn.click();
  243 |       await expect(rejectBtn).not.toBeVisible({ timeout: 10000 });
  244 |     });
  245 | 
  246 |     // ── STEP 4: Manish Verifies Interest Rejection Reset ────────────────
  247 |     await test.step("Manish Verifies Interest Rejection Reset", async () => {
  248 |       // Go to Manish's dashboard directly
  249 |       await pageManish.goto("/dashboard");
  250 | 
  251 |       // Check notification bell for rejection
  252 |       await pageManish.locator('button[aria-label="Notifications"]').click();
  253 |       await pageManish.waitForTimeout(1000);
  254 |       const declineNoti = pageManish.locator(`text=${femaleName2} respectfully declined your interest.`);
  255 |       await expect(declineNoti).toBeVisible({ timeout: 5000 });
  256 |       await declineNoti.click();
  257 |       await pageManish.waitForTimeout(1000);
  258 | 
  259 |       // Verify Sent Requests tab is empty (Manish doesn't see Priya's card in Interests Sent anymore)
  260 |       const sentRequestsTabBtn = pageManish.locator('button:has-text("Sent Requests")');
  261 |       await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
  262 |       await sentRequestsTabBtn.click();
  263 |       await pageManish.waitForTimeout(1500);
  264 | 
  265 |       // Assert Priya Gadekar is not visible in Interests Sent
  266 |       await expect(pageManish.locator(`text=${femaleName2}`)).not.toBeVisible({ timeout: 2000 });
  267 |     });
  268 | 
  269 |     // ── STEP 5: Send Interest Again & Approve Interest ─────────────────
  270 |     await test.step("Manish Sends Interest Again & Priya Approves", async () => {
  271 |       // Go to Search, find Priya, and click Interest again
  272 |       await pageManish.goto("/dashboard?tab=search");
  273 |       await pageManish.waitForTimeout(2050);
  274 |       const searchInput = pageManish.locator('input[type="text"]');
  275 |       await searchInput.fill(femaleName2);
  276 |       await pageManish.waitForTimeout(2050);
  277 | 
  278 |       const sendInterestBtn = pageManish.locator('button').filter({ hasText: /^Interest$/ }).first();
  279 |       await expect(sendInterestBtn).toBeVisible({ timeout: 5000 });
  280 |       await sendInterestBtn.click();
  281 |       await expect(pageManish.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 5000 });
  282 | 
  283 |       // Go to Interests, approve Manish on Priya's page directly
  284 |       await pagePriya.goto("/dashboard?tab=interests");
  285 |       await pagePriya.waitForTimeout(2000);
  286 | 
  287 |       // Assert: Marriage Requests sub-tab should not be visible before interest is approved
  288 |       await expect(pagePriya.locator('button:has-text("Marriage Requests")')).not.toBeVisible();
  289 | 
  290 |       const approveBtn = pagePriya.locator('button:has-text("Approve")').first();
  291 |       await expect(approveBtn).toBeVisible({ timeout: 10000 });
  292 |       await approveBtn.click();
  293 |       await expect(approveBtn).not.toBeVisible({ timeout: 5000 });
  294 | 
  295 |       // Assert: Marriage Requests sub-tab is now visible after interest acceptance
  296 |       await expect(pagePriya.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });
  297 |     });
  298 | 
  299 |     // ── STEP 6: Manish Sends Marriage Proposal ─────────────────────────
  300 |     await test.step("Manish Sends Marriage Proposal to Priya", async () => {
  301 |       // Go to Manish's Interests tab directly
  302 |       await pageManish.goto("/dashboard?tab=interests");
  303 |       await pageManish.waitForTimeout(2000);
  304 |       const sentRequestsTabBtn = pageManish.locator('button:has-text("Sent Requests")');
  305 |       await sentRequestsTabBtn.click();
  306 |       await pageManish.waitForTimeout(1000);
  307 | 
  308 |       const priyaCardImage = pageManish.locator(`img[alt="${femaleName2}"]`);
  309 |       await expect(priyaCardImage).toBeVisible({ timeout: 5000 });
  310 |       await priyaCardImage.click({ force: true });
  311 |       await pageManish.waitForTimeout(2000);
  312 | 
  313 |       // Send Marriage Proposal
  314 |       const letsGetMarriedBtn = pageManish.locator('button:has-text("Let\'s Get Married!")');
  315 |       await expect(letsGetMarriedBtn).toBeVisible({ timeout: 5000 });
  316 |       await letsGetMarriedBtn.click();
  317 | 
  318 |       await pageManish.fill('input[type="date"]', "2027-12-25");
  319 |       await pageManish.fill('input[type="time"]', "18:00");
  320 |       await pageManish.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");
  321 |       await pageManish.click('button:has-text("Send Marriage Request")');
  322 |       await pageManish.waitForTimeout(2500);
  323 |     });
  324 | 
  325 |     // ── STEP 7: Priya Declines Marriage Proposal ───────────────────────
```
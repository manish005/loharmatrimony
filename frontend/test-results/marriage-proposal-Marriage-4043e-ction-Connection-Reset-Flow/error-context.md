# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marriage-proposal.spec.ts >> Marriage Proposal E2E Flow >> Interest Rejection and Marriage Proposal Rejection Connection Reset Flow
- Location: e2e\marriage-proposal.spec.ts:433:3

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
      - button "Recommended Profiles 71"
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
    - textbox "Name, job, city...": Neha Shah9be4b4ef
    - button "More Filters"
    - paragraph: No matching profiles found.
    - paragraph: Try broadening your search keywords or sub-caste selections.
```

# Test source

```ts
  485 |           city: "Mumbai",
  486 |           district: "Mumbai Suburban",
  487 |           isVerified: true,
  488 |           isPremium: true,
  489 |           photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
  490 |         }
  491 |       });
  492 |       await page.waitForTimeout(1000);
  493 |     });
  494 | 
  495 |     // 3. Logout Boy
  496 |     await test.step("Logout Aman", async () => {
  497 |       await page.evaluate(() => {
  498 |         (window as any).firebaseAuth.signOut();
  499 |       }).catch(() => {});
  500 |       await page.waitForTimeout(2000);
  501 |       await page.goto("/login");
  502 |     });
  503 | 
  504 |     // 4. Register Girl
  505 |     await test.step("Register Girl (Neha)", async () => {
  506 |       await page.goto("/register");
  507 |       await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
  508 |       await page.fill('input[name="firstName"]', "Neha");
  509 |       await page.fill('input[name="lastName"]', `Shah${bSuffix}`);
  510 |       await page.selectOption('select[name="gender"]', "Female");
  511 |       await page.fill('input[name="dob"]', "1995-10-20");
  512 |       await page.fill('input[name="mobile"]', "9123456781");
  513 |       await page.fill('input[name="email"]', girlEmail);
  514 |       await page.fill('input[name="password"]', password);
  515 |       await page.fill('input[name="confirmPassword"]', password);
  516 |       await page.click('button:has-text("Continue")');
  517 |       await page.waitForTimeout(1000);
  518 | 
  519 |       await page.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
  520 |       await page.selectOption('select[name="subCaste"]', "Gadi Lohar");
  521 |       await page.click('button:has-text("Continue")');
  522 |       await page.waitForTimeout(1000);
  523 | 
  524 |       await page.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
  525 |       await page.fill('input[name="aadhaarNumber"]', "123456789015");
  526 |       await page.check('input[id="termsAccepted"]');
  527 |       page.once("dialog", async (dialog) => await dialog.accept());
  528 |       await page.click('button[type="submit"]');
  529 |       await page.waitForURL("**/dashboard", { timeout: 20000 });
  530 |       await page.waitForTimeout(2000);
  531 |       await completeOnboarding(page, girlName);
  532 |     });
  533 | 
  534 |     // 5. Seed Girl details
  535 |     await test.step("Seed Girl Profile (Neha)", async () => {
  536 |       await page.evaluate(async ({ email, profileData }) => {
  537 |         const { collection, query, where, getDocs, doc, updateDoc } = (window as any).firestoreHelpers;
  538 |         const db = (window as any).firebaseDb;
  539 |         const q = query(collection(db, "profiles"), where("email", "==", email));
  540 |         const snapshot = await getDocs(q);
  541 |         if (snapshot.empty) throw new Error("Neha not found");
  542 |         const ref = doc(db, "profiles", snapshot.docs[0].id);
  543 |         await updateDoc(ref, profileData);
  544 |       }, {
  545 |         email: girlEmail,
  546 |         profileData: {
  547 |           name: girlName,
  548 |           state: "Maharashtra",
  549 |           city: "Mumbai",
  550 |           district: "Mumbai Suburban",
  551 |           isVerified: true,
  552 |           isPremium: true,
  553 |           photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
  554 |         }
  555 |       });
  556 |       await page.waitForTimeout(1000);
  557 |     });
  558 | 
  559 |     // 6. Logout Girl
  560 |     await test.step("Logout Neha", async () => {
  561 |       await page.evaluate(() => {
  562 |         (window as any).firebaseAuth.signOut();
  563 |       }).catch(() => {});
  564 |       await page.waitForTimeout(2000);
  565 |       await page.goto("/login");
  566 |     });
  567 | 
  568 |     // 7. Login Boy (Aman) & Send Interest to Neha
  569 |     await test.step("Aman Sends Interest to Neha", async () => {
  570 |       await page.fill('input[type="email"]', boyEmail);
  571 |       await page.fill('input[type="password"]', password);
  572 |       await page.click('button[type="submit"]');
  573 |       await page.waitForURL("**/dashboard", { timeout: 20000 });
  574 |       await page.waitForTimeout(2000);
  575 | 
  576 |       // Search for Neha
  577 |       await page.goto("/dashboard?tab=search");
  578 |       await page.waitForTimeout(2050);
  579 |       const searchInput = page.locator('input[type="text"]');
  580 |       await searchInput.fill(girlName);
  581 |       await page.waitForTimeout(2050);
  582 | 
  583 |       // Click Interest
  584 |       const sendInterestBtn = page.locator('button').filter({ hasText: /^Interest$/ }).first();
> 585 |       await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
      |                                     ^ Error: expect(locator).toBeVisible() failed
  586 |       await sendInterestBtn.click();
  587 |       await expect(page.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
  588 |     });
  589 | 
  590 |     // 8. Logout Aman
  591 |     await test.step("Logout Aman", async () => {
  592 |       await page.evaluate(() => {
  593 |         (window as any).firebaseAuth.signOut();
  594 |       }).catch(() => {});
  595 |       await page.waitForTimeout(2000);
  596 |       await page.goto("/login");
  597 |     });
  598 | 
  599 |     // 9. Login Neha & Decline Interest (Rejection Flow)
  600 |     await test.step("Neha Declines Aman's Interest", async () => {
  601 |       await page.fill('input[type="email"]', girlEmail);
  602 |       await page.fill('input[type="password"]', password);
  603 |       await page.click('button[type="submit"]');
  604 |       await page.waitForURL("**/dashboard", { timeout: 20000 });
  605 |       await page.waitForTimeout(2000);
  606 | 
  607 |       // Go to Interests tab
  608 |       await page.goto("/dashboard?tab=interests");
  609 |       await page.waitForTimeout(2000);
  610 | 
  611 |       // Reject connection
  612 |       const rejectBtn = page.locator('button:has-text("Reject")').first();
  613 |       await expect(rejectBtn).toBeVisible({ timeout: 10000 });
  614 |       await rejectBtn.click();
  615 |       await expect(rejectBtn).not.toBeVisible({ timeout: 10000 });
  616 |     });
  617 | 
  618 |     // 10. Logout Neha
  619 |     await test.step("Logout Neha", async () => {
  620 |       await page.evaluate(() => {
  621 |         (window as any).firebaseAuth.signOut();
  622 |       }).catch(() => {});
  623 |       await page.waitForTimeout(2000);
  624 |       await page.goto("/login");
  625 |     });
  626 | 
  627 |     // 11. Login Aman & Verify connection was reset (Aman's Sent tab is empty, receives notification)
  628 |     await test.step("Aman Verifies Interest Rejection Reset", async () => {
  629 |       await page.fill('input[type="email"]', boyEmail);
  630 |       await page.fill('input[type="password"]', password);
  631 |       await page.click('button[type="submit"]');
  632 |       await page.waitForURL("**/dashboard", { timeout: 20000 });
  633 |       await page.waitForTimeout(2000);
  634 | 
  635 |       // Check notification bell for rejection
  636 |       await page.locator('button[aria-label="Notifications"]').click();
  637 |       await page.waitForTimeout(1000);
  638 |       const declineNoti = page.locator(`text=${girlName} respectfully declined your interest.`);
  639 |       await expect(declineNoti).toBeVisible({ timeout: 5000 });
  640 |       await declineNoti.click();
  641 |       await page.waitForTimeout(1000);
  642 | 
  643 |       // Verify Sent Requests tab is empty (Aman doesn't see Neha's card in Interests Sent anymore)
  644 |       const sentRequestsTabBtn = page.locator('button:has-text("Sent Requests")');
  645 |       await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
  646 |       await sentRequestsTabBtn.click();
  647 |       await page.waitForTimeout(1500);
  648 | 
  649 |       // Assert Neha Shah is not visible in Interests Sent
  650 |       await expect(page.locator(`text=${girlName}`)).not.toBeVisible({ timeout: 2000 });
  651 |     });
  652 | 
  653 |     // 12. Send Interest Again & Accept Interest (Prepare for marriage proposal rejection)
  654 |     await test.step("Aman Sends Interest Again & Neha Approves", async () => {
  655 |       // Go to Search, find Neha, and click Interest again
  656 |       await page.goto("/dashboard?tab=search");
  657 |       await page.waitForTimeout(2050);
  658 |       const searchInput = page.locator('input[type="text"]');
  659 |       await searchInput.fill(girlName);
  660 |       await page.waitForTimeout(2050);
  661 | 
  662 |       const sendInterestBtn = page.locator('button').filter({ hasText: /^Interest$/ }).first();
  663 |       await expect(sendInterestBtn).toBeVisible({ timeout: 5000 });
  664 |       await sendInterestBtn.click();
  665 |       await expect(page.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 5000 });
  666 | 
  667 |       // Logout Aman
  668 |       await page.evaluate(() => {
  669 |         (window as any).firebaseAuth.signOut();
  670 |       }).catch(() => {});
  671 |       await page.waitForTimeout(2000);
  672 |       await page.goto("/login");
  673 | 
  674 |       // Login Neha
  675 |       await page.fill('input[type="email"]', girlEmail);
  676 |       await page.fill('input[type="password"]', password);
  677 |       await page.click('button[type="submit"]');
  678 |       await page.waitForURL("**/dashboard", { timeout: 20000 });
  679 |       await page.waitForTimeout(2000);
  680 | 
  681 |       // Go to Interests, approve Aman
  682 |       await page.goto("/dashboard?tab=interests");
  683 |       await page.waitForTimeout(2000);
  684 |       const approveBtn = page.locator('button:has-text("Approve")').first();
  685 |       await expect(approveBtn).toBeVisible({ timeout: 10000 });
```
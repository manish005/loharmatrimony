# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marriage-proposal.spec.ts >> Marriage Proposal E2E Flow >> Interest Rejection and Marriage Proposal Rejection Connection Reset Flow
- Location: e2e\marriage-proposal.spec.ts:397:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Nisha Shahb48bcf7f respectfully declined your interest.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Nisha Shahb48bcf7f respectfully declined your interest.')

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
      - button "Recommended Profiles 106"
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
    - button "Shortlist Profile"
    - text: 90% Match
    - heading "Nisha Shahb48bcf7f" [level=4]
    - text: Verified 25 yrs Gadi Lohar Never Married
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
```

# Test source

```ts
  466 |     });
  467 | 
  468 |     // 3. Register Girl (Nisha)
  469 |     await test.step("Register Girl (Nisha)", async () => {
  470 |       await pageNeha.goto("/register");
  471 |       await pageNeha.waitForSelector('input[name="firstName"]', { timeout: 10000 });
  472 |       await pageNeha.fill('input[name="firstName"]', "Nisha");
  473 |       await pageNeha.fill('input[name="lastName"]', `Shah${bSuffix}`);
  474 |       await pageNeha.selectOption('select[name="gender"]', "Female");
  475 |       await pageNeha.fill('input[name="dob"]', "1995-10-20");
  476 |       await pageNeha.fill('input[name="mobile"]', "9123456781");
  477 |       await pageNeha.fill('input[name="email"]', girlEmail);
  478 |       await pageNeha.fill('input[name="password"]', password);
  479 |       await pageNeha.fill('input[name="confirmPassword"]', password);
  480 |       await pageNeha.click('button:has-text("Continue")');
  481 |       await pageNeha.waitForTimeout(1000);
  482 | 
  483 |       await pageNeha.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
  484 |       await pageNeha.selectOption('select[name="subCaste"]', "Gadi Lohar");
  485 |       await pageNeha.click('button:has-text("Continue")');
  486 |       await pageNeha.waitForTimeout(1000);
  487 | 
  488 |       await pageNeha.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
  489 |       await pageNeha.fill('input[name="aadhaarNumber"]', "123456789015");
  490 |       await pageNeha.check('input[id="termsAccepted"]');
  491 |       pageNeha.once("dialog", async (dialog) => await dialog.accept());
  492 |       await pageNeha.click('button[type="submit"]');
  493 |       await pageNeha.waitForURL("**/dashboard", { timeout: 20000 });
  494 |       await pageNeha.waitForTimeout(2000);
  495 |       await completeOnboarding(pageNeha, girlName);
  496 |     });
  497 | 
  498 |     // 4. Seed Girl Profile (Nisha)
  499 |     await test.step("Seed Girl Profile (Nisha)", async () => {
  500 |       await pageNeha.evaluate(async ({ email, profileData }) => {
  501 |         const { collection, query, where, getDocs, doc, updateDoc } = (window as any).firestoreHelpers;
  502 |         const db = (window as any).firebaseDb;
  503 |         const q = query(collection(db, "profiles"), where("email", "==", email));
  504 |         const snapshot = await getDocs(q);
  505 |         if (snapshot.empty) throw new Error("Nisha not found");
  506 |         const ref = doc(db, "profiles", snapshot.docs[0].id);
  507 |         await updateDoc(ref, profileData);
  508 |       }, {
  509 |         email: girlEmail,
  510 |         profileData: {
  511 |           name: girlName,
  512 |           firstName: "Nisha",
  513 |           lastName: `Shah${bSuffix}`,
  514 |           state: "Maharashtra",
  515 |           city: "Mumbai",
  516 |           district: "Mumbai Suburban",
  517 |           isVerified: true,
  518 |           isPremium: true,
  519 |           photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
  520 |         }
  521 |       });
  522 |       await pageNeha.waitForTimeout(1000);
  523 |     });
  524 | 
  525 |     // 5. Aman Sends Interest to Nisha
  526 |     await test.step("Aman Sends Interest to Nisha", async () => {
  527 |       // Search for Nisha directly
  528 |       await pageAman.goto("/dashboard?tab=search");
  529 |       await pageAman.waitForTimeout(2050);
  530 |       const searchInput = pageAman.locator('input[type="text"]');
  531 |       await searchInput.fill(girlName);
  532 |       await pageAman.waitForTimeout(2050);
  533 | 
  534 |       // Click Interest
  535 |       const sendInterestBtn = pageAman.locator('button').filter({ hasText: /^Interest$/ }).first();
  536 |       await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
  537 |       await sendInterestBtn.click();
  538 |       await expect(pageAman.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
  539 |     });
  540 | 
  541 |     // 6. Nisha Declines Aman's Interest (Rejection Flow)
  542 |     await test.step("Nisha Declines Aman's Interest", async () => {
  543 |       // Go to Nisha's Interests tab directly
  544 |       await pageNeha.goto("/dashboard?tab=interests");
  545 |       await pageNeha.waitForTimeout(2000);
  546 | 
  547 |       // Assert: Marriage Requests sub-tab should not be visible before interest is approved
  548 |       await expect(pageNeha.locator('button:has-text("Marriage Requests")')).not.toBeVisible();
  549 | 
  550 |       // Reject connection
  551 |       const rejectBtn = pageNeha.locator('button:has-text("Reject")').first();
  552 |       await expect(rejectBtn).toBeVisible({ timeout: 10000 });
  553 |       await rejectBtn.click();
  554 |       await expect(rejectBtn).not.toBeVisible({ timeout: 10000 });
  555 |     });
  556 | 
  557 |     // 7. Aman Verifies Interest Rejection Reset
  558 |     await test.step("Aman Verifies Interest Rejection Reset", async () => {
  559 |       // Go to Aman's dashboard directly
  560 |       await pageAman.goto("/dashboard");
  561 | 
  562 |       // Check notification bell for rejection
  563 |       await pageAman.locator('button[aria-label="Notifications"]').click();
  564 |       await pageAman.waitForTimeout(1000);
  565 |       const declineNoti = pageAman.locator(`text=${girlName} respectfully declined your interest.`);
> 566 |       await expect(declineNoti).toBeVisible({ timeout: 5000 });
      |                                 ^ Error: expect(locator).toBeVisible() failed
  567 |       await declineNoti.click();
  568 |       await pageAman.waitForTimeout(1000);
  569 | 
  570 |       // Verify Sent Requests tab is empty (Aman doesn't see Neha's card in Interests Sent anymore)
  571 |       const sentRequestsTabBtn = pageAman.locator('button:has-text("Sent Requests")');
  572 |       await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
  573 |       await sentRequestsTabBtn.click();
  574 |       await pageAman.waitForTimeout(1500);
  575 | 
  576 |       // Assert Neha Shah is not visible in Interests Sent
  577 |       await expect(pageAman.locator(`text=${girlName}`)).not.toBeVisible({ timeout: 2000 });
  578 |     });
  579 | 
  580 |     // 8. Send Interest Again & Accept Interest (Prepare for marriage proposal rejection)
  581 |     await test.step("Aman Sends Interest Again & Neha Approves", async () => {
  582 |       // Go to Search, find Neha, and click Interest again
  583 |       await pageAman.goto("/dashboard?tab=search");
  584 |       await pageAman.waitForTimeout(2050);
  585 |       const searchInput = pageAman.locator('input[type="text"]');
  586 |       await searchInput.fill(girlName);
  587 |       await pageAman.waitForTimeout(2050);
  588 | 
  589 |       const sendInterestBtn = pageAman.locator('button').filter({ hasText: /^Interest$/ }).first();
  590 |       await expect(sendInterestBtn).toBeVisible({ timeout: 5000 });
  591 |       await sendInterestBtn.click();
  592 |       await expect(pageAman.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 5000 });
  593 | 
  594 |       // Go to Interests, approve Aman on Nisha's page directly
  595 |       await pageNeha.goto("/dashboard?tab=interests");
  596 |       await pageNeha.waitForTimeout(2000);
  597 | 
  598 |       // Assert: Marriage Requests sub-tab should not be visible before interest is approved
  599 |       await expect(pageNeha.locator('button:has-text("Marriage Requests")')).not.toBeVisible();
  600 | 
  601 |       const approveBtn = pageNeha.locator('button:has-text("Approve")').first();
  602 |       await expect(approveBtn).toBeVisible({ timeout: 10000 });
  603 |       await approveBtn.click();
  604 |       await expect(approveBtn).not.toBeVisible({ timeout: 5000 });
  605 | 
  606 |       // Assert: Marriage Requests sub-tab is now visible after interest acceptance
  607 |       await expect(pageNeha.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });
  608 |     });
  609 | 
  610 |     // 9. Aman Sends Marriage Proposal
  611 |     await test.step("Aman Sends Marriage Proposal to Nisha", async () => {
  612 |       // Go to Aman's Interests tab directly
  613 |       await pageAman.goto("/dashboard?tab=interests");
  614 |       await pageAman.waitForTimeout(2000);
  615 |       const sentRequestsTabBtn = pageAman.locator('button:has-text("Sent Requests")');
  616 |       await sentRequestsTabBtn.click();
  617 |       await pageAman.waitForTimeout(1000);
  618 | 
  619 |       const nehaCardImage = pageAman.locator(`img[alt="${girlName}"]`);
  620 |       await expect(nehaCardImage).toBeVisible({ timeout: 5000 });
  621 |       await nehaCardImage.click({ force: true });
  622 |       await pageAman.waitForTimeout(2000);
  623 | 
  624 |       // Send Marriage Proposal
  625 |       const letsGetMarriedBtn = pageAman.locator('button:has-text("Let\'s Get Married!")');
  626 |       await expect(letsGetMarriedBtn).toBeVisible({ timeout: 5000 });
  627 |       await letsGetMarriedBtn.click();
  628 | 
  629 |       await pageAman.fill('input[type="date"]', "2027-12-25");
  630 |       await pageAman.fill('input[type="time"]', "18:00");
  631 |       await pageAman.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");
  632 |       await pageAman.click('button:has-text("Send Marriage Request")');
  633 |       await pageAman.waitForTimeout(2500);
  634 |     });
  635 | 
  636 |     // 10. Nisha Declines Marriage Proposal
  637 |     await test.step("Nisha Declines Marriage Proposal & Verifies Reset", async () => {
  638 |       // Go to Nisha's dashboard directly
  639 |       await pageNeha.goto("/dashboard");
  640 | 
  641 |       // Open Notifications and click proposal notification
  642 |       await pageNeha.locator('button[aria-label="Notifications"]').click();
  643 |       await pageNeha.waitForTimeout(1000);
  644 |       const proposalNoti = pageNeha.locator(`text=${boyName} proposed a marriage setup!`);
  645 |       await expect(proposalNoti).toBeVisible({ timeout: 5000 });
  646 |       await proposalNoti.click();
  647 |       await pageNeha.waitForTimeout(2000);
  648 | 
  649 |       // Go to Interests -> Marriage Requests sub-tab
  650 |       const marriageReqTabBtn = pageNeha.locator('button:has-text("Marriage Requests")');
  651 |       await expect(marriageReqTabBtn).toBeVisible({ timeout: 5000 });
  652 |       await marriageReqTabBtn.click();
  653 |       await pageNeha.waitForTimeout(1000);
  654 | 
  655 |       // Decline proposal
  656 |       const declineProposalBtn = pageNeha.locator('button:has-text("Decline")').first();
  657 |       await expect(declineProposalBtn).toBeVisible({ timeout: 5000 });
  658 |       await declineProposalBtn.click();
  659 |       await expect(declineProposalBtn).not.toBeVisible({ timeout: 5000 });
  660 |       await pageNeha.waitForTimeout(1500);
  661 | 
  662 |       // Assert: Marriage Requests sub-tab is now hidden because interest was also deleted
  663 |       await expect(pageNeha.locator('button:has-text("Marriage Requests")')).not.toBeVisible({ timeout: 5000 });
  664 | 
  665 |       // Assert that Interests tab is empty and connection is cleared
  666 |       await pageNeha.goto("/dashboard?tab=interests");
```
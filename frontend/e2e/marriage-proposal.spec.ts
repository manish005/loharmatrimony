import { test, expect } from "@playwright/test";
import { randomBytes } from "crypto";

const rand = () => randomBytes(4).toString("hex");
const randomEmail = () => `test_marriage_${rand()}@example.com`;

async function completeOnboarding(page: any, name: string) {
  const wizard = page.locator('div.fixed').filter({ hasText: "Complete Your Profile" });

  // Step 1: Address Info
  await wizard.locator('textarea[name="currentAddress"]').waitFor({ state: "visible", timeout: 15000 });
  await wizard.locator('textarea[name="currentAddress"]').fill("Andheri West, Mumbai");
  await wizard.locator('textarea[name="permanentAddress"]').fill("Andheri West, Mumbai");
  await wizard.locator('input[name="city"]').fill("Mumbai");
  await wizard.locator('input[name="state"]').fill("Maharashtra");
  await wizard.locator('button:has-text("Next")').click();
  await page.waitForTimeout(500);

  // Step 2: Horoscope Info
  await wizard.locator('input[name="rashi"]').waitFor({ state: "visible", timeout: 10000 });
  await wizard.locator('input[name="rashi"]').fill("Mesh");
  await wizard.locator('input[name="nakshatra"]').fill("Ashwini");
  await wizard.locator('select[name="manglik"]').selectOption("No");
  await wizard.locator('input[name="birthTime"]').fill("12:00");
  await wizard.locator("select").nth(1).selectOption("India");
  await page.waitForTimeout(300);
  await wizard.locator("select").nth(2).selectOption("Maharashtra");
  await page.waitForTimeout(300);
  await wizard.locator("select").nth(3).selectOption("Mumbai Suburban");
  await page.waitForTimeout(300);
  await wizard.locator("select").nth(4).selectOption("Andheri");
  await wizard.locator('button:has-text("Next")').click();
  await page.waitForTimeout(500);

  // Step 3: Family Info
  await wizard.locator('input[name="fatherName"]').waitFor({ state: "visible", timeout: 10000 });
  await wizard.locator('input[name="fatherName"]').fill(`Father of ${name}`);
  await wizard.locator('input[name="fatherOccupation"]').fill("Businessman");
  await wizard.locator('input[name="motherName"]').fill(`Mother of ${name}`);
  await wizard.locator('input[name="motherOccupation"]').fill("Homemaker");
  await wizard.locator('input[type="text"]').nth(4).fill(`Sibling of ${name}`);
  await wizard.locator('button:has-text("Next")').click();
  await page.waitForTimeout(500);

  // Step 4: Relatives Info
  await wizard.locator('button:has-text("Add Relative")').waitFor({ state: "visible", timeout: 10000 });
  await wizard.locator('input[type="text"]').first().fill(`Relative of ${name}`);
  await wizard.locator('input[type="text"]').last().fill("Bandra, Mumbai");
  await wizard.locator('button:has-text("Next")').click();
  await page.waitForTimeout(500);

  // Step 5: Lifestyle & Bio
  await wizard.locator('textarea[name="bio"]').waitFor({ state: "visible", timeout: 10000 });
  await wizard.locator('textarea[name="bio"]').fill(`I am ${name}, looking for a suitable life partner.`);
  await wizard.locator('textarea[name="partnerPreferencesBio"]').fill("Looking for an educated and caring partner.");
  await wizard.locator('select[name="drinkingHabits"]').selectOption("No");
  await wizard.locator('select[name="smokingHabits"]').selectOption("No");
  await wizard.locator('button:has-text("Submit Details")').click();
  await page.waitForTimeout(2000);
}

test.describe("Marriage Proposal E2E Flow", () => {
  const password = "Test@123!!";
  let maleEmail: string;
  let femaleEmail: string;
  let maleName: string;
  let femaleName: string;
  let suffix: string;

  test.beforeAll(() => {
    maleEmail = randomEmail();
    femaleEmail = randomEmail();
    suffix = rand();
    maleName = `Raj Sharma${suffix}`;
    femaleName = `Priya Patil${suffix}`;
  });

  test("Register, Seed, Mutual Interest, and Send & Accept Marriage Proposal", async ({ browser }) => {
    // Open separate browser contexts for Raj and Priya
    const contextRaj = await browser.newContext();
    const pageRaj = await contextRaj.newPage();

    const contextPriya = await browser.newContext();
    const pagePriya = await contextPriya.newPage();

    // ── STEP 1: Register User A (Male: Raj) ─────────────────────────────
    await test.step("Register Male User (Raj)", async () => {
      await pageRaj.goto("/register");
      await pageRaj.waitForSelector('input[name="firstName"]', { timeout: 10000 });
      await pageRaj.fill('input[name="firstName"]', "Raj");
      await pageRaj.fill('input[name="lastName"]', `Sharma${suffix}`);
      await pageRaj.selectOption('select[name="gender"]', "Male");
      await pageRaj.fill('input[name="dob"]', "1994-08-15");
      await pageRaj.fill('input[name="mobile"]', "9876543210");
      await pageRaj.fill('input[name="email"]', maleEmail);
      await pageRaj.fill('input[name="password"]', password);
      await pageRaj.fill('input[name="confirmPassword"]', password);
      await pageRaj.click('button:has-text("Continue")');
      await pageRaj.waitForTimeout(1000);

      await pageRaj.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
      await pageRaj.selectOption('select[name="subCaste"]', "Panchal");
      await pageRaj.click('button:has-text("Continue")');
      await pageRaj.waitForTimeout(1000);

      await pageRaj.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
      await pageRaj.fill('input[name="aadhaarNumber"]', "123456789012");
      await pageRaj.check('input[id="termsAccepted"]');
      
      pageRaj.once("dialog", async (dialog) => await dialog.accept());
      await pageRaj.click('button[type="submit"]');
      await pageRaj.waitForURL("**/dashboard", { timeout: 20000 });
      await pageRaj.waitForTimeout(2000);
      await completeOnboarding(pageRaj, maleName);
    });

    // ── STEP 2: Seed Male Profile Details ─────────────────────────────
    await test.step("Seed Male Profile (Raj) via Firestore Helpers", async () => {
      await pageRaj.evaluate(async ({ email, profileData }) => {
        const { collection, query, where, getDocs, doc, updateDoc } = (window as any).firestoreHelpers;
        const db = (window as any).firebaseDb;
        const q = query(collection(db, "profiles"), where("email", "==", email));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          throw new Error(`Profile document not found for email: ${email}`);
        }
        const profileDocId = snapshot.docs[0].id;
        const ref = doc(db, "profiles", profileDocId);
        await updateDoc(ref, profileData);
      }, {
        email: maleEmail,
        profileData: {
          name: maleName,
          firstName: "Raj",
          lastName: `Sharma${suffix}`,
          state: "Maharashtra",
          city: "Mumbai",
          district: "Mumbai Suburban",
          address: "Andheri West",
          familyDetails: "Nuclear family with traditional values.",
          fatherOccupation: "Businessman",
          motherOccupation: "Homemaker",
          siblings: "1 Brother",
          photos: [
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
          ],
          photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
          isVerified: true,
          isPremium: true,
          occupation: "Software Engineer",
          education: "M.Tech in Computer Science",
          income: "₹15 Lakh - ₹20 Lakh",
          height: "5'11\"",
          weight: "75 kg",
          lifestyle: "Moderate",
          foodPreference: "Vegetarian",
          smoking: "No",
          drinking: "No",
          hobbies: "Reading, Traveling"
        }
      });
      await pageRaj.waitForTimeout(1000);
    });

    // ── STEP 3: Register User B (Female: Priya) ─────────────────────────
    await test.step("Register Female User (Priya)", async () => {
      await pagePriya.goto("/register");
      await pagePriya.waitForSelector('input[name="firstName"]', { timeout: 10000 });
      await pagePriya.fill('input[name="firstName"]', "Priya");
      await pagePriya.fill('input[name="lastName"]', `Patil${suffix}`);
      await pagePriya.selectOption('select[name="gender"]', "Female");
      await pagePriya.fill('input[name="dob"]', "1996-03-10");
      await pagePriya.fill('input[name="mobile"]', "9876543211");
      await pagePriya.fill('input[name="email"]', femaleEmail);
      await pagePriya.fill('input[name="password"]', password);
      await pagePriya.fill('input[name="confirmPassword"]', password);
      await pagePriya.click('button:has-text("Continue")');
      await pagePriya.waitForTimeout(1000);

      await pagePriya.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
      await pagePriya.selectOption('select[name="subCaste"]', "Gadi Lohar");
      await pagePriya.click('button:has-text("Continue")');
      await pagePriya.waitForTimeout(1000);

      await pagePriya.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
      await pagePriya.fill('input[name="aadhaarNumber"]', "123456789013");
      await pagePriya.check('input[id="termsAccepted"]');
      
      pagePriya.once("dialog", async (dialog) => await dialog.accept());
      await pagePriya.click('button[type="submit"]');
      await pagePriya.waitForURL("**/dashboard", { timeout: 20000 });
      await pagePriya.waitForTimeout(2000);
      await completeOnboarding(pagePriya, femaleName);
    });

    // ── STEP 4: Seed Female Profile Details ───────────────────────────
    await test.step("Seed Female Profile (Priya) via Firestore Helpers", async () => {
      await pagePriya.evaluate(async ({ email, profileData }) => {
        const { collection, query, where, getDocs, doc, updateDoc } = (window as any).firestoreHelpers;
        const db = (window as any).firebaseDb;
        const q = query(collection(db, "profiles"), where("email", "==", email));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          throw new Error(`Profile document not found for email: ${email}`);
        }
        const profileDocId = snapshot.docs[0].id;
        const ref = doc(db, "profiles", profileDocId);
        await updateDoc(ref, profileData);
      }, {
        email: femaleEmail,
        profileData: {
          name: femaleName,
          firstName: "Priya",
          lastName: `Patil${suffix}`,
          state: "Maharashtra",
          city: "Mumbai",
          district: "Mumbai Suburban",
          address: "Bandra East",
          familyDetails: "Joint family.",
          fatherOccupation: "Government Employee",
          motherOccupation: "Homemaker",
          siblings: "1 Sister",
          photos: [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop"
          ],
          photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
          isVerified: true,
          isPremium: true,
          occupation: "Financial Analyst",
          education: "MBA in Finance",
          income: "₹10 Lakh - ₹12 Lakh",
          height: "5'4\"",
          weight: "58 kg",
          lifestyle: "Modern",
          foodPreference: "Vegetarian",
          smoking: "No",
          drinking: "Occasionally",
          hobbies: "Dancing, Cooking",
          subCaste: "Deshmukh"
        }
      });
      await pagePriya.waitForTimeout(2000);
    });

    // ── STEP 5: Send Interest from Priya (Female) to Raj (Male) ────────
    await test.step("Send Interest to Raj Sharma", async () => {
      // Go to Advanced Search Tab
      await pagePriya.goto("/dashboard?tab=search");
      await pagePriya.waitForTimeout(2050);

      // Search specifically for the unique male name
      const searchInput = pagePriya.locator('input[type="text"]');
      await searchInput.fill(maleName);
      await pagePriya.waitForTimeout(2050);

      // Click "Interest" on Raj's card
      const sendInterestBtn = pagePriya.locator('button').filter({ hasText: /^Interest$/ }).first();
      await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
      await sendInterestBtn.click();
      
      // Wait for button state to update to "Sent"
      await expect(pagePriya.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
      await pagePriya.waitForTimeout(1000);
    });

    // ── STEP 6: Approve Interest as Raj ───────────────────────────────
    await test.step("Approve Priya's Interest as Raj", async () => {
      // Go to Raj's Interests tab directly to fetch newly registered Priya's profile
      await pageRaj.goto("/dashboard?tab=interests");
      await pageRaj.waitForTimeout(2000);

      // Assert: Marriage Requests sub-tab should not be visible before interest is approved
      await expect(pageRaj.locator('button:has-text("Marriage Requests")')).not.toBeVisible();

      // Accept Priya Patil's interest request
      const approveBtn = pageRaj.locator('button:has-text("Approve")').first();
      await expect(approveBtn).toBeVisible({ timeout: 10000 });
      await approveBtn.click();

      // Wait for the Approve button to disappear, meaning it was processed
      await expect(approveBtn).not.toBeVisible({ timeout: 10000 });
      await pageRaj.waitForTimeout(1000);

      // Assert: Marriage Requests tab is now visible after interest acceptance
      await expect(pageRaj.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });
    });

    // ── STEP 7: Send Marriage Proposal from Priya to Raj ────────────────
    await test.step("Priya Sends Marriage Proposal to Raj", async () => {
      // Go to Priya's Interests tab directly to fetch accepted connection state
      await pagePriya.goto("/dashboard?tab=interests");
      await pagePriya.waitForTimeout(2000);

      // Click on "Sent Requests" sub-tab
      const sentRequestsTabBtn = pagePriya.locator('button:has-text("Sent Requests")');
      await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
      await sentRequestsTabBtn.click();
      await pagePriya.waitForTimeout(1000);

      // Assert: Marriage Requests tab is visible to Priya
      await expect(pagePriya.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });

      // Click on Raj's card image to redirect to his profile view
      const rajCardImage = pagePriya.locator(`img[alt="${maleName}"]`);
      await expect(rajCardImage).toBeVisible({ timeout: 5000 });
      await rajCardImage.click({ force: true });
      await pagePriya.waitForTimeout(2000);

      // Verify URL redirect to view-profile tab
      await expect(pagePriya.url()).toContain("tab=view-profile");

      // Verify the "Let's Get Married!" button is visible and click it
      const letsGetMarriedBtn = pagePriya.locator('button:has-text("Let\'s Get Married!")');
      await expect(letsGetMarriedBtn).toBeVisible({ timeout: 10000 });
      await letsGetMarriedBtn.click();

      // In Marriage Proposal Modal, fill out details:
      await pagePriya.fill('input[type="date"]', "2027-12-25");
      await pagePriya.fill('input[type="time"]', "18:00");
      await pagePriya.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");

      // Click "Send Marriage Request"
      await pagePriya.click('button:has-text("Send Marriage Request")');
      await pagePriya.waitForTimeout(2500);
    });

    // ── STEP 8: Accept Proposal as Raj ─────────────────────────────────
    await test.step("Accept Proposal as Raj", async () => {
      // Go to Raj's dashboard to fetch newly created marriage request
      await pageRaj.goto("/dashboard");

      // Open Notification dropdown and click on the proposal notification
      const notificationBell = pageRaj.locator('button[aria-label="Notifications"]');
      await expect(notificationBell).toBeVisible({ timeout: 5000 });
      await notificationBell.click();
      await pageRaj.waitForTimeout(1000);

      const proposalNotification = pageRaj.locator(`text=${femaleName} proposed a marriage setup!`);
      await expect(proposalNotification).toBeVisible({ timeout: 5000 });
      await proposalNotification.click();
      await pageRaj.waitForTimeout(2000);

      // Verify we are on Interests tab -> Marriage Requests sub-tab
      const marriageReqTabBtn = pageRaj.locator('button:has-text("Marriage Requests")');
      await expect(marriageReqTabBtn).toBeVisible({ timeout: 5000 });
      await marriageReqTabBtn.click();
      await pageRaj.waitForTimeout(1000);

      // Find the pending proposal Accept button and click it
      const acceptProposalBtn = pageRaj.locator('button:has-text("Accept")').first();
      await expect(acceptProposalBtn).toBeVisible({ timeout: 5000 });
      await acceptProposalBtn.click();
      
      // Wait for updates & celebration animation
      await pageRaj.waitForTimeout(3000);

      // We should be redirected to the "Success Stories" tab
      await expect(pageRaj.url()).toContain("tab=stories");
    });

    // ── STEP 9: Verify UI Banners ─────────────────────────────────────
    await test.step("Verify Partner UI Banner displays Marriage Fixed & Verify notifications", async () => {
      // Navigate to My Profile tab to verify partner banner
      await pageRaj.goto("/dashboard?tab=my-profile");
      await pageRaj.waitForTimeout(2000);

      const partnerNameLabel = pageRaj.locator(`text=${femaleName}`);
      await expect(partnerNameLabel).toBeVisible({ timeout: 5000 });

      const bannerStatus = pageRaj.locator('button:has-text("Marriage Fixed")');
      await expect(bannerStatus).toBeVisible({ timeout: 5000 });

      // Go to Priya's dashboard to fetch updated profile state with banner
      await pagePriya.goto("/dashboard");

      // Open notifications dropdown on Priya's page
      await pagePriya.locator('button[aria-label="Notifications"]').click();
      await pagePriya.waitForTimeout(1000);

      // Assert notification of acceptance in bell
      const acceptedNotification = pagePriya.locator(`text=${maleName} accepted your marriage proposal! Congratulations!`);
      await expect(acceptedNotification).toBeVisible({ timeout: 5000 });
    });

    await contextRaj.close();
    await contextPriya.close();
  });

  test("Interest Rejection and Marriage Proposal Rejection Connection Reset Flow", async ({ browser }) => {
    // Open separate browser contexts for Aman and Neha
    const contextAman = await browser.newContext();
    const pageAman = await contextAman.newPage();

    const contextNeha = await browser.newContext();
    const pageNeha = await contextNeha.newPage();

    let boyEmail = `boy_${rand()}@example.com`;
    let girlEmail = `girl_${rand()}@example.com`;
    let bSuffix = rand();
    let boyName = `Aman Sen${bSuffix}`;
    let girlName = `Nisha Shah${bSuffix}`;

    // 1. Register Boy (Aman)
    await test.step("Register Boy (Aman)", async () => {
      await pageAman.goto("/register");
      await pageAman.waitForSelector('input[name="firstName"]', { timeout: 10000 });
      await pageAman.fill('input[name="firstName"]', "Aman");
      await pageAman.fill('input[name="lastName"]', `Sen${bSuffix}`);
      await pageAman.selectOption('select[name="gender"]', "Male");
      await pageAman.fill('input[name="dob"]', "1993-05-12");
      await pageAman.fill('input[name="mobile"]', "9123456780");
      await pageAman.fill('input[name="email"]', boyEmail);
      await pageAman.fill('input[name="password"]', password);
      await pageAman.fill('input[name="confirmPassword"]', password);
      await pageAman.click('button:has-text("Continue")');
      await pageAman.waitForTimeout(1000);

      await pageAman.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
      await pageAman.selectOption('select[name="subCaste"]', "Panchal");
      await pageAman.click('button:has-text("Continue")');
      await pageAman.waitForTimeout(1000);

      await pageAman.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
      await pageAman.fill('input[name="aadhaarNumber"]', "123456789014");
      await pageAman.check('input[id="termsAccepted"]');
      pageAman.once("dialog", async (dialog) => await dialog.accept());
      await pageAman.click('button[type="submit"]');
      await pageAman.waitForURL("**/dashboard", { timeout: 20000 });
      await pageAman.waitForTimeout(2000);
      await completeOnboarding(pageAman, boyName);
    });

    // 2. Seed Boy details
    await test.step("Seed Boy Profile (Aman)", async () => {
      await pageAman.evaluate(async ({ email, profileData }) => {
        const { collection, query, where, getDocs, doc, updateDoc } = (window as any).firestoreHelpers;
        const db = (window as any).firebaseDb;
        const q = query(collection(db, "profiles"), where("email", "==", email));
        const snapshot = await getDocs(q);
        if (snapshot.empty) throw new Error("Aman not found");
        const ref = doc(db, "profiles", snapshot.docs[0].id);
        await updateDoc(ref, profileData);
      }, {
        email: boyEmail,
        profileData: {
          name: boyName,
          firstName: "Aman",
          lastName: `Sen${bSuffix}`,
          state: "Maharashtra",
          city: "Mumbai",
          district: "Mumbai Suburban",
          isVerified: true,
          isPremium: true,
          photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
        }
      });
      await pageAman.waitForTimeout(1000);
    });

    // 3. Register Girl (Nisha)
    await test.step("Register Girl (Nisha)", async () => {
      await pageNeha.goto("/register");
      await pageNeha.waitForSelector('input[name="firstName"]', { timeout: 10000 });
      await pageNeha.fill('input[name="firstName"]', "Nisha");
      await pageNeha.fill('input[name="lastName"]', `Shah${bSuffix}`);
      await pageNeha.selectOption('select[name="gender"]', "Female");
      await pageNeha.fill('input[name="dob"]', "1995-10-20");
      await pageNeha.fill('input[name="mobile"]', "9123456781");
      await pageNeha.fill('input[name="email"]', girlEmail);
      await pageNeha.fill('input[name="password"]', password);
      await pageNeha.fill('input[name="confirmPassword"]', password);
      await pageNeha.click('button:has-text("Continue")');
      await pageNeha.waitForTimeout(1000);

      await pageNeha.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
      await pageNeha.selectOption('select[name="subCaste"]', "Gadi Lohar");
      await pageNeha.click('button:has-text("Continue")');
      await pageNeha.waitForTimeout(1000);

      await pageNeha.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
      await pageNeha.fill('input[name="aadhaarNumber"]', "123456789015");
      await pageNeha.check('input[id="termsAccepted"]');
      pageNeha.once("dialog", async (dialog) => await dialog.accept());
      await pageNeha.click('button[type="submit"]');
      await pageNeha.waitForURL("**/dashboard", { timeout: 20000 });
      await pageNeha.waitForTimeout(2000);
      await completeOnboarding(pageNeha, girlName);
    });

    // 4. Seed Girl Profile (Nisha)
    await test.step("Seed Girl Profile (Nisha)", async () => {
      await pageNeha.evaluate(async ({ email, profileData }) => {
        const { collection, query, where, getDocs, doc, updateDoc } = (window as any).firestoreHelpers;
        const db = (window as any).firebaseDb;
        const q = query(collection(db, "profiles"), where("email", "==", email));
        const snapshot = await getDocs(q);
        if (snapshot.empty) throw new Error("Nisha not found");
        const ref = doc(db, "profiles", snapshot.docs[0].id);
        await updateDoc(ref, profileData);
      }, {
        email: girlEmail,
        profileData: {
          name: girlName,
          firstName: "Nisha",
          lastName: `Shah${bSuffix}`,
          state: "Maharashtra",
          city: "Mumbai",
          district: "Mumbai Suburban",
          isVerified: true,
          isPremium: true,
          photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
        }
      });
      await pageNeha.waitForTimeout(1000);
    });

    // 5. Aman Sends Interest to Nisha
    await test.step("Aman Sends Interest to Nisha", async () => {
      // Search for Nisha directly
      await pageAman.goto("/dashboard?tab=search");
      await pageAman.waitForTimeout(2050);
      const searchInput = pageAman.locator('input[type="text"]');
      await searchInput.fill(girlName);
      await pageAman.waitForTimeout(2050);

      // Click Interest
      const sendInterestBtn = pageAman.locator('button').filter({ hasText: /^Interest$/ }).first();
      await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
      await sendInterestBtn.click();
      await expect(pageAman.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
    });

    // 6. Nisha Declines Aman's Interest (Rejection Flow)
    await test.step("Nisha Declines Aman's Interest", async () => {
      // Go to Nisha's Interests tab directly
      await pageNeha.goto("/dashboard?tab=interests");
      await pageNeha.waitForTimeout(2000);

      // Assert: Marriage Requests sub-tab should not be visible before interest is approved
      await expect(pageNeha.locator('button:has-text("Marriage Requests")')).not.toBeVisible();

      // Reject connection
      const rejectBtn = pageNeha.locator('button:has-text("Reject")').first();
      await expect(rejectBtn).toBeVisible({ timeout: 10000 });
      await rejectBtn.click();
      await expect(rejectBtn).not.toBeVisible({ timeout: 10000 });
    });

    // 7. Aman Verifies Interest Rejection Reset
    await test.step("Aman Verifies Interest Rejection Reset", async () => {
      // Go to Aman's dashboard directly
      await pageAman.goto("/dashboard");

      // Check notification bell for rejection
      await pageAman.locator('button[aria-label="Notifications"]').click();
      await pageAman.waitForTimeout(1000);
      const declineNoti = pageAman.locator(`text=${girlName} respectfully declined your interest.`);
      await expect(declineNoti).toBeVisible({ timeout: 5000 });
      await declineNoti.click();
      await pageAman.waitForTimeout(1000);

      // Verify Sent Requests tab is empty (Aman doesn't see Neha's card in Interests Sent anymore)
      const sentRequestsTabBtn = pageAman.locator('button:has-text("Sent Requests")');
      await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
      await sentRequestsTabBtn.click();
      await pageAman.waitForTimeout(1500);

      // Assert Neha Shah is not visible in Interests Sent
      await expect(pageAman.locator(`text=${girlName}`)).not.toBeVisible({ timeout: 2000 });
    });

    // 8. Send Interest Again & Accept Interest (Prepare for marriage proposal rejection)
    await test.step("Aman Sends Interest Again & Neha Approves", async () => {
      // Go to Search, find Neha, and click Interest again
      await pageAman.goto("/dashboard?tab=search");
      await pageAman.waitForTimeout(2050);
      const searchInput = pageAman.locator('input[type="text"]');
      await searchInput.fill(girlName);
      await pageAman.waitForTimeout(2050);

      const sendInterestBtn = pageAman.locator('button').filter({ hasText: /^Interest$/ }).first();
      await expect(sendInterestBtn).toBeVisible({ timeout: 5000 });
      await sendInterestBtn.click();
      await expect(pageAman.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 5000 });

      // Go to Interests, approve Aman on Nisha's page directly
      await pageNeha.goto("/dashboard?tab=interests");
      await pageNeha.waitForTimeout(2000);

      // Assert: Marriage Requests sub-tab should not be visible before interest is approved
      await expect(pageNeha.locator('button:has-text("Marriage Requests")')).not.toBeVisible();

      const approveBtn = pageNeha.locator('button:has-text("Approve")').first();
      await expect(approveBtn).toBeVisible({ timeout: 10000 });
      await approveBtn.click();
      await expect(approveBtn).not.toBeVisible({ timeout: 5000 });

      // Assert: Marriage Requests sub-tab is now visible after interest acceptance
      await expect(pageNeha.locator('button:has-text("Marriage Requests")')).toBeVisible({ timeout: 5000 });
    });

    // 9. Aman Sends Marriage Proposal
    await test.step("Aman Sends Marriage Proposal to Nisha", async () => {
      // Go to Aman's Interests tab directly
      await pageAman.goto("/dashboard?tab=interests");
      await pageAman.waitForTimeout(2000);
      const sentRequestsTabBtn = pageAman.locator('button:has-text("Sent Requests")');
      await sentRequestsTabBtn.click();
      await pageAman.waitForTimeout(1000);

      const nehaCardImage = pageAman.locator(`img[alt="${girlName}"]`);
      await expect(nehaCardImage).toBeVisible({ timeout: 5000 });
      await nehaCardImage.click({ force: true });
      await pageAman.waitForTimeout(2000);

      // Send Marriage Proposal
      const letsGetMarriedBtn = pageAman.locator('button:has-text("Let\'s Get Married!")');
      await expect(letsGetMarriedBtn).toBeVisible({ timeout: 5000 });
      await letsGetMarriedBtn.click();

      await pageAman.fill('input[type="date"]', "2027-12-25");
      await pageAman.fill('input[type="time"]', "18:00");
      await pageAman.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");
      await pageAman.click('button:has-text("Send Marriage Request")');
      await pageAman.waitForTimeout(2500);
    });

    // 10. Nisha Declines Marriage Proposal
    await test.step("Nisha Declines Marriage Proposal & Verifies Reset", async () => {
      // Go to Nisha's dashboard directly
      await pageNeha.goto("/dashboard");

      // Open Notifications and click proposal notification
      await pageNeha.locator('button[aria-label="Notifications"]').click();
      await pageNeha.waitForTimeout(1000);
      const proposalNoti = pageNeha.locator(`text=${boyName} proposed a marriage setup!`);
      await expect(proposalNoti).toBeVisible({ timeout: 5000 });
      await proposalNoti.click();
      await pageNeha.waitForTimeout(2000);

      // Go to Interests -> Marriage Requests sub-tab
      const marriageReqTabBtn = pageNeha.locator('button:has-text("Marriage Requests")');
      await expect(marriageReqTabBtn).toBeVisible({ timeout: 5000 });
      await marriageReqTabBtn.click();
      await pageNeha.waitForTimeout(1000);

      // Decline proposal
      const declineProposalBtn = pageNeha.locator('button:has-text("Decline")').first();
      await expect(declineProposalBtn).toBeVisible({ timeout: 5000 });
      await declineProposalBtn.click();
      await expect(declineProposalBtn).not.toBeVisible({ timeout: 5000 });
      await pageNeha.waitForTimeout(1500);

      // Assert: Marriage Requests sub-tab is now hidden because interest was also deleted
      await expect(pageNeha.locator('button:has-text("Marriage Requests")')).not.toBeVisible({ timeout: 5000 });

      // Assert that Interests tab is empty and connection is cleared
      await pageNeha.goto("/dashboard?tab=interests");
      await pageNeha.waitForTimeout(1500);
      await expect(pageNeha.locator(`text=${boyName}`)).not.toBeVisible({ timeout: 2000 });
    });

    // 11. Aman Verifies Marriage Proposal Decline Notification and Connection Reset
    await test.step("Aman Verifies Marriage Rejection Reset", async () => {
      // Go to Aman's dashboard directly
      await pageAman.goto("/dashboard");

      // Check notification bell for marriage rejection
      await pageAman.locator('button[aria-label="Notifications"]').click();
      await pageAman.waitForTimeout(1000);
      const declineMarriageNoti = pageAman.locator(`text=${girlName} declined your marriage proposal.`);
      await expect(declineMarriageNoti).toBeVisible({ timeout: 5000 });
      await declineMarriageNoti.click();
      await pageAman.waitForTimeout(1500);

      // Assert: Marriage Requests sub-tab should not be visible for Aman
      await expect(pageAman.locator('button:has-text("Marriage Requests")')).not.toBeVisible();

      // Assert Aman's Interests Sent page is empty for Neha
      await pageAman.goto("/dashboard?tab=interests");
      await pageAman.waitForTimeout(1000);
      const sentRequestsTabBtn = pageAman.locator('button:has-text("Sent Requests")');
      await sentRequestsTabBtn.click();
      await pageAman.waitForTimeout(1500);
      await expect(pageAman.locator(`text=${girlName}`)).not.toBeVisible({ timeout: 2000 });
    });

    await contextAman.close();
    await contextNeha.close();
  });
});

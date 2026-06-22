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
  await wizard.locator('input[type="text"]').first().waitFor({ state: "visible", timeout: 10000 });
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

  test("Register, Seed, Mutual Interest, and Send & Accept Marriage Proposal", async ({ page }) => {
    // ── STEP 1: Register User A (Male) ─────────────────────────────────
    await test.step("Register Male User (Raj)", async () => {
      await page.goto("/register");
      await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
      await page.fill('input[name="firstName"]', "Raj");
      await page.fill('input[name="lastName"]', `Sharma${suffix}`);
      await page.selectOption('select[name="gender"]', "Male");
      await page.fill('input[name="dob"]', "1994-08-15");
      await page.fill('input[name="mobile"]', "9876543210");
      await page.fill('input[name="email"]', maleEmail);
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="confirmPassword"]', password);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      await page.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
      await page.selectOption('select[name="subCaste"]', "Panchal");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      await page.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
      await page.fill('input[name="aadhaarNumber"]', "123456789012");
      await page.check('input[id="termsAccepted"]');
      
      // Accept confirmation dialog
      page.once("dialog", async (dialog) => await dialog.accept());
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);
      await completeOnboarding(page, maleName);
    });

    // ── STEP 2: Seed Male Profile Details ─────────────────────────────
    await test.step("Seed Male Profile (Raj) via Firestore Helpers", async () => {
      await page.evaluate(async ({ email, profileData }) => {
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
      await page.waitForTimeout(1000);
    });

    // ── STEP 3: Logout Male User ──────────────────────────────────────
    await test.step("Logout Male User", async () => {
      await page.evaluate(() => {
        (window as any).firebaseAuth.signOut();
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto("/login");
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    });

    // ── STEP 4: Register User B (Female) ───────────────────────────────
    await test.step("Register Female User (Priya)", async () => {
      await page.goto("/register");
      await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
      await page.fill('input[name="firstName"]', "Priya");
      await page.fill('input[name="lastName"]', `Patil${suffix}`);
      await page.selectOption('select[name="gender"]', "Female");
      await page.fill('input[name="dob"]', "1996-03-10");
      await page.fill('input[name="mobile"]', "9876543211");
      await page.fill('input[name="email"]', femaleEmail);
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="confirmPassword"]', password);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      await page.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
      await page.selectOption('select[name="subCaste"]', "Gadi Lohar");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      await page.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
      await page.fill('input[name="aadhaarNumber"]', "123456789013");
      await page.check('input[id="termsAccepted"]');
      
      page.once("dialog", async (dialog) => await dialog.accept());
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);
      await completeOnboarding(page, femaleName);
    });

    // ── STEP 5: Seed Female Profile Details ───────────────────────────
    await test.step("Seed Female Profile (Priya) via Firestore Helpers", async () => {
      await page.evaluate(async ({ email, profileData }) => {
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
          subCaste: "Deshmukh" // Direct override to Deshmukh in seed data
        }
      });
      await page.waitForTimeout(2000);
    });

    // ── STEP 6: Send Interest from Priya (Female) to Raj (Male) ────────
    await test.step("Send Interest to Raj Sharma", async () => {
      // Go to Advanced Search Tab
      await page.goto("/dashboard?tab=search");
      await page.waitForTimeout(2050);

      // Search specifically for the unique male name
      const searchInput = page.locator('input[type="text"]');
      await searchInput.fill(maleName);
      await page.waitForTimeout(2050);

      // Click "Interest" on Raj's card
      const sendInterestBtn = page.locator('button').filter({ hasText: /^Interest$/ }).first();
      await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
      await sendInterestBtn.click();
      
      // Wait for button state to update to "Sent"
      await expect(page.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(1000);
    });

    // ── STEP 7: Logout Female User ────────────────────────────────────
    await test.step("Logout Female User", async () => {
      await page.evaluate(() => {
        (window as any).firebaseAuth.signOut();
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto("/login");
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    });

    // ── STEP 8: Login Male User (Raj) & Approve Interest ──────────────
    await test.step("Login Raj and Approve Priya's Interest", async () => {
      // Login
      await page.fill('input[type="email"]', maleEmail);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);

      // Go to Interests Tab
      await page.goto("/dashboard?tab=interests");
      await page.waitForTimeout(2000);

      // Accept Priya Patil's interest request
      const approveBtn = page.locator('button:has-text("Approve")').first();
      await expect(approveBtn).toBeVisible({ timeout: 10000 });
      await approveBtn.click();

      // Wait for the Approve button to disappear, meaning it was processed
      await expect(approveBtn).not.toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(1000);
    });

    // ── STEP 9: View Priya's Profile & Send Marriage Proposal ─────────
    await test.step("Send Marriage Proposal to Priya", async () => {
      // Go to Interests tab
      await page.goto("/dashboard?tab=interests");
      await page.waitForTimeout(2000);

      // Click on "Sent Requests" sub-tab
      const sentRequestsTabBtn = page.locator('button:has-text("Sent Requests")');
      await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
      await sentRequestsTabBtn.click();
      await page.waitForTimeout(1000);

      // Click on Priya's card image to redirect to her profile view
      const priyaCardImage = page.locator(`img[alt="${femaleName}"]`);
      await expect(priyaCardImage).toBeVisible({ timeout: 5000 });
      await priyaCardImage.click();
      await page.waitForTimeout(2000);

      // Verify URL redirect to view-profile tab
      await expect(page.url()).toContain("tab=view-profile");

      // Verify the "Let's Get Married!" button is visible and click it
      const letsGetMarriedBtn = page.locator('button:has-text("Let\'s Get Married!")');
      await expect(letsGetMarriedBtn).toBeVisible({ timeout: 10000 });
      await letsGetMarriedBtn.click();

      // In Marriage Proposal Modal, fill out details:
      await page.fill('input[type="date"]', "2027-12-25");
      await page.fill('input[type="time"]', "18:00");
      await page.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");

      // Click "Send Marriage Request"
      await page.click('button:has-text("Send Marriage Request")');
      await page.waitForTimeout(2500);
    });

    // ── STEP 10: Logout Male User ────────────────────────────────────
    await test.step("Logout Male User", async () => {
      await page.evaluate(() => {
        (window as any).firebaseAuth.signOut();
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto("/login");
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    });

    // ── STEP 11: Login Female User (Priya) & Accept Proposal ──────────
    await test.step("Login Priya and Accept Proposal", async () => {
      // Login
      await page.fill('input[type="email"]', femaleEmail);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);

      // Open Notification dropdown and click on the proposal notification
      const notificationBell = page.locator('button[aria-label="Notifications"]');
      await expect(notificationBell).toBeVisible({ timeout: 5000 });
      await notificationBell.click();
      await page.waitForTimeout(1000);

      const proposalNotification = page.locator(`text=${maleName} proposed a marriage setup!`);
      await expect(proposalNotification).toBeVisible({ timeout: 5000 });
      await proposalNotification.click();
      await page.waitForTimeout(2000);

      // Verify we are on Interests tab -> Marriage Requests sub-tab
      const marriageReqTabBtn = page.locator('button:has-text("Marriage Requests")');
      await expect(marriageReqTabBtn).toBeVisible({ timeout: 5000 });
      await marriageReqTabBtn.click();
      await page.waitForTimeout(1000);

      // Find the pending proposal Accept button and click it
      const acceptProposalBtn = page.locator('button:has-text("Accept")').first();
      await expect(acceptProposalBtn).toBeVisible({ timeout: 5000 });
      await acceptProposalBtn.click();
      
      // Wait for updates & celebration animation
      await page.waitForTimeout(3000);

      // We should be redirected to the "Success Stories" tab
      await expect(page.url()).toContain("tab=stories");
    });

    // ── STEP 12: Verify UI Banners ────────────────────────────────────
    await test.step("Verify Partner UI Banner displays Marriage Fixed & Verify notifications", async () => {
      // Navigate to My Profile tab to verify partner banner
      await page.goto("/dashboard?tab=my-profile");
      await page.waitForTimeout(2000);

      const partnerNameLabel = page.locator(`text=${maleName}`);
      await expect(partnerNameLabel).toBeVisible({ timeout: 5000 });

      const bannerStatus = page.locator('button:has-text("Marriage Fixed")');
      await expect(bannerStatus).toBeVisible({ timeout: 5000 });

      // Logout Priya
      await page.evaluate(() => {
        (window as any).firebaseAuth.signOut();
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto("/login");

      // Login Raj
      await page.fill('input[type="email"]', maleEmail);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);

      // Open notifications dropdown
      await page.locator('button[aria-label="Notifications"]').click();
      await page.waitForTimeout(1000);

      // Assert notification of acceptance in bell
      const acceptedNotification = page.locator(`text=${femaleName} accepted your marriage proposal! Congratulations!`);
      await expect(acceptedNotification).toBeVisible({ timeout: 5000 });
      await page.locator('body').click(); // close dropdown
      await page.waitForTimeout(500);
    });
  });

  test("Interest Rejection and Marriage Proposal Rejection Connection Reset Flow", async ({ page }) => {
    let boyEmail = `boy_${rand()}@example.com`;
    let girlEmail = `girl_${rand()}@example.com`;
    let bSuffix = rand();
    let boyName = `Aman Sen${bSuffix}`;
    let girlName = `Neha Shah${bSuffix}`;

    // 1. Register Boy
    await test.step("Register Boy (Aman)", async () => {
      await page.goto("/register");
      await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
      await page.fill('input[name="firstName"]', "Aman");
      await page.fill('input[name="lastName"]', `Sen${bSuffix}`);
      await page.selectOption('select[name="gender"]', "Male");
      await page.fill('input[name="dob"]', "1993-05-12");
      await page.fill('input[name="mobile"]', "9123456780");
      await page.fill('input[name="email"]', boyEmail);
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="confirmPassword"]', password);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      await page.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
      await page.selectOption('select[name="subCaste"]', "Panchal");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      await page.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
      await page.fill('input[name="aadhaarNumber"]', "123456789014");
      await page.check('input[id="termsAccepted"]');
      page.once("dialog", async (dialog) => await dialog.accept());
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);
      await completeOnboarding(page, boyName);
    });

    // 2. Seed Boy details
    await test.step("Seed Boy Profile (Aman)", async () => {
      await page.evaluate(async ({ email, profileData }) => {
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
          state: "Maharashtra",
          city: "Mumbai",
          district: "Mumbai Suburban",
          isVerified: true,
          isPremium: true,
          photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
        }
      });
      await page.waitForTimeout(1000);
    });

    // 3. Logout Boy
    await test.step("Logout Aman", async () => {
      await page.evaluate(() => {
        (window as any).firebaseAuth.signOut();
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto("/login");
    });

    // 4. Register Girl
    await test.step("Register Girl (Neha)", async () => {
      await page.goto("/register");
      await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
      await page.fill('input[name="firstName"]', "Neha");
      await page.fill('input[name="lastName"]', `Shah${bSuffix}`);
      await page.selectOption('select[name="gender"]', "Female");
      await page.fill('input[name="dob"]', "1995-10-20");
      await page.fill('input[name="mobile"]', "9123456781");
      await page.fill('input[name="email"]', girlEmail);
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="confirmPassword"]', password);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      await page.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
      await page.selectOption('select[name="subCaste"]', "Gadi Lohar");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      await page.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
      await page.fill('input[name="aadhaarNumber"]', "123456789015");
      await page.check('input[id="termsAccepted"]');
      page.once("dialog", async (dialog) => await dialog.accept());
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);
      await completeOnboarding(page, girlName);
    });

    // 5. Seed Girl details
    await test.step("Seed Girl Profile (Neha)", async () => {
      await page.evaluate(async ({ email, profileData }) => {
        const { collection, query, where, getDocs, doc, updateDoc } = (window as any).firestoreHelpers;
        const db = (window as any).firebaseDb;
        const q = query(collection(db, "profiles"), where("email", "==", email));
        const snapshot = await getDocs(q);
        if (snapshot.empty) throw new Error("Neha not found");
        const ref = doc(db, "profiles", snapshot.docs[0].id);
        await updateDoc(ref, profileData);
      }, {
        email: girlEmail,
        profileData: {
          name: girlName,
          state: "Maharashtra",
          city: "Mumbai",
          district: "Mumbai Suburban",
          isVerified: true,
          isPremium: true,
          photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
        }
      });
      await page.waitForTimeout(1000);
    });

    // 6. Logout Girl
    await test.step("Logout Neha", async () => {
      await page.evaluate(() => {
        (window as any).firebaseAuth.signOut();
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto("/login");
    });

    // 7. Login Boy (Aman) & Send Interest to Neha
    await test.step("Aman Sends Interest to Neha", async () => {
      await page.fill('input[type="email"]', boyEmail);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);

      // Search for Neha
      await page.goto("/dashboard?tab=search");
      await page.waitForTimeout(2050);
      const searchInput = page.locator('input[type="text"]');
      await searchInput.fill(girlName);
      await page.waitForTimeout(2050);

      // Click Interest
      const sendInterestBtn = page.locator('button').filter({ hasText: /^Interest$/ }).first();
      await expect(sendInterestBtn).toBeVisible({ timeout: 10000 });
      await sendInterestBtn.click();
      await expect(page.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
    });

    // 8. Logout Aman
    await test.step("Logout Aman", async () => {
      await page.evaluate(() => {
        (window as any).firebaseAuth.signOut();
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto("/login");
    });

    // 9. Login Neha & Decline Interest (Rejection Flow)
    await test.step("Neha Declines Aman's Interest", async () => {
      await page.fill('input[type="email"]', girlEmail);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);

      // Go to Interests tab
      await page.goto("/dashboard?tab=interests");
      await page.waitForTimeout(2000);

      // Reject connection
      const rejectBtn = page.locator('button:has-text("Reject")').first();
      await expect(rejectBtn).toBeVisible({ timeout: 10000 });
      await rejectBtn.click();
      await expect(rejectBtn).not.toBeVisible({ timeout: 10000 });
    });

    // 10. Logout Neha
    await test.step("Logout Neha", async () => {
      await page.evaluate(() => {
        (window as any).firebaseAuth.signOut();
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto("/login");
    });

    // 11. Login Aman & Verify connection was reset (Aman's Sent tab is empty, receives notification)
    await test.step("Aman Verifies Interest Rejection Reset", async () => {
      await page.fill('input[type="email"]', boyEmail);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);

      // Check notification bell for rejection
      await page.locator('button[aria-label="Notifications"]').click();
      await page.waitForTimeout(1000);
      const declineNoti = page.locator(`text=${girlName} respectfully declined your interest.`);
      await expect(declineNoti).toBeVisible({ timeout: 5000 });
      await declineNoti.click();
      await page.waitForTimeout(1000);

      // Verify Sent Requests tab is empty (Aman doesn't see Neha's card in Interests Sent anymore)
      const sentRequestsTabBtn = page.locator('button:has-text("Sent Requests")');
      await expect(sentRequestsTabBtn).toBeVisible({ timeout: 5000 });
      await sentRequestsTabBtn.click();
      await page.waitForTimeout(1500);

      // Assert Neha Shah is not visible in Interests Sent
      await expect(page.locator(`text=${girlName}`)).not.toBeVisible({ timeout: 2000 });
    });

    // 12. Send Interest Again & Accept Interest (Prepare for marriage proposal rejection)
    await test.step("Aman Sends Interest Again & Neha Approves", async () => {
      // Go to Search, find Neha, and click Interest again
      await page.goto("/dashboard?tab=search");
      await page.waitForTimeout(2050);
      const searchInput = page.locator('input[type="text"]');
      await searchInput.fill(girlName);
      await page.waitForTimeout(2050);

      const sendInterestBtn = page.locator('button').filter({ hasText: /^Interest$/ }).first();
      await expect(sendInterestBtn).toBeVisible({ timeout: 5000 });
      await sendInterestBtn.click();
      await expect(page.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 5000 });

      // Logout Aman
      await page.evaluate(() => {
        (window as any).firebaseAuth.signOut();
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto("/login");

      // Login Neha
      await page.fill('input[type="email"]', girlEmail);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);

      // Go to Interests, approve Aman
      await page.goto("/dashboard?tab=interests");
      await page.waitForTimeout(2000);
      const approveBtn = page.locator('button:has-text("Approve")').first();
      await expect(approveBtn).toBeVisible({ timeout: 10000 });
      await approveBtn.click();
      await expect(approveBtn).not.toBeVisible({ timeout: 5000 });
    });

    // 13. Logout Neha, Login Aman, and Send Marriage Proposal
    await test.step("Aman Sends Marriage Proposal to Neha", async () => {
      // Logout Neha
      await page.evaluate(() => {
        (window as any).firebaseAuth.signOut();
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto("/login");

      // Login Aman
      await page.fill('input[type="email"]', boyEmail);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);

      // Go to Interests tab -> Sent Requests, click Neha's card (Accepted)
      await page.goto("/dashboard?tab=interests");
      await page.waitForTimeout(2000);
      const sentRequestsTabBtn = page.locator('button:has-text("Sent Requests")');
      await sentRequestsTabBtn.click();
      await page.waitForTimeout(1000);

      const nehaCardImage = page.locator(`img[alt="${girlName}"]`);
      await expect(nehaCardImage).toBeVisible({ timeout: 5000 });
      await nehaCardImage.click();
      await page.waitForTimeout(2000);

      // Send Marriage Proposal
      const letsGetMarriedBtn = page.locator('button:has-text("Let\'s Get Married!")');
      await expect(letsGetMarriedBtn).toBeVisible({ timeout: 5000 });
      await letsGetMarriedBtn.click();

      await page.fill('input[type="date"]', "2027-12-25");
      await page.fill('input[type="time"]', "18:00");
      await page.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");
      await page.click('button:has-text("Send Marriage Request")');
      await page.waitForTimeout(2500);
    });

    // 14. Logout Aman, Login Neha, Decline Marriage Proposal
    await test.step("Neha Declines Marriage Proposal & Verifies Reset", async () => {
      // Logout Aman
      await page.evaluate(() => {
        (window as any).firebaseAuth.signOut();
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto("/login");

      // Login Neha
      await page.fill('input[type="email"]', girlEmail);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);

      // Open Notifications and click proposal notification
      await page.locator('button[aria-label="Notifications"]').click();
      await page.waitForTimeout(1000);
      const proposalNoti = page.locator(`text=${boyName} proposed a marriage setup!`);
      await expect(proposalNoti).toBeVisible({ timeout: 5000 });
      await proposalNoti.click();
      await page.waitForTimeout(2000);

      // Go to Interests -> Marriage Requests sub-tab
      const marriageReqTabBtn = page.locator('button:has-text("Marriage Requests")');
      await expect(marriageReqTabBtn).toBeVisible({ timeout: 5000 });
      await marriageReqTabBtn.click();
      await page.waitForTimeout(1000);

      // Decline proposal
      const declineProposalBtn = page.locator('button:has-text("Decline")').first();
      await expect(declineProposalBtn).toBeVisible({ timeout: 5000 });
      await declineProposalBtn.click();
      await expect(declineProposalBtn).not.toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1500);

      // Assert that Interests tab is empty and connection is cleared
      await page.goto("/dashboard?tab=interests");
      await page.waitForTimeout(1500);
      await expect(page.locator(`text=${boyName}`)).not.toBeVisible({ timeout: 2000 });
    });

    // 15. Logout Neha, Login Aman, Verify Marriage Proposal Decline Notification and Connection Reset
    await test.step("Aman Verifies Marriage Rejection Reset", async () => {
      // Logout Neha
      await page.evaluate(() => {
        (window as any).firebaseAuth.signOut();
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto("/login");

      // Login Aman
      await page.fill('input[type="email"]', boyEmail);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await page.waitForTimeout(2000);

      // Check notification bell for marriage rejection
      await page.locator('button[aria-label="Notifications"]').click();
      await page.waitForTimeout(1000);
      const declineMarriageNoti = page.locator(`text=${girlName} declined your marriage proposal.`);
      await expect(declineMarriageNoti).toBeVisible({ timeout: 5000 });
      await declineMarriageNoti.click();
      await page.waitForTimeout(1500);

      // Assert Aman's Interests Sent page is empty for Neha
      await page.goto("/dashboard?tab=interests");
      await page.waitForTimeout(1000);
      const sentRequestsTabBtn = page.locator('button:has-text("Sent Requests")');
      await sentRequestsTabBtn.click();
      await page.waitForTimeout(1500);
      await expect(page.locator(`text=${girlName}`)).not.toBeVisible({ timeout: 2000 });
    });
  });
});

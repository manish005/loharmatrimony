import { test, expect } from "@playwright/test";
import { randomBytes } from "crypto";

const rand = () => randomBytes(4).toString("hex");
const randomEmail = () => `test_marriage_${rand()}@example.com`;

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

      // Locate Raj Sharma's unique profile card
      const rajCard = page.locator("div").filter({ hasText: maleName }).last();
      await expect(rajCard).toBeVisible({ timeout: 10000 });

      // Click "Interest" on Raj's card
      const sendInterestBtn = rajCard.locator('button').filter({ hasText: /^Interest$/ }).first();
      await expect(sendInterestBtn).toBeVisible();
      await sendInterestBtn.click();
      
      // Wait for button state to update to "Sent"
      await expect(rajCard.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
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
      // Go to Advanced Search tab to find Priya
      await page.goto("/dashboard?tab=search");
      await page.waitForTimeout(2050);

      // Search specifically for the unique female name
      const searchInput = page.locator('input[type="text"]');
      await searchInput.fill(femaleName);
      await page.waitForTimeout(2050);

      // Click on Priya Patil's card to open her profile detail view
      const priyaCard = page.locator("div").filter({ hasText: femaleName }).last();
      await expect(priyaCard).toBeVisible({ timeout: 10000 });
      await priyaCard.click();
      await page.waitForTimeout(2000);

      // Verify the "Let's Get Married!" button is visible
      const letsGetMarriedBtn = page.locator('button:has-text("Let\'s Get Married!")');
      await expect(letsGetMarriedBtn).toBeVisible({ timeout: 10000 });
      await letsGetMarriedBtn.click();

      // In Marriage Proposal Modal, fill out details:
      // Proposed Date: future dated (e.g. 2027-12-25)
      await page.fill('input[type="date"]', "2027-12-25");
      await page.fill('input[type="time"]', "18:00");
      await page.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");

      // Click "Send Marriage Request"
      await page.click('button:has-text("Send Marriage Request")');
      
      // Wait for toast success
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

      // Verify marriage proposal notification/card is visible
      // It shows up in Interests tab -> Marriage Requests sub-tab
      await page.goto("/dashboard?tab=interests");
      await page.waitForTimeout(2000);

      // Click Marriage Requests tab inside Interests panel
      const marriageReqTabBtn = page.locator('button:has-text("Marriage Requests")');
      await expect(marriageReqTabBtn).toBeVisible({ timeout: 5000 });
      await marriageReqTabBtn.click();
      await page.waitForTimeout(1000);

      // Find the pending proposal from Raj Sharma
      const proposalCard = page.locator("div").filter({ hasText: maleName }).last();
      await expect(proposalCard).toBeVisible({ timeout: 5000 });

      // Click "Accept"
      const acceptProposalBtn = proposalCard.locator('button:has-text("Accept")');
      await expect(acceptProposalBtn).toBeVisible({ timeout: 5000 });
      await acceptProposalBtn.click();
      
      // Wait for updates & celebration animation
      await page.waitForTimeout(3000);

      // We should be redirected to the "Success Stories" tab
      await expect(page.url()).toContain("tab=stories");
    });

    // ── STEP 12: Verify UI Banners ────────────────────────────────────
    await test.step("Verify Partner UI Banner displays Marriage Fixed", async () => {
      // Navigate to My Profile tab to verify partner banner
      await page.goto("/dashboard?tab=my-profile");
      await page.waitForTimeout(2000);

      // Under the profile details, we should see the partner banner indicating "Marriage Fixed"
      // because weddingDate is 2027-12-25 (future dated)
      const partnerNameLabel = page.locator(`text=${maleName}`);
      await expect(partnerNameLabel).toBeVisible({ timeout: 5000 });

      const bannerStatus = page.locator('button:has-text("Marriage Fixed")');
      await expect(bannerStatus).toBeVisible({ timeout: 5000 });
    });
  });
});

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marriage-proposal.spec.ts >> Marriage Proposal E2E Flow >> Register, Seed, Mutual Interest, and Send & Accept Marriage Proposal
- Location: e2e\marriage-proposal.spec.ts:23:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('div').filter({ hasText: 'Raj Sharmac5276204' }).last().locator('button').filter({ hasText: /^Interest$/ }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('div').filter({ hasText: 'Raj Sharmac5276204' }).last().locator('button').filter({ hasText: /^Interest$/ }).first()

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
      - button "Recommended Profiles 46"
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
    - textbox "Name, job, city...": Raj Sharmac5276204
    - button "More Filters"
    - img "Raj Sharmac5276204"
    - img "Raj Sharmac5276204"
    - img "Raj Sharmac5276204"
    - img "Raj Sharmac5276204"
    - img "Raj Sharmac5276204"
    - button "Shortlist Profile"
    - text: 85% Match
    - heading "Raj Sharmac5276204" [level=4]
    - text: Verified 25 yrs 5'11" Panchal Never Married M.Tech in Computer Science ₹15 Lakh - ₹20 Lakh
    - paragraph: Mumbai, Maharashtra
    - button "Interest"
    - button "Chat"
    - button "Shortlist Profile"
    - text: 80% Match
    - heading "Raj Sharmac5276204" [level=4]
    - text: 25 yrs Panchal Never Married
    - paragraph
    - button "Interest"
    - button "Chat"
```

# Test source

```ts
  117 |     // ── STEP 4: Register User B (Female) ───────────────────────────────
  118 |     await test.step("Register Female User (Priya)", async () => {
  119 |       await page.goto("/register");
  120 |       await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
  121 |       await page.fill('input[name="firstName"]', "Priya");
  122 |       await page.fill('input[name="lastName"]', `Patil${suffix}`);
  123 |       await page.selectOption('select[name="gender"]', "Female");
  124 |       await page.fill('input[name="dob"]', "1996-03-10");
  125 |       await page.fill('input[name="mobile"]', "9876543211");
  126 |       await page.fill('input[name="email"]', femaleEmail);
  127 |       await page.fill('input[name="password"]', password);
  128 |       await page.fill('input[name="confirmPassword"]', password);
  129 |       await page.click('button:has-text("Continue")');
  130 |       await page.waitForTimeout(1000);
  131 | 
  132 |       await page.waitForSelector('select[name="subCaste"]', { timeout: 5000 });
  133 |       await page.selectOption('select[name="subCaste"]', "Gadi Lohar");
  134 |       await page.click('button:has-text("Continue")');
  135 |       await page.waitForTimeout(1000);
  136 | 
  137 |       await page.waitForSelector('input[name="aadhaarNumber"]', { timeout: 5000 });
  138 |       await page.fill('input[name="aadhaarNumber"]', "123456789013");
  139 |       await page.check('input[id="termsAccepted"]');
  140 |       
  141 |       page.once("dialog", async (dialog) => await dialog.accept());
  142 |       await page.click('button[type="submit"]');
  143 |       await page.waitForURL("**/dashboard", { timeout: 20000 });
  144 |       await page.waitForTimeout(2000);
  145 |     });
  146 | 
  147 |     // ── STEP 5: Seed Female Profile Details ───────────────────────────
  148 |     await test.step("Seed Female Profile (Priya) via Firestore Helpers", async () => {
  149 |       await page.evaluate(async ({ email, profileData }) => {
  150 |         const { collection, query, where, getDocs, doc, updateDoc } = (window as any).firestoreHelpers;
  151 |         const db = (window as any).firebaseDb;
  152 |         const q = query(collection(db, "profiles"), where("email", "==", email));
  153 |         const snapshot = await getDocs(q);
  154 |         if (snapshot.empty) {
  155 |           throw new Error(`Profile document not found for email: ${email}`);
  156 |         }
  157 |         const profileDocId = snapshot.docs[0].id;
  158 |         const ref = doc(db, "profiles", profileDocId);
  159 |         await updateDoc(ref, profileData);
  160 |       }, {
  161 |         email: femaleEmail,
  162 |         profileData: {
  163 |           name: femaleName,
  164 |           firstName: "Priya",
  165 |           lastName: `Patil${suffix}`,
  166 |           state: "Maharashtra",
  167 |           city: "Mumbai",
  168 |           district: "Mumbai Suburban",
  169 |           address: "Bandra East",
  170 |           familyDetails: "Joint family.",
  171 |           fatherOccupation: "Government Employee",
  172 |           motherOccupation: "Homemaker",
  173 |           siblings: "1 Sister",
  174 |           photos: [
  175 |             "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  176 |             "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  177 |             "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
  178 |             "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
  179 |             "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop"
  180 |           ],
  181 |           photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  182 |           isVerified: true,
  183 |           isPremium: true,
  184 |           occupation: "Financial Analyst",
  185 |           education: "MBA in Finance",
  186 |           income: "₹10 Lakh - ₹12 Lakh",
  187 |           height: "5'4\"",
  188 |           weight: "58 kg",
  189 |           lifestyle: "Modern",
  190 |           foodPreference: "Vegetarian",
  191 |           smoking: "No",
  192 |           drinking: "Occasionally",
  193 |           hobbies: "Dancing, Cooking",
  194 |           subCaste: "Deshmukh" // Direct override to Deshmukh in seed data
  195 |         }
  196 |       });
  197 |       await page.waitForTimeout(2000);
  198 |     });
  199 | 
  200 |     // ── STEP 6: Send Interest from Priya (Female) to Raj (Male) ────────
  201 |     await test.step("Send Interest to Raj Sharma", async () => {
  202 |       // Go to Advanced Search Tab
  203 |       await page.goto("/dashboard?tab=search");
  204 |       await page.waitForTimeout(2050);
  205 | 
  206 |       // Search specifically for the unique male name
  207 |       const searchInput = page.locator('input[type="text"]');
  208 |       await searchInput.fill(maleName);
  209 |       await page.waitForTimeout(2050);
  210 | 
  211 |       // Locate Raj Sharma's unique profile card
  212 |       const rajCard = page.locator("div").filter({ hasText: maleName }).last();
  213 |       await expect(rajCard).toBeVisible({ timeout: 10000 });
  214 | 
  215 |       // Click "Interest" on Raj's card
  216 |       const sendInterestBtn = rajCard.locator('button').filter({ hasText: /^Interest$/ }).first();
> 217 |       await expect(sendInterestBtn).toBeVisible();
      |                                     ^ Error: expect(locator).toBeVisible() failed
  218 |       await sendInterestBtn.click();
  219 |       
  220 |       // Wait for button state to update to "Sent"
  221 |       await expect(rajCard.locator('button').filter({ hasText: /^Sent$/ }).first()).toBeVisible({ timeout: 10000 });
  222 |       await page.waitForTimeout(1000);
  223 |     });
  224 | 
  225 |     // ── STEP 7: Logout Female User ────────────────────────────────────
  226 |     await test.step("Logout Female User", async () => {
  227 |       await page.evaluate(() => {
  228 |         (window as any).firebaseAuth.signOut();
  229 |       }).catch(() => {});
  230 |       await page.waitForTimeout(2000);
  231 |       await page.goto("/login");
  232 |       await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  233 |     });
  234 | 
  235 |     // ── STEP 8: Login Male User (Raj) & Approve Interest ──────────────
  236 |     await test.step("Login Raj and Approve Priya's Interest", async () => {
  237 |       // Login
  238 |       await page.fill('input[type="email"]', maleEmail);
  239 |       await page.fill('input[type="password"]', password);
  240 |       await page.click('button[type="submit"]');
  241 |       await page.waitForURL("**/dashboard", { timeout: 20000 });
  242 |       await page.waitForTimeout(2000);
  243 | 
  244 |       // Go to Interests Tab
  245 |       await page.goto("/dashboard?tab=interests");
  246 |       await page.waitForTimeout(2000);
  247 | 
  248 |       // Accept Priya Patil's interest request
  249 |       const approveBtn = page.locator('button:has-text("Approve")').first();
  250 |       await expect(approveBtn).toBeVisible({ timeout: 10000 });
  251 |       await approveBtn.click();
  252 | 
  253 |       // Wait for the Approve button to disappear, meaning it was processed
  254 |       await expect(approveBtn).not.toBeVisible({ timeout: 10000 });
  255 |       await page.waitForTimeout(1000);
  256 |     });
  257 | 
  258 |     // ── STEP 9: View Priya's Profile & Send Marriage Proposal ─────────
  259 |     await test.step("Send Marriage Proposal to Priya", async () => {
  260 |       // Go to Advanced Search tab to find Priya
  261 |       await page.goto("/dashboard?tab=search");
  262 |       await page.waitForTimeout(2050);
  263 | 
  264 |       // Search specifically for the unique female name
  265 |       const searchInput = page.locator('input[type="text"]');
  266 |       await searchInput.fill(femaleName);
  267 |       await page.waitForTimeout(2050);
  268 | 
  269 |       // Click on Priya Patil's card to open her profile detail view
  270 |       const priyaCard = page.locator("div").filter({ hasText: femaleName }).last();
  271 |       await expect(priyaCard).toBeVisible({ timeout: 10000 });
  272 |       await priyaCard.click();
  273 |       await page.waitForTimeout(2000);
  274 | 
  275 |       // Verify the "Let's Get Married!" button is visible
  276 |       const letsGetMarriedBtn = page.locator('button:has-text("Let\'s Get Married!")');
  277 |       await expect(letsGetMarriedBtn).toBeVisible({ timeout: 10000 });
  278 |       await letsGetMarriedBtn.click();
  279 | 
  280 |       // In Marriage Proposal Modal, fill out details:
  281 |       // Proposed Date: future dated (e.g. 2027-12-25)
  282 |       await page.fill('input[type="date"]', "2027-12-25");
  283 |       await page.fill('input[type="time"]', "18:00");
  284 |       await page.fill('input[placeholder*="Grand Palace"]', "Grand Palace Resort, Mumbai");
  285 | 
  286 |       // Click "Send Marriage Request"
  287 |       await page.click('button:has-text("Send Marriage Request")');
  288 |       
  289 |       // Wait for toast success
  290 |       await page.waitForTimeout(2500);
  291 |     });
  292 | 
  293 |     // ── STEP 10: Logout Male User ────────────────────────────────────
  294 |     await test.step("Logout Male User", async () => {
  295 |       await page.evaluate(() => {
  296 |         (window as any).firebaseAuth.signOut();
  297 |       }).catch(() => {});
  298 |       await page.waitForTimeout(2000);
  299 |       await page.goto("/login");
  300 |       await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  301 |     });
  302 | 
  303 |     // ── STEP 11: Login Female User (Priya) & Accept Proposal ──────────
  304 |     await test.step("Login Priya and Accept Proposal", async () => {
  305 |       // Login
  306 |       await page.fill('input[type="email"]', femaleEmail);
  307 |       await page.fill('input[type="password"]', password);
  308 |       await page.click('button[type="submit"]');
  309 |       await page.waitForURL("**/dashboard", { timeout: 20000 });
  310 |       await page.waitForTimeout(2000);
  311 | 
  312 |       // Verify marriage proposal notification/card is visible
  313 |       // It shows up in Interests tab -> Marriage Requests sub-tab
  314 |       await page.goto("/dashboard?tab=interests");
  315 |       await page.waitForTimeout(2000);
  316 | 
  317 |       // Click Marriage Requests tab inside Interests panel
```
# Chat Feature — E2E Test Plan

## Objective
Verify the full chat flow works end-to-end: user registration → login → navigate to chat → send message → verify message appears → delete message.

## Test Data
- **Email:** Randomly generated (`test_<random-hex>@example.com`) — unique per run
- **Password:** `Test@123` (meets requirements: >=6 chars, has digit, has special char)

## Step-by-Step Test Flow

### Phase 1 — User Registration (3-Step Wizard)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1 | Navigate to `/register` | Registration form loads with Step 1 visible |
| 1.2 | Fill Step 1: firstName="Test", lastName="User", gender="Male", dob="1995-06-15", mobile="9876543210", email=`<random>`, password="Test@123" | All fields populated |
| 1.3 | Click "Continue" | Navigates to Step 2 |
| 1.4 | Fill Step 2: subCaste="Panchal" | Sub-caste selected |
| 1.5 | Click "Continue" | Navigates to Step 3 |
| 1.6 | Fill Step 3: aadhaarNumber="123456789012", check termsAccepted | Fields filled |
| 1.7 | Click "Submit Profile" | Firebase Auth user created, Firestore profile doc created, alert shown |
| 1.8 | Dismiss alert | Redirected to `/dashboard` |

### Phase 2 — Dashboard & Chat Navigation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | Wait for `/dashboard` to load | Profile grid visible |
| 2.2 | Take screenshot | `01-dashboard.png` |
| 2.3 | Navigate to `/chat?userId=<random>&name=Test+Profile&photo=` | Chat page loads |
| 2.4 | Wait for ChatThread to initialize | Message input visible OR conversation list shown |

### Phase 3 — Send & Verify Message

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | If chat input not visible, click the first conversation | Chat thread opens |
| 3.2 | Take screenshot | `02-chat-thread.png` |
| 3.3 | Type "Hello! This is a test message from Playwright." in input | Input shows text |
| 3.4 | Click send button (or press Enter) | Message submitted |
| 3.5 | Wait 2s for Firestore sync | Message appears in thread |
| 3.6 | Verify message text is visible | Assert passes |
| 3.7 | Take screenshot | `03-message-sent.png` |

### Phase 4 — Delete Message

| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1 | Hover over sent message | Three-dot menu appears |
| 4.2 | Click three-dot menu | Delete option shown |
| 4.3 | Click "Delete" | Message replaced with "This message was deleted" |
| 4.4 | Verify deleted text visible | Assert passes |
| 4.5 | Take screenshot | `04-message-deleted.png` |

## Assertions
1. Registration form fields are fillable
2. Submit completes and navigates to dashboard
3. Chat input is visible after selecting/conversation
4. Sent message text is visible in chat thread
5. Status icons (sent/delivered) are rendered
6. Message can be deleted and shows "This message was deleted"

## Running
```bash
# From frontend/ directory:
npx playwright test e2e/chat-test.spec.ts --config e2e/playwright.config.ts
```

## Test files
| File | Purpose |
|------|---------|
| `e2e/playwright.config.ts` | Playwright config (port 5173, headless) |
| `e2e/chat-test.spec.ts` | Test script with all phases |
| `e2e/CHAT_TEST_PLAN.md` | This test plan |
| `e2e-snapshots/*.png` | Step-by-step screenshots |

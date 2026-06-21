# Chat Feature — Complete Implementation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ChatProvider                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  onAuthStateChanged  →  lookupMyProfileId(email) │   │
│  │  (retries 5× up to 10s for Firestore eventual)   │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  conversations listener (onSnapshot)              │   │
│  │  Firestore: conversations where participants      │   │
│  │  array-contains <myProfileId>                     │   │
│  │  Computes: unreadCount per conversation           │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  liveProfiles listener (onSnapshot per profile)   │   │
│  │  Subscribes to each participant's profile doc     │   │
│  │  Merges real-time firstName+lastName+photo        │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  messages listener (onSnapshot)                   │   │
│  │  Subcollection of active conversation             │   │
│  │  Auto-marks delivered for new incoming messages   │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  markAsRead()                                    │   │
│  │  Batch-updates messages from other user to read   │   │
│  │  Also updates conversation.lastMessage.status     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `src/features/chat/ChatContext.tsx` | All state management: auth, conversations, messages, profiles, unread, send, delete, markAsRead |
| `src/features/chat/ChatPage.tsx` | Route-level page, handles `?userId=...&name=...&photo=...` params |
| `src/features/chat/components/ChatList.tsx` | Left sidebar: conversation list with avatars, names, last message, unread badge |
| `src/features/chat/components/ChatThread.tsx` | Right panel: message thread, input box, send button, header with avatar |
| `src/features/chat/components/MessageBubble.tsx` | Individual message: text bubble, timestamp, status icon, delete menu |
| `src/features/chat/chatTypes.ts` | TypeScript types: `ChatMessage`, `Conversation`, `MessageStatus` |
| `src/features/dashboard/components/MobileBottomNav.tsx` | Mobile badge on the chat icon showing globalUnreadCount |

---

## 1. Conversation Create

**File:** `ChatContext.tsx` — `startConversation(userId, name, photo)`

**Triggered by:**
- `ChatPage.tsx` — URL params `?userId=X&name=Y&photo=Z`
- `Dashboard.tsx` — clicking Chat button on a profile card

**Logic:**
1. Computes deterministic conversation ID: `[uid, userId].sort().join("_")`
2. Checks if conversation doc exists in Firestore (`getDoc`)
3. If not, creates it with:
   - `participants: [uid, userId]`  (Firestore profile doc IDs)
   - `participantData` with initial name/photo snapshot
   - `lastMessage: null`
4. Returns the conversation ID

---

## 2. Real-Time Profile Updates

**File:** `ChatContext.tsx` — `liveProfiles` state + `onSnapshot` per participant

**Why:** `participantData` in the conversation doc is a one-time snapshot. When a user updates their profile (name, photo), the chat needs to reflect it live.

**How:**
1. After conversations change, extract all unique participant IDs (excluding self)
2. Subscribe to each profile doc via `onSnapshot(doc(db, "profiles", pid))`
3. Derive name from `firstName + lastName` (falls back to `name`)
4. Derive photo from `photos[0]` (falls back to `photo`)
5. Store in `liveProfiles` state keyed by profile ID
6. Unsubscribe when a profile leaves all conversations

**Usage in components:**
```tsx
const otherData = liveProfiles[otherId] ?? conversation.participantData[otherId];
```

---

## 3. Sending Messages

**File:** `ChatContext.tsx` — `sendMessage(text)`

1. Adds subdocument to `conversations/{convId}/messages/` with:
   - `senderId: myProfileId` (Firestore doc ID, NOT auth UID)
   - `text`, `timestamp: serverTimestamp()`, `status: "sent"`, `deleted: false`
2. Updates conversation doc: `lastMessage` and `updatedAt`

---

## 4. Deleting Messages

**File:** `ChatContext.tsx` — `deleteMessage(messageId)`
**File:** `MessageBubble.tsx` — Delete menu UI

**UI Flow:**
1. Hover over own (maroon) message bubble
2. Three-dot menu button appears (`button[aria-label="Message options"]`)
3. Click → dropdown with "Delete" option
4. Click Delete → Firestore `updateDoc` sets `deleted: true`
5. Listener picks up change → bubble replaced with *"This message was deleted"*

---

## 5. Unread Count & Badge System

### Per-Conversation Badge

**File:** `ChatContext.tsx` (conversations listener, line 137):
```ts
const hasUnread = lastMsg && lastMsg.senderId !== myProfileId && lastMsg.status !== "read";
unreadCount: hasUnread ? 1 : 0,
```

**File:** `ChatList.tsx` — shows badge next to conversation name:
- Maroon pill badge with count (`1` or `9+`)
- Bold last-message text when unread

### Global Badge (Mobile & Desktop)

**Computed in ChatContext:**
```ts
globalUnreadCount = conversations.filter(c => c.unreadCount > 0).length
```

**Consumed by:**
- `Dashboard.tsx` sidebar menu item (line 740)
- `MobileBottomNav.tsx` bottom nav (line 15) — badge on the chat/Inbox icon
- Both show `99+` when count exceeds 99

---

## 6. Status Lifecycle (Read Receipts)

```
sending → sent → delivered → read
```

### `sent` → `delivered`
- **Trigger:** Recipient has the chat thread open
- **File:** `ChatContext.tsx` — messages `onSnapshot` listener (line 188-197)
- **Logic:** For each newly added message where `senderId !== me && !deleted`, calls `updateDoc({ status: "delivered" })`

### `delivered` → `read`
- **Trigger:** Active conversation with messages loaded
- **File:** `ChatContext.tsx` — `markAsRead()` (line 258-287)
- **Logic:**
  1. Query messages where `senderId !== me && status in ["sent", "delivered"]`
  2. Batch-update all to `status: "read"`
  3. Also updates `conversation.lastMessage.status` to `"read"`
  4. Conversations listener picks this up → `unreadCount` drops to 0 → badges disappear

### Status Icons (MessageBubble.tsx)

| Status | Icon | Color |
|--------|------|-------|
| `sending` | Dashed circle | `slate-400` (grey) |
| `sent` | Single checkmark | `slate-400` (grey) |
| `delivered` | Double checkmark | `slate-400` (grey) |
| `read` | Double checkmark | `blue-500` (blue) |

---

## 7. Navigation Flow

### From Dashboard (Matches tab)
1. User clicks "Chat" on a profile card → `startChat(profile)` in Dashboard.tsx
2. → `startConversation(profile.id, profile.name, profile.photo)`
3. → `navigate("/chat")`
4. → ChatPage reads URL params → calls `startConversation` if params present

### From Mobile Bottom Nav
1. User taps "Inbox" icon
2. → `setActiveTab("messages")` checks `tab === "messages"`
3. → `navigate("/chat")`

### From Dashboard Sidebar
1. Click "Messages" menu item
2. → Same `setActiveTab` → `navigate("/chat")`

---

## 8. E2E Test

**File:** `e2e/chat-test.spec.ts`

**Flow tested:**
1. Register random user via 3-step wizard (random email each run)
2. Navigate to `/chat?userId=random&name=Test+Profile&photo=`
3. Wait for conversation to be created (retry if auth not ready)
4. Type message "Hello from Playwright!" and submit
5. Verify message visible in thread
6. Hover → click three-dot menu → click Delete → verify deletion

**Run:**
```bash
cd frontend && npx playwright test e2e/chat-test.spec.ts --config e2e/playwright.config.ts
```

---

## 9. Test Plan

**File:** `e2e/CHAT_TEST_PLAN.md`

Full step-by-step plan covering:
- Registration (3-step wizard with random credentials)
- Dashboard loading
- Chat navigation via URL params
- Message sending
- Message deletion
- Screenshots at each phase

---

## 10. Important Details

### Firestore Rules
`participants[]` and `senderId` store Firestore **profile doc IDs**, not auth UIDs. Rules (`firestore.rules`) must use:
```
allow read, create, update: if request.auth != null;
```
instead of comparing `request.auth.uid` against participant arrays.

### Auth Race Condition
When a user is created during registration (`createUserWithEmailAndPassword`), the `onAuthStateChanged` listener fires BEFORE Firestore profile doc is created (`addDoc`). The fix:
1. Retry loop in `lookupMyProfileId` (5 attempts, up to 10s total)
2. `ChatPage` waits for `myId` before calling `startConversation` (via `useEffect` dependency)

### Profile Lookup
Profile ID is found by querying `profiles` collection with `where("email", "==", email)`. The retry loop handles the case where Firestore hasn't indexed the new doc yet.

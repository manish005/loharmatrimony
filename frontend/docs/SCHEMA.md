# Firestore Schema — Lohar Matrimony

## Overview

Firestore project: `loharmatrimonyy`  
Database: Cloud Firestore (NoSQL)  
Auth: Firebase Authentication (email/password + Google)  
Storage: Cloud Storage for Images

---

## 1. Collection: `profiles`

One document per registered user.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✓ | Combined full name from `firstName middleName lastName` |
| `firstName` | string | ✓ | |
| `middleName` | string | | |
| `lastName` | string | ✓ | |
| `email` | string | ✓ | Used as the lookup key for the current user |
| `gender` | string | ✓ | `"Male"` / `"Female"` |
| `age` | number | | Auto-calculated from `dob` |
| `dob` | string | | `"YYYY-MM-DD"` |
| `mobile` | string | | |
| `height` | string | | e.g. `"5'9\""` |
| `weight` | string | | e.g. `"72 kg"` |
| `religion` | string | | Default: `"Hinduism"` |
| `caste` | string | | Default: `"Lohar"` |
| `subCaste` | string | | Options: `Panchal`, `Gadi Lohar`, `Sangar`, `Jhangra`, `Dhiman` |
| `motherTongue` | string | | Default: `"Marathi"` |
| `maritalStatus` | string | | `"Never Married"`, `"Divorced"`, `"Widowed"`, `"Awaiting Divorced"` |
| `education` | string | | |
| `occupation` | string | | |
| `income` | string | | e.g. `"₹12 Lakh - ₹15 Lakh"` |
| `city` | string | | |
| `state` | string | | |
| `district` | string | | |
| `address` | string | | |
| `familyDetails` | string | | |
| `fatherOccupation` | string | | |
| `motherOccupation` | string | | |
| `siblings` | string | | |
| `lifestyle` | string | | `"Simple"`, `"Moderate"`, `"Liberal"` |
| `foodPreference` | string | | `"Vegetarian"`, `"Non-Vegetarian"`, `"Eggetarian"` |
| `smoking` | string | | `"Yes"` / `"No"` |
| `drinking` | string | | `"Yes"` / `"No"` |
| `hobbies` | string | | |
| `photos[]` | array<string> | | URLs from Firebase Storage, max 5 |
| `isOnline` | boolean | | Tracks active status |
| `isVerified` | boolean | | KYC verification flag |
| `isPremium` | boolean | | Subscription flag |
| `bio` | string | | Short self-description |
| `compatibility` | number | | Random score 75–100 |
| `registeredAt` | timestamp | | ISO string |

### Indexes Required
- None (all reads use `getDocs` with optional `where("email")` — single-field index auto-created)

---

## 2. Collection: `conversations`

One document per unique user pair. Document ID = sorted UID pair joined by `_`.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `participants[]` | array<string> | ✓ | Exactly 2 UIDs |
| `participantData` | map | ✓ | `{ uid: { name, photo } }` |
| `lastMessage` | map or null | | `{ text, senderId, timestamp, status }` |
| `createdAt` | timestamp | | `serverTimestamp()` |
| `updatedAt` | timestamp | | `serverTimestamp()` |

### Indexes Required

| Index | Fields | Used By |
|-------|--------|---------|
| Composite | `participants` ARRAY_CONTAINS + `updatedAt` DESC | Chat sidebar listing |

### Security Rules
- Read/Write: only if `request.auth.uid in participants`

---

## 3. Subcollection: `conversations/{conversationId}/messages`

One document per chat message under a conversation.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `senderId` | string | ✓ | UID of the sender |
| `text` | string | ✓ | Message body |
| `timestamp` | timestamp | ✓ | `serverTimestamp()` |
| `status` | string | ✓ | `"sending"` → `"sent"` → `"delivered"` → `"read"` |
| `deleted` | boolean | | Soft-delete flag |

### Indexes Required

| Index | Fields | Used By |
|-------|--------|---------|
| Single | `timestamp` ASC | Message thread display (auto-created) |
| Composite | `senderId` ASC + `status` ASC | Mark-as-read query (`where("senderId !=") + where("status in")`) |

### Security Rules
- Create: `senderId == request.auth.uid`
- Update: only sender can update

---

## 4. Cloud Storage

Bucket: `loharmatrimonyy.firebasestorage.app`

| Path Pattern | Content |
|-------------|---------|
| `profiles/photo_{docId}_{timestamp}_{i}.jpg` | User profile photos |

---

## 5. Firebase Auth

| Provider | Usage |
|----------|-------|
| Email/Password | Primary registration |
| Google | Social sign-in |

Custom claims: none currently.

---

## 6. Relationships

```
Auth User (uid)
  └── profiles/{docId}  (1:1 via email field)
        └── conversation/{convId}  (M:N via participants array)
              └── messages/{msgId}  (1:M subcollection)
```

- **User ↔ Profile**: 1:1. Profile is looked up by `auth.currentUser.email` matching `profiles.email`
- **User ↔ Conversation**: M:N. A user can have many conversations (`participants` array)
- **Conversation ↔ Message**: 1:M. Messages are a subcollection of the conversation

---

## 7. Deploy Commands

```bash
# Deploy Firestore rules + indexes
firebase deploy --only firestore

# Deploy hosting
firebase deploy --only hosting

# Deploy all
firebase deploy
```

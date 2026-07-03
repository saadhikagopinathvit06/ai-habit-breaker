# Security Specification: AI Habit Breaker

This document outlines the data invariants, security constraints, and adversarial test scenarios ("Dirty Dozen" payloads) designed to prevent unauthorized access or state tampering within the Firestore backend.

## 1. Core Data Invariants
- **Identity Isolation**: A user can only access, write, edit, or list documents residing under their specific subcollections. Any read/write under `/users/{userId}/...` is strictly gated to `request.auth.uid == userId`.
- **Verified Access**: All write operations require that the user is authenticated and their email is verified (`request.auth.token.email_verified == true`).
- **Immutable Fields**: Creation timestamps (`createdAt`), initial owner IDs (`userId`), and immutable scores cannot be mutated post-creation.
- **Strict Keys**: Document creations must enforce absolute keys to prevent injected shadow fields.
- **Terminal State Locking**: Completed habits or completed historical entries cannot have their statuses downgraded or bypassed illegally.

---

## 2. The "Dirty Dozen" Adversarial Payloads
Below are 12 malicious payloads designed to bypass identity, integrity, or state invariants. The firestore security rules must catch and block every single one of these.

### 1. Identity Spoofing (Modifying another user's profile)
- **Target**: `/users/another_victim_uid`
- **Action**: `write` / `set`
- **Payload**: `{ "uid": "another_victim_uid", "name": "Hacker", "xp": 1000000 }`
- **Insecure Rule Failure**: Allowing any signed-in user to write to user records.
- **Expected Outcome**: `PERMISSION_DENIED`

### 2. Privilege Escalation (Self-assigning Premium status)
- **Target**: `/users/attacker_uid`
- **Action**: `update`
- **Payload**: `{ "premium": true, "updatedAt": "request.time" }`
- **Insecure Rule Failure**: Letting users modify fields that should only be controlled by billing or systems.
- **Expected Outcome**: `PERMISSION_DENIED`

### 3. XP / Coin Tampering (Injecting massive scores directly)
- **Target**: `/users/attacker_uid`
- **Action**: `update`
- **Payload**: `{ "xp": 9999999, "coins": 9999999 }`
- **Insecure Rule Failure**: Lack of field-level change restriction on update.
- **Expected Outcome**: `PERMISSION_DENIED`

### 4. Shadow Field Injection (Creating a habit with a ghost attribute `isVerified: true`)
- **Target**: `/users/attacker_uid/habits/some_habit_id`
- **Action**: `create`
- **Payload**: `{ "id": "some_habit_id", "userId": "attacker_uid", "name": "Smoking", "category": "health", "streak": 0, "maxStreak": 0, "status": "active", "createdAt": "request.time", "isVerified": true }`
- **Insecure Rule Failure**: Allowing unspecified keys (e.g. shadow flags) on creation.
- **Expected Outcome**: `PERMISSION_DENIED`

### 5. Creation Spoofing (Associating a habit to a different owner)
- **Target**: `/users/attacker_uid/habits/some_habit_id`
- **Action**: `create`
- **Payload**: `{ "id": "some_habit_id", "userId": "another_victim_uid", "name": "TikTok", "category": "digital", "streak": 0, "maxStreak": 0, "status": "active", "createdAt": "request.time" }`
- **Insecure Rule Failure**: Failing to verify that `incoming().userId == request.auth.uid`.
- **Expected Outcome**: `PERMISSION_DENIED`

### 6. Temporal Hijacking (Faking creation timestamps)
- **Target**: `/users/attacker_uid/habits/some_habit_id`
- **Action**: `create`
- **Payload**: `{ "id": "some_habit_id", "userId": "attacker_uid", "name": "Nail Biting", "category": "health", "streak": 0, "maxStreak": 0, "status": "active", "createdAt": "2020-01-01T00:00:00Z" }`
- **Insecure Rule Failure**: Relying on client-provided timestamp strings instead of `request.time`.
- **Expected Outcome**: `PERMISSION_DENIED`

### 7. Denied ID Poisoning (Injecting huge characters as document IDs)
- **Target**: `/users/attacker_uid/habits/VERY_LONG_ID_OR_MALICIOUS_CHARSET_%%%%_$$$$`
- **Action**: `create`
- **Payload**: `{ "id": "VERY_LONG_ID_OR_MALICIOUS_CHARSET_%%%%_$$$$", "userId": "attacker_uid", "name": "Sweets", "category": "health", "streak": 0, "maxStreak": 0, "status": "active", "createdAt": "request.time" }`
- **Insecure Rule Failure**: Accepting invalid formats, sizes, or dangerous characters as document keys.
- **Expected Outcome**: `PERMISSION_DENIED`

### 8. System Field Overwrite (User overwriting AI-generated recovery days)
- **Target**: `/users/attacker_uid/recoveryPlans/plan_id`
- **Action**: `update`
- **Payload**: `{ "days": [ { "day": 1, "completed": true } ], "healthyAlternatives": ["none"] }`
- **Insecure Rule Failure**: Permitting users to write custom AI-plan steps directly without restricted update scopes.
- **Expected Outcome**: `PERMISSION_DENIED`

### 9. Challenge Status Cheat (Marking challenge as completed with 0 XP)
- **Target**: `/users/attacker_uid/challenges/challenge_id`
- **Action**: `update`
- **Payload**: `{ "status": "completed", "xp": 1000 }` (Overwriting the XP value to give extra reward)
- **Insecure Rule Failure**: Lack of state transition constraints and missing `affectedKeys().hasOnly()` gates.
- **Expected Outcome**: `PERMISSION_DENIED`

### 10. Blanket Access Query Scraper (Trying to list all habits on the platform)
- **Target**: `/users/victim_uid/habits`
- **Action**: `list`
- **Payload**: `getDocs(collectionGroup("habits"))` without individual owner clauses.
- **Insecure Rule Failure**: Allowing blanket reads if signed in (`allow list: if isSignedIn();`).
- **Expected Outcome**: `PERMISSION_DENIED`

### 11. PII Extraction (Unprivileged private information fetcher)
- **Target**: `/users/victim_uid`
- **Action**: `get`
- **Payload**: Read a user's target profile without ownership rights.
- **Insecure Rule Failure**: Blanket user read permission.
- **Expected Outcome**: `PERMISSION_DENIED`

### 12. Immutability Violation (Modifying `createdAt` during a habit progress update)
- **Target**: `/users/attacker_uid/habits/some_habit_id`
- **Action**: `update`
- **Payload**: `{ "name": "Sweets", "createdAt": "2021-12-25T12:00:00Z", "updatedAt": "request.time" }`
- **Insecure Rule Failure**: Allowing modifications of immortal fields.
- **Expected Outcome**: `PERMISSION_DENIED`

---

## 3. Test Runner Definition
For local and rule compliance, we verify rules against the adversarial suite. The test runner checks authorization, path variables, strict keys, and structural updates.

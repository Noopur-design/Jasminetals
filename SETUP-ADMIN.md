# Jasminetals — Admin & Team setup

The app code is done. These are the **one-time console + env steps** that turn it
on. Everything here is yours to do (it needs your Firebase console + secrets).

## 1. Enable sign-in providers
Firebase Console → **Authentication → Sign-in method** → enable:
- **Email/Password**
- **Google** (set a project support email)

## 2. Name the owner-admin(s)
Edit `.env.local`:
```
ADMIN_EMAILS=you@yourdomain.com
```
These emails get **full** admin access automatically. Restart the dev server after editing.

## 3. Turn on the databases
- **Realtime Database** (already created) — used for user profiles. Rules:
  ```json
  { "rules": { "users": { "$uid": {
    ".read": "auth != null && auth.uid === $uid",
    ".write": "auth != null && auth.uid === $uid"
  } } } }
  ```
- **Firestore** → Console → **Firestore Database → Create database** (production mode).
  It stores team members + (later) events/clients/vendors. Starter rules:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{db}/documents {
      // Only the server (Admin SDK) manages roles; clients can't write these.
      match /members/{uid} {
        allow read: if request.auth != null && request.auth.uid == uid;
        allow write: if false;
      }
    }
  }
  ```

## 4. Service-account key (enables team roles/permissions)
Firebase Console → **Project settings → Service accounts → Generate new private key**
→ downloads a JSON file. From it, copy two values into `.env.local`:
```
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxx@jasminetals.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```
- Keep the private key **on one line**, in quotes, with literal `\n` between lines.
- This file is git-ignored. **Never commit it or paste the private key anywhere else.**

Restart the dev server after editing `.env.local`.

## How access works (already built & enforced)
- **Lead** (just signed up, no deal yet) → **public site only**. No portal, no admin.
- **Client (deal done)** → gets the `/portal`. A user becomes a client only when the
  **admin activates them** (see below). Never sees `/internal`.
- **Team members (sub-users)** → `/internal`, but only what the admin grants, per module
  (Events / Clients / Vendors / Tasks / Calendar / Team) × action (view/create/edit/delete).
- **Owner-admin** (`ADMIN_EMAILS`) → full `/internal`; manages team + clients; may preview the portal.

Every gate is enforced **twice server-side** (middleware + a layout guard), so no
lead or client can ever load admin, and no lead can load the portal.

### Marking a deal done (unlock a client's portal)
- `POST /api/admin/clients` → `{ "email": "client@…", "active": true }` grants the
  **client** role (their portal unlocks on next token refresh / re-login).
- `POST /api/admin/clients` with `"active": false` revokes it (back to lead).
- `GET /api/admin/clients` lists activated clients.
(A visual "close the deal" button comes with the admin UI in the next phase.)

## Team management API (admin-only, ready)
- `GET /api/admin/members` — list team members
- `POST /api/admin/members` — `{ email, permissions }` → promotes an existing
  user to **team** with those permissions (they must have signed up first)
- `PATCH /api/admin/members/[uid]` — update `{ permissions }` or `{ status: "suspended" }`
- `DELETE /api/admin/members/[uid]` — revoke team access

Permissions are written as Firebase **custom claims** + a `members/{uid}` Firestore
doc, so they're enforced server-side on every request.

## What's next (after the above is set)
With the service account in place I'll wire the admin **UI**: the team-management
screen (grant/revoke permissions), live **CRUD** for events/clients/vendors/tasks,
and **calendar role assignment** — and verify it all end to end.

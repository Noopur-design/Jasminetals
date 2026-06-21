# Deploying Jasminetals to Vercel

This app uses a **dual-mode storage layer**: locally it persists to `.data/*.json`
files (zero setup), and in production it uses **Firebase** — the **Realtime Database**
for all app data and **Firebase Storage** for uploaded files — because Vercel's
serverless filesystem is read-only and can't persist the local files. The switch is
automatic based on env vars (`FIREBASE_ADMIN_*`), so you don't change any code.

## 1. Push to GitHub
```bash
git add -A
git commit -m "Production-ready: Firebase storage, security hardening"
git push
```
Your `.env.local` is git-ignored — secrets stay out of the repo.

## 2. Set up Firebase (one-time)
In the [Firebase console](https://console.firebase.google.com) for your project
(`jasminetals`):
1. **Realtime Database** → *Create database* → pick a location → start in
   **locked mode** (the app talks to it only via the Admin SDK, which bypasses
   security rules). Note the database URL — it goes in `NEXT_PUBLIC_FIREBASE_DATABASE_URL`.
2. **Storage** → *Get started* → keep the default bucket
   (`jasminetals.firebasestorage.app`). Used for uploaded client documents.
3. **Project settings → Service accounts → Generate new private key**. This
   downloads a JSON file — you'll use `client_email` and `private_key` from it
   in step 4. Keep this file secret; never commit it.

## 3. Import the project into Vercel
- vercel.com → **Add New → Project** → import your GitHub repo.
- Framework preset: **Next.js** (auto-detected). Don't deploy yet — add env first.

## 4. Set environment variables
Project → **Settings → Environment Variables** (Production + Preview). Copy the
values from your `.env.local`:

| Variable | Value |
|---|---|
| `AUTH_SECRET` | your long random secret (don't reuse a weak one) |
| `ADMIN_EMAILS` | your owner email, e.g. `hello@nextlinecreative.in` |
| `ADMIN_PASSWORD` | your **strong** admin password |
| `NEXT_PUBLIC_FIREBASE_*` | all values from the Firebase web config (incl. `..._DATABASE_URL`) |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `client_email` from the service-account JSON |
| `FIREBASE_ADMIN_PRIVATE_KEY` | `private_key` from the JSON — see note below |
| `TRUSTED_PROXY_HOPS` | `1` (Vercel sits as one proxy in front of the app) |

> **Private key formatting:** paste it as a single line with literal `\n` for the
> newlines, wrapped in double quotes:
> `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`
> The app converts `\n` back into real newlines at runtime.

Without `FIREBASE_ADMIN_*` the app boots but every write fails on Vercel's
read-only filesystem — so these are **required** for production.

## 5. Authorize your domain in Firebase
Firebase console → **Authentication → Settings → Authorized domains** → **Add domain**:
- `your-project.vercel.app` (and your custom domain once you add one).

Otherwise Google / email login will fail on the live site.

## 6. Deploy
Click **Deploy**. Vercel builds with plenty of RAM (no local OOM). On first load:
- Seed content (sample events, blog posts, etc.) shows from the built-in seeds.
- The first time you create/edit anything, it persists to the **Realtime Database**
  under `jt_store/<name>` (one node per dataset — `events`, `leads`, `blog-posts`,
  etc.), with the value JSON-serialised in a `json` child.
- Uploaded client documents go to **Firebase Storage** under `uploads/`; downloads
  stream through the auth-gated route (the object stays private).

## After deploy

- **HTTPS, security headers, CSP, secure cookies** are already on.
- **Rate limiting** is in-memory per serverless instance (no external store needed).
- **Forgot admin password in prod?** Hit `POST /api/admin-reset-request` with your
  admin email, then read the one-time link from Vercel **Runtime Logs** (it's logged
  server-side, never returned in the response). Open it to set a new password.
- **Local data does NOT auto-migrate.** Production starts fresh from the Realtime
  Database (with seeds). To import existing `.data/*.json`, create a node at
  `jt_store/<name>` (e.g. `jt_store/leads`) with a single child `json` whose value
  is the file's contents stringified.

## Custom domain
Project → **Settings → Domains** → add your domain and follow the DNS steps. Then
add it to Firebase Authorized domains (step 5) too.

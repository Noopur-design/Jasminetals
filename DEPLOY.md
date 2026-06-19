# Deploying Jasminetals to Vercel

This app uses a **dual-mode storage layer**: locally it persists to `.data/*.json`
files (zero setup), and in production it uses **Vercel KV (Redis)** for data and
**Vercel Blob** for uploaded files — because Vercel's serverless filesystem is
read-only and can't persist the local files. The switch is automatic based on env
vars, so you don't change any code.

## 1. Push to GitHub
```bash
git add -A
git commit -m "Production-ready: KV/Blob storage, security hardening"
git push
```
Your `.env.local` is git-ignored — secrets stay out of the repo.

## 2. Import the project into Vercel
- vercel.com → **Add New → Project** → import your GitHub repo.
- Framework preset: **Next.js** (auto-detected). Don't deploy yet — add storage and env first.

## 3. Create the data stores (one-time)
In the project's **Storage** tab:
1. **KV / Redis** (Upstash) → *Create* → connect to the project.
   Vercel auto-injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
2. **Blob** → *Create* → connect to the project.
   Vercel auto-injects `BLOB_READ_WRITE_TOKEN`.

## 4. Set environment variables
Project → **Settings → Environment Variables** (Production + Preview). Copy the
values from your `.env.local`:

| Variable | Value |
|---|---|
| `AUTH_SECRET` | your long random secret (don't reuse a weak one) |
| `ADMIN_EMAILS` | your owner email, e.g. `hello@nextlinecreative.in` |
| `ADMIN_PASSWORD` | your **strong** admin password |
| `NEXT_PUBLIC_FIREBASE_*` | all 8 values from the Firebase console |
| `TRUSTED_PROXY_HOPS` | `1` (Vercel sits as one proxy in front of the app) |

`KV_*` and `BLOB_READ_WRITE_TOKEN` are added for you by step 3.
`FIREBASE_ADMIN_*` are optional (only needed if you enable the Firestore-backed
members/clients screens).

## 5. Authorize your domain in Firebase
Firebase console → **Authentication → Settings → Authorized domains** → **Add domain**:
- `your-project.vercel.app` (and your custom domain once you add one).

Otherwise Google / email login will fail on the live site.

## 6. Deploy
Click **Deploy**. Vercel builds with plenty of RAM (no local OOM). On first load:
- Seed content (sample events, blog posts, etc.) shows from the built-in seeds.
- The first time you create/edit anything, it persists to **KV**.
- Uploaded client documents go to **Blob**; downloads stream through the auth-gated route.

## After deploy

- **HTTPS, security headers, CSP, secure cookies** are already on.
- **Rate limiting** is now distributed across instances via KV.
- **Forgot admin password in prod?** Hit `POST /api/admin-reset-request` with your
  admin email, then read the one-time link from Vercel **Runtime Logs** (it's logged
  server-side, never returned in the response). Open it to set a new password.
- **Local data does NOT auto-migrate.** Production starts fresh from KV (with seeds).
  If you need to import existing `.data/*.json`, load each file's array into the KV
  key `jt:<name>` (e.g. `jt:leads`, `jt:blog-posts`) once.

## Custom domain
Project → **Settings → Domains** → add your domain and follow the DNS steps. Then
add it to Firebase Authorized domains (step 5) too.

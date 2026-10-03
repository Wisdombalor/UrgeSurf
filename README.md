# UrgeSurf

Mobile-first gambling recovery companion. Ride out urges and track your recovery, one wave at a time. React + Vite app in `src/`.

## Run

```sh
npm install
npm run dev
```

Build / preview:

```sh
npm run build
npm run preview
```

## Deploy

Push to GitHub, import the repo in Vercel (framework: Vite, build command `npm run build`, output directory `dist`).

## Structure

- `src/pages/` — Home, Recovery, Community, Support tab screens
- `src/components/` — BottomNav, Sheet, Toast, reusable UI (`ui.jsx`)
- `src/sheets/` — overlay flows (urge, breathing, check-in, relapse, crisis, talk, support request, trusted people, blockers, share, onboarding, profile)
- `src/lib/` — constants (helplines, blockers), helpers, localStorage persistence
- `src/index.css` — global styling (same theme as the original)
- `public/fonts/` — licensed Aeonik `.woff2` files go here

## Font

The site uses Aeonik, which is a licensed font. Add your `.woff2` files to `public/fonts/` (see public/fonts/README.txt). Until then it falls back to Hanken Grotesk.

## Support, report & feedback emails

All three forms post via FormSubmit AJAX using `FORMSUBMIT_TOKEN` (`src/lib/constants.js`) so the inbox address is never in the form action. `SUPPORT_EMAIL` is only used for the `mailto:` fallback.

- **In-house support** (`Request support` sheet): emailed to the admin with name, message, reply-by, contact, urgent flag. When the user chooses email, `_replyto` is set and FormSubmit sends them an automatic receipt (`_autoresponse`) — the waiting screen tells them to check spam/promotions if it is missing.
- **Community reports** (`Report` on any post): stored in the Supabase `reports` table (plus a local copy) and reviewed in the Admin dashboard — no email involved.
- **Contact the admin** (`Support → Improve this app`): user sends name (optional), their email (required), and a message; the admin can reply directly and the user gets a thank-you receipt.

### If the admin inbox gets nothing

1. Submit one test from the deployed HTTPS URL (not just localhost) — FormSubmit treats localhost and preview domains differently.
2. Open `Wisdomudohwest@gmail.com` and click the FormSubmit **activation** message once (check spam/promotions too). Until activated, FormSubmit accepts the POST but never delivers.
3. Check spam/promotions/filters for `formsubmit.co` mail, and confirm the token in `src/lib/constants.js` matches the activated one.
4. Open devtools → Network → the `formsubmit.co/ajax/...` call: a non-200 or `success:false` body means the app correctly falls back to `Send by email` — that request only arrives if the user taps it.
5. Free-tier limits and ad-blockers can silently block the call; the waiting screen now shows the exact error and the mailto fallback.

## Data

Outside claude.ai everything saves in the browser only (`localStorage`). The shared community feed needs a real backend (Supabase or Firebase).

## Supabase setup (posts, reports, admin)

1. In Supabase Dashboard → SQL Editor, run `supabase/schema.sql` once. It creates `posts` and `reports` with row-level security: anyone can read posts and file reports; only signed-in users can post; only admins can take down posts or manage reports.
2. Replace `admin@example.com` in `schema.sql` with your admin's login email, and set the same address in `VITE_ADMIN_EMAILS` (see `.env.example`).
3. Log in with that account — an **Admin** tab appears with reported posts (each with its post ID), review, takedown, and dismiss actions.

## Before launch

Check every helpline number, blocker install step and the privacy wording.

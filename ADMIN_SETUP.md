# Admin setup — complete runbook

One page, start to finish. Do the steps in order; each one depends on the last.

## 0. What you need

- The repo deployed on Vercel (any commit that includes `src/pages/AdminArea.jsx`).
- A Supabase project, with its URL + publishable key.
- The email address of the admin account: `wisdomudohwest@gmail.com`.

## 1. Environment variables

Local (`.env`, restart `npm run dev` after any change):

```sh
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
VITE_ADMIN_EMAILS=wisdomudohwest@gmail.com
```

Vercel (Project → Settings → Environment Variables), same three keys,
then **Redeploy** (env changes never apply without a new deployment).

## 2. Database

Supabase Dashboard → SQL Editor → New query → paste the **entire**
`supabase/schema.sql` → Run. Expect `Success. No rows returned`.
The file is idempotent, safe to re-run. It creates:

- `posts` (+ `mod_state`: active/hidden/removed)
- `profiles` (+ `is_admin`, `status`: active/suspended/banned, `warnings`, `notice`)
- `reports` (type post/user, status pending/reviewed/resolved/dismissed)
- `moderation_log` (append-only audit trail)
- `is_admin()` helper, anti-self-promotion trigger, and RLS policies

Verify in Table Editor that all four tables exist.

## 3. First admin (no self-promotion endpoint exists by design)

1. Log in to the app once with `wisdomudohwest@gmail.com`
   (creates its auth user; the app creates its `profiles` row on login).
2. In SQL Editor run:

```sql
update public.profiles
set is_admin = true
where email = 'wisdomudohwest@gmail.com';
```

To revoke someone later:

```sql
update public.profiles set is_admin = false where email = 'other@example.com';
```

## 4. Open the admin area

- Local: `http://localhost:5173/#/admin` (use your dev server's port)
- Live: `https://urge-surf-jxnn.vercel.app/#/admin`

The `#/` prefix is required — plain `/admin` will not work on static hosting.
Logged out → login sheet opens. Non-admin login → access-denied card.
Admin login → Dashboard, Reports, Posts, Users, History.

## 5. Verify the full loop

1. As a normal user: Community → Report on a post → toast says "Report submitted."
2. As admin: `#/admin` → Reports shows it with its post ID → Inspect.
3. Take down the post → confirm normal users no longer see it in Community.
4. Restore it → it reappears.
5. Warn/suspend a test user → they see the notice banner and cannot post.
6. History shows each action with admin ID, target, previous → new state.

## 6. Troubleshooting

| Symptom | Cause → fix |
|---|---|
| `#/admin` shows landing, no login sheet | Old deployment — push latest `main` and redeploy |
| Access-denied card as admin | `VITE_ADMIN_EMAILS` missing/stale in that env, or the `is_admin` flag query not run |
| Dashboard lists never load + red banner | `schema.sql` not run (or not re-run after updates) |
| Takedown toast says "Could not remove" | Row-level policy missing — re-run current `schema.sql` |
| Warned user sees nothing | They need the build containing the notice banner; refresh |
| Posts invisible to everyone | Check `mod_state` column exists; RLS hides non-active posts |
| Signup sends a link, not a code | Supabase → Auth → Email Templates → Confirm signup: use the `{{ .Token }}` variable for codes; links also work (the app completes them on return) |

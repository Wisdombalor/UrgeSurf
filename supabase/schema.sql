-- In-Recovery backend: community posts, profiles with roles, moderation
-- reports, and the moderation audit log.
-- Run this in Supabase Dashboard → SQL Editor. It is idempotent, safe to
-- re-run after pulling updates.
--
-- Auth: email/password and Google OAuth both work with these policies.
--
-- FIRST ADMIN SETUP (secure, no self-promotion endpoint exists):
--   1. Sign up / log in once with the account that should be admin (this
--      creates its auth user; the app creates its profiles row on login).
--   2. In SQL Editor (service-role context) run:
--        update public.profiles set is_admin = true where email = 'wisdomudohwest@gmail.com';
--   3. Set the same address in VITE_ADMIN_EMAILS (see .env.example) so the
--      app shows the Admin tab to that account.
-- Backend authorization never trusts the frontend: every admin operation is
-- gated by RLS on is_admin(), and a trigger blocks privilege escalation
-- through the profile update path.
--
-- Order matters: tables first, then helper functions, then policies.

-- ================================================================ TABLES

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  owner_id uuid references auth.users (id) on delete cascade,
  text text not null,
  who text not null default '',
  sober_days int
);

-- Moderation state: active | hidden | removed. The app feed only shows active.
alter table public.posts
  add column if not exists mod_state text not null default 'active'
    check (mod_state in ('active', 'hidden', 'removed'));

alter table public.posts enable row level security;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Role + standing. Only ever changed by admins (see trigger below).
alter table public.profiles
  add column if not exists is_admin boolean not null default false;
alter table public.profiles
  add column if not exists status text not null default 'active'
    check (status in ('active', 'suspended', 'banned'));
alter table public.profiles
  add column if not exists warnings int not null default 0;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  post_id text not null,
  post_text text not null default '',
  post_who text not null default '',
  reporter text not null default '',
  reporter_id uuid references auth.users (id) on delete set null,
  reason text not null,
  details text not null default '',
  status text not null default 'open'
);

alter table public.reports enable row level security;

-- Report target + lifecycle. Reports start as pending.
alter table public.reports
  add column if not exists type text not null default 'post'
    check (type in ('post', 'user'));
alter table public.reports
  add column if not exists reported_user_id uuid references auth.users (id) on delete set null;
alter table public.reports
  add column if not exists action_taken text not null default '';

-- Normalize legacy 'open' rows to the pending/reviewed/resolved/dismissed set.
update public.reports set status = 'pending' where status = 'open';

alter table public.reports
  drop constraint if exists reports_status_check;
alter table public.reports
  add constraint reports_status_check
  check (status in ('pending', 'reviewed', 'resolved', 'dismissed'));

-- Append-only audit trail of every administrative action.
create table if not exists public.moderation_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  admin_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text not null default '',
  prev_state text not null default '',
  new_state text not null default '',
  note text not null default ''
);

alter table public.moderation_log enable row level security;

-- ============================================================== FUNCTIONS

-- Helper: true when the caller is an admin. Security definer so it can
-- read profiles regardless of the caller's row policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  );
$$;

-- No self-promotion: only an admin can change is_admin / status / warnings.
create or replace function public.block_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- SQL Editor / service role has no auth.uid(); allow it.
  if auth.uid() is null then
    return new;
  end if;

  if (new.is_admin is distinct from old.is_admin
      or new.status is distinct from old.status
      or new.warnings is distinct from old.warnings)
     and not public.is_admin() then
    raise exception 'Only admins can change roles or standing.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_block_escalation on public.profiles;
create trigger profiles_block_escalation
  before update on public.profiles
  for each row execute function public.block_privilege_escalation();

-- =============================================================== POLICIES

-- ---------------------------------------------------------------- posts

drop policy if exists "Anyone can read posts" on public.posts;
drop policy if exists "Signed-in users can post" on public.posts;
drop policy if exists "Owners can delete their posts" on public.posts;
drop policy if exists "Admins can delete any post" on public.posts;
drop policy if exists "Admins can update any post" on public.posts;
drop policy if exists "Read active posts, admins read all" on public.posts;
drop policy if exists "Active users can post" on public.posts;
drop policy if exists "Admins can moderate posts" on public.posts;

-- Everyone (including guests) can read ACTIVE community posts.
-- Admins can additionally read hidden/removed posts for review.
create policy "Read active posts, admins read all"
  on public.posts for select
  using (mod_state = 'active' or public.is_admin());

-- Only signed-in users in good standing can publish. Accounts without a
-- profiles row yet (brand-new sign-ups) can post; suspended/banned cannot.
create policy "Active users can post"
  on public.posts for insert
  with check (
    auth.uid() = owner_id
    and (
      not exists (select 1 from public.profiles where id = auth.uid())
      or exists (select 1 from public.profiles where id = auth.uid() and status = 'active')
    )
  );

-- Owners can delete their own posts.
create policy "Owners can delete their posts"
  on public.posts for delete
  using (auth.uid() = owner_id);

-- Admins can take down any post (hard delete) and change moderation state.
create policy "Admins can delete any post"
  on public.posts for delete
  using (public.is_admin());

create policy "Admins can moderate posts"
  on public.posts for update
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------- profiles

drop policy if exists "Users manage their own profile" on public.profiles;
drop policy if exists "Admins can read profiles" on public.profiles;
drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Admins read all profiles" on public.profiles;
drop policy if exists "Users create own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;

-- Users see and create their own row; admins see all rows.
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users create own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users may edit name/email. Privilege columns are guarded by trigger.
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- -------------------------------------------------------------- reports

drop policy if exists "Anyone can file reports" on public.reports;
drop policy if exists "Admins can read reports" on public.reports;
drop policy if exists "Admins can resolve reports" on public.reports;
drop policy if exists "Admins can clear reports" on public.reports;
drop policy if exists "Admins manage reports" on public.reports;

-- Anyone (including guests) can file a report.
create policy "Anyone can file reports"
  on public.reports for insert
  with check (true);

-- Only admins can read, update, or clear reports.
create policy "Admins manage reports"
  on public.reports for all
  using (public.is_admin())
  with check (public.is_admin());

-- -------------------------------------------------------- moderation log

drop policy if exists "Admins write audit log" on public.moderation_log;
drop policy if exists "Admins read audit log" on public.moderation_log;

-- Only admins can write and read the audit log. No updates or deletes.
create policy "Admins write audit log"
  on public.moderation_log for insert
  with check (public.is_admin());

create policy "Admins read audit log"
  on public.moderation_log for select
  using (public.is_admin());

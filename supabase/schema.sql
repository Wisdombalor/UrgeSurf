-- In-Recovery community posts + moderation reports tables.
-- Run this once in Supabase Dashboard → SQL Editor.
-- Auth: email/password and Google OAuth both work with these policies.
--
-- ADMIN SETUP (required for the admin dashboard):
--   1. Replace 'admin@example.com' below with your admin's Google/email login.
--   2. Set the same address in VITE_ADMIN_EMAILS (see .env.example).
--   Only that account can read reports and take down posts.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  owner_id uuid references auth.users (id) on delete cascade,
  text text not null,
  who text not null default '',
  sober_days int
);

alter table public.posts enable row level security;

-- Everyone (including guests) can read community posts.
create policy "Anyone can read posts"
  on public.posts for select
  using (true);

-- Only signed-in users can publish.
create policy "Signed-in users can post"
  on public.posts for insert
  with check (auth.uid() = owner_id);

-- Owners can delete their own posts.
create policy "Owners can delete their posts"
  on public.posts for delete
  using (auth.uid() = owner_id);

-- Admins can take down any post.
create policy "Admins can delete any post"
  on public.posts for delete
  using ((auth.jwt() ->> 'email') = 'admin@example.com');

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

-- Anyone (including guests) can file a report.
create policy "Anyone can file reports"
  on public.reports for insert
  with check (true);

-- Only admins can read, resolve, and clear reports.
create policy "Admins can read reports"
  on public.reports for select
  using ((auth.jwt() ->> 'email') = 'admin@example.com');

create policy "Admins can resolve reports"
  on public.reports for update
  using ((auth.jwt() ->> 'email') = 'admin@example.com');

create policy "Admins can clear reports"
  on public.reports for delete
  using ((auth.jwt() ->> 'email') = 'admin@example.com');

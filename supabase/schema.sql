-- In-Recovery community posts table.
-- Run this once in Supabase Dashboard → SQL Editor.
-- Auth: Google OAuth. One Google account = one user.

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

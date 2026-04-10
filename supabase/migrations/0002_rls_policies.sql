-- ============================================================
-- Migration: 0002_rls_policies
-- Description: Enable RLS on profiles and add per-user policies
-- Phase: 1 — Foundation & Auth
-- Requires: 0001_initial_schema (profiles table must exist)
-- ============================================================

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policy: users can only read their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Policy: users can only update their own profile
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Policy: users can only delete their own profile
-- (handles LGPD account deletion cascade)
create policy "Users can delete own profile"
  on public.profiles
  for delete
  using (auth.uid() = id);

-- NOTE: No INSERT policy for regular users — profile rows are created
-- exclusively by the handle_new_user() trigger (security definer),
-- which bypasses RLS. This prevents users from manually inserting
-- profile rows for other user IDs.

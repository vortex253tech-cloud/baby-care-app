-- Migration: 0003_babies_table
-- Phase 2 — Baby Profile & Dashboard

create table if not exists public.babies (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  birth_date   date not null,
  sex          text not null check (sex in ('M', 'F', 'other')),
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists babies_user_id_idx on public.babies(user_id);

-- Reuse the set_updated_at function from 0001_initial_schema
create trigger babies_updated_at
  before update on public.babies
  for each row execute function public.set_updated_at();

-- RLS
alter table public.babies enable row level security;

create policy "Users can view their own babies"
  on public.babies for select
  using (auth.uid() = user_id);

create policy "Users can insert their own babies"
  on public.babies for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own babies"
  on public.babies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own babies"
  on public.babies for delete
  using (auth.uid() = user_id);

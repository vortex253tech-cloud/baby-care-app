---
plan: "02-baby-profile-and-dashboard/01"
phase: 2
sequence: 1
title: "Supabase babies schema + storage bucket"
status: pending
requires: []
---

# Plan 01: Supabase babies schema + storage bucket

## Objective
Create the `babies` table with RLS and a `baby-photos` storage bucket with per-user access policies so all subsequent plans have a working backend.

## Requirements Addressed
- BABY-01: Usuária pode cadastrar um bebê com nome, data de nascimento e sexo
- BABY-02: Usuária pode adicionar foto do bebê ao perfil

## Tasks

<task id="1.1" type="schema">
  <title>Create babies table migration</title>
  <description>
Create `supabase/migrations/0003_babies_table.sql`:

```sql
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
```
  </description>
  <files>
    <file action="create">supabase/migrations/0003_babies_table.sql</file>
  </files>
</task>

<task id="1.2" type="schema">
  <title>Create storage bucket + policies migration</title>
  <description>
Create `supabase/migrations/0004_storage_policies.sql`:

```sql
-- Migration: 0004_storage_policies
-- Creates baby-photos storage bucket and access policies

-- Public bucket: avatars are identified by opaque UUID paths and are safe to be public.
-- Using public=true allows getPublicUrl() to return a stable CDN URL without signed token refresh.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'baby-photos',
  'baby-photos',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "Users can upload baby photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to read their own photos
create policy "Users can read their own baby photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update/replace their own photos
create policy "Users can update their own baby photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own photos
create policy "Users can delete their own baby photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```
  </description>
  <files>
    <file action="create">supabase/migrations/0004_storage_policies.sql</file>
  </files>
</task>

<task id="1.3" type="docs">
  <title>Update SUPABASE-SETUP.md with Phase 2 steps</title>
  <description>
Append to SUPABASE-SETUP.md a Phase 2 section instructing the developer to run the new migrations (0003 + 0004) in the Supabase SQL Editor.
  </description>
  <files>
    <file action="modify">SUPABASE-SETUP.md</file>
  </files>
</task>

<task id="1.4" type="code">
  <title>Update TypeScript types with Baby type</title>
  <description>
Add to `src/types/index.ts`:

```typescript
export interface Baby {
  id: string
  user_id: string
  name: string
  birth_date: string  // ISO date string 'YYYY-MM-DD'
  sex: 'M' | 'F' | 'other'
  avatar_url: string | null
  created_at: string
  updated_at: string
}
```
  </description>
  <files>
    <file action="modify">src/types/index.ts</file>
  </files>
</task>

## Verification
- [ ] `supabase/migrations/0003_babies_table.sql` exists with correct schema
- [ ] `supabase/migrations/0004_storage_policies.sql` exists with bucket + policies
- [ ] `Baby` type exported from `src/types/index.ts`
- [ ] `tsc --noEmit` exits 0

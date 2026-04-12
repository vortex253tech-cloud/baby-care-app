---
plan: "03-core-trackers/01"
phase: 3
sequence: 1
title: "Schema Supabase para trackers"
status: pending
requires: []
---

# Plan 01: Schema Supabase para trackers

## Objective
Criar as tabelas `feedings`, `sleeps` e `diapers` com RLS, índices e tipos TypeScript para que todos os planos subsequentes possam ler e gravar dados.

## Requirements Addressed
- FEED-01 a FEED-04, SLEEP-01, SLEEP-02, SLEEP-04, DIAP-01, DIAP-04

## Tasks

<task id="1.1" type="schema">
  <title>Migration 0005_trackers_schema.sql</title>
  <description>
Criar `supabase/migrations/0005_trackers_schema.sql`:

```sql
-- Migration: 0005_trackers_schema — Phase 3 Core Trackers

-- FEEDINGS
create table if not exists public.feedings (
  id               uuid primary key default uuid_generate_v4(),
  baby_id          uuid not null references public.babies(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  type             text not null check (type in ('breast','bottle','solid')),
  side             text check (side in ('left','right','both')),
  duration_seconds int,
  volume_ml        int,
  milk_type        text check (milk_type in ('breast_milk','formula','mixed')),
  food_name        text,
  amount_g         int,
  notes            text,
  started_at       timestamptz not null default now(),
  ended_at         timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists feedings_baby_started_idx on public.feedings(baby_id, started_at desc);
alter table public.feedings enable row level security;
create trigger feedings_updated_at before update on public.feedings
  for each row execute function public.set_updated_at();
create policy "Users manage their feedings" on public.feedings
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SLEEPS
create table if not exists public.sleeps (
  id         uuid primary key default uuid_generate_v4(),
  baby_id    uuid not null references public.babies(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at   timestamptz,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sleeps_baby_started_idx on public.sleeps(baby_id, started_at desc);
alter table public.sleeps enable row level security;
create trigger sleeps_updated_at before update on public.sleeps
  for each row execute function public.set_updated_at();
create policy "Users manage their sleeps" on public.sleeps
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- DIAPERS
create table if not exists public.diapers (
  id         uuid primary key default uuid_generate_v4(),
  baby_id    uuid not null references public.babies(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null check (type in ('wet','dirty','both')),
  notes      text,
  changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists diapers_baby_changed_idx on public.diapers(baby_id, changed_at desc);
alter table public.diapers enable row level security;
create trigger diapers_updated_at before update on public.diapers
  for each row execute function public.set_updated_at();
create policy "Users manage their diapers" on public.diapers
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```
  </description>
  <files>
    <file action="create">supabase/migrations/0005_trackers_schema.sql</file>
  </files>
</task>

<task id="1.2" type="code">
  <title>TypeScript types for trackers</title>
  <description>
Adicionar a `src/types/index.ts`:

```typescript
export interface Feeding {
  id: string
  baby_id: string
  user_id: string
  type: 'breast' | 'bottle' | 'solid'
  side: 'left' | 'right' | 'both' | null
  duration_seconds: number | null
  volume_ml: number | null
  milk_type: 'breast_milk' | 'formula' | 'mixed' | null
  food_name: string | null
  amount_g: number | null
  notes: string | null
  started_at: string
  ended_at: string | null
  created_at: string
  updated_at: string
}

export interface Sleep {
  id: string
  baby_id: string
  user_id: string
  started_at: string
  ended_at: string | null   // null = currently sleeping
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Diaper {
  id: string
  baby_id: string
  user_id: string
  type: 'wet' | 'dirty' | 'both'
  notes: string | null
  changed_at: string
  created_at: string
  updated_at: string
}
```
  </description>
  <files>
    <file action="modify">src/types/index.ts</file>
  </files>
</task>

<task id="1.3" type="docs">
  <title>Atualizar SUPABASE-SETUP.md</title>
  <description>Adicionar seção "Phase 3 — Run Migration 0005" com instrução para executar 0005_trackers_schema.sql no SQL Editor.</description>
  <files>
    <file action="modify">SUPABASE-SETUP.md</file>
  </files>
</task>

## Verification
- [ ] 0005_trackers_schema.sql existe com 3 tabelas + RLS + índices
- [ ] Feeding, Sleep, Diaper exportados de src/types/index.ts
- [ ] tsc --noEmit exits 0

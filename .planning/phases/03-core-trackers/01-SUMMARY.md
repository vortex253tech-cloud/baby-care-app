---
plan: "03-core-trackers/01"
status: complete
completed: 2026-04-12
---

# Summary: Plan 01 — Schema Supabase para trackers

## What was built
Migration SQL with three tracker tables and TypeScript interfaces for all three.

## Key files created/modified
- `supabase/migrations/0005_trackers_schema.sql` — Three tables:
  - `feedings`: `type in ('breast','bottle','solid')`, side, duration_seconds, volume_ml, milk_type, food_name, amount_g, notes, started_at, ended_at. Index on `(baby_id, started_at desc)`.
  - `sleeps`: started_at, ended_at nullable (null = actively sleeping), notes. Index on `(baby_id, started_at desc)`.
  - `diapers`: `type in ('wet','dirty','both')`, notes, changed_at. Index on `(baby_id, changed_at desc)`.
  - All three: uuid PK, baby_id+user_id FK cascade, RLS ON, single permissive policy via `auth.uid() = user_id`, `set_updated_at` trigger.
- `src/types/index.ts` — Added `Feeding`, `Sleep`, `Diaper` interfaces.
- `SUPABASE-SETUP.md` — Added "Phase 3 — Run Migration 0005" section.

## Self-Check: PASSED
- [x] 0005_trackers_schema.sql exists with 3 tables + RLS + indices
- [x] Feeding, Sleep, Diaper exported from src/types/index.ts
- [x] tsc --noEmit exits 0

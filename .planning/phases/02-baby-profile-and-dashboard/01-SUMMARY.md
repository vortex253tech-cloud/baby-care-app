---
plan: "02-baby-profile-and-dashboard/01"
status: complete
completed: 2026-04-11
---

# Summary: Plan 01 — Supabase babies schema + storage bucket

## What was built
Database schema for the babies feature plus a public Supabase Storage bucket for baby photos.

## Key files created/modified
- `supabase/migrations/0003_babies_table.sql` — `babies` table: id (uuid), user_id (FK → auth.users cascade), name, birth_date (date), sex ('M'|'F'|'other'), avatar_url, created_at, updated_at. Index on user_id. Reuses `set_updated_at` trigger. 4 RLS policies (SELECT/INSERT/UPDATE/DELETE scoped to `auth.uid() = user_id`).
- `supabase/migrations/0004_storage_policies.sql` — `baby-photos` bucket: `public: true`, 5 MB limit, JPEG/PNG/WebP only. 4 storage object policies scoped to `(storage.foldername(name))[1] = auth.uid()::text`.
- `src/types/index.ts` — Added `Baby` interface: `{ id, user_id, name, birth_date: string, sex: 'M'|'F'|'other', avatar_url: string|null, created_at, updated_at }`
- `SUPABASE-SETUP.md` — Appended Phase 2 section with migration steps

## Decisions made
- Bucket is `public: true` (not private) — avatars are at UUID-based paths (`{user_id}/{baby_id}/avatar.jpg`) which are not guessable, and public URLs allow stable CDN caching without signed-URL refresh complexity
- INSERT policy on babies is user-scoped (unlike profiles which use a security-definer trigger) — babies are explicitly created by the user, not auto-generated

## Self-Check: PASSED
- [x] 0003 migration creates babies table with correct schema
- [x] 0004 migration creates baby-photos bucket (public) with 4 policies
- [x] Baby type exported from src/types/index.ts
- [x] tsc --noEmit exits 0

---
plan: "01-foundation-and-auth/01"
status: complete
completed: 2026-04-10
---

# Summary: Plan 01 — Supabase Setup

## What was built

All local artifacts required to configure a Supabase backend for MamãeApp were created and committed atomically. This includes the complete database schema migration for the `profiles` table (with auto-create trigger and `updated_at` trigger), RLS policies enforcing per-user row isolation, a Supabase CLI config template, a development seed file, and a `.gitignore` that protects credentials. Because Supabase itself is a cloud service, a `SUPABASE-SETUP.md` guide was also created documenting every manual step the developer must perform in the dashboard.

## Key files created

- `.env.example` — placeholder env vars for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and app config; safe to commit
- `.gitignore` — ignores `.env.local`, `node_modules/`, `.supabase/`, and common editor/OS files
- `supabase/migrations/0001_initial_schema.sql` — creates `profiles` table, `handle_new_user()` trigger (auto-creates profile on signup), and `set_updated_at()` trigger
- `supabase/migrations/0002_rls_policies.sql` — enables RLS on `profiles` and adds select/update/delete policies scoped to `auth.uid() = id`
- `supabase/seed.sql` — no-op dev reference file explaining trigger-based profile creation
- `supabase/config.toml` — Supabase CLI configuration template for local dev environment
- `SUPABASE-SETUP.md` — step-by-step manual guide covering project creation, credential copy, migration execution, email template configuration (Portuguese), Google OAuth setup, and URL configuration

## Decisions made

- Migration files use `0001_` / `0002_` numeric prefix (matching the plan spec) so they sort and apply in the correct order; all future migrations should continue this sequence.
- No `INSERT` RLS policy was added for `profiles` — profile creation is intentionally gated to the `handle_new_user()` security-definer trigger only, preventing users from inserting rows for arbitrary IDs.
- `config.toml` Google OAuth block was left disabled (`enabled = false`) with commented credentials, deferring that to when the developer completes Step 6 of the setup guide.
- `SUPABASE-SETUP.md` was placed at the project root (not inside `.planning/`) so it is immediately discoverable by any developer cloning the repo.

## Self-Check: PASSED

- [x] .env.example exists with all variables
- [x] supabase/migrations/0001_initial_schema.sql exists
- [x] supabase/migrations/0002_rls_policies.sql exists
- [x] SUPABASE-SETUP.md exists with manual steps
- [x] .gitignore exists

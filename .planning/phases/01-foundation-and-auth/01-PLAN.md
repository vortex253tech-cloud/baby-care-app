---
id: "01-foundation-and-auth/01"
phase: 1
plan: 1
wave: 1
depends_on: []
autonomous: true
files_modified:
  - ".env.local"
  - ".env.example"
  - "supabase/migrations/0001_initial_schema.sql"
  - "supabase/migrations/0002_rls_policies.sql"
  - "supabase/seed.sql"
requirements: ["AUTH-01", "AUTH-02", "AUTH-03", "AUTH-04", "AUTH-05", "AUTH-06"]
must_haves:
  - "Supabase project URL and anon key are available and correct in .env.local"
  - "Tables `profiles` exist in Supabase with correct columns"
  - "RLS is enabled and policies prevent cross-user data access"
  - "Google OAuth provider is enabled in Supabase Auth dashboard"
  - "Email confirmation and password reset templates are set to Portuguese (Brazil)"
---

# Plan 01: Supabase Project Setup + Initial Schema + Environment Variables

## Objective
Configure the Supabase project, create the initial database schema with Row Level Security, and set up all required environment variables so subsequent plans can connect to a working backend.

## Context
This is the pure infrastructure plan — nothing else in Phase 1 can proceed without a configured Supabase project. Plan 02 (Vite scaffolding) runs in parallel on Wave 1. Plans 03–06 all depend on the env vars and schema produced here. The schema created here intentionally includes only what Phase 1 needs (`profiles`). The `babies` table will be added in Phase 2 Plan 1.

## Tasks

<tasks>
  <task id="1" type="setup">
    <description>Create Supabase project and collect credentials</description>
    <details>
1. Go to https://supabase.com/dashboard and create a new project:
   - Name: `mamaeapp`
   - Region: South America (São Paulo) — `sa-east-1`
   - Database Password: generate a strong password and save it securely

2. After project is ready (takes ~2 minutes), go to:
   Project Settings → API

3. Copy the following values:
   - Project URL (e.g. `https://xxxxxxxxxxxx.supabase.co`)
   - anon/public key (the `anon` key, NOT the `service_role` key)

4. Also copy the `service_role` key (needed for server-side migrations/seed) — store separately, never expose to client.
    </details>
    <verification>Project dashboard loads without errors. Project URL ends in `.supabase.co`. Two keys are visible (anon, service_role).</verification>
  </task>

  <task id="2" type="implement">
    <description>Create .env.local and .env.example at project root</description>
    <details>
Create `C:/Users/Ezequ/Desktop/baby-care-app/.env.local` with the following content (replace placeholder values):

```
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
VITE_APP_NAME=MamãeApp
VITE_APP_URL=http://localhost:5173
```

Create `C:/Users/Ezequ/Desktop/baby-care-app/.env.example` (safe to commit, values are placeholders):

```
# Supabase — get from: https://supabase.com/dashboard/project/_/settings/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App
VITE_APP_NAME=MamãeApp
VITE_APP_URL=http://localhost:5173
```

Ensure `.env.local` is in `.gitignore` (add `*.local` if not present).
    </details>
    <verification>`.env.local` exists with real values. `.env.example` exists with placeholder values. Running `cat .gitignore` shows `*.local` or `.env.local` is excluded.</verification>
  </task>

  <task id="3" type="implement">
    <description>Create initial schema migration: profiles table</description>
    <details>
Create directory `supabase/migrations/` at project root.

Create file `supabase/migrations/0001_initial_schema.sql`:

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- One profile per auth.users row. Created automatically via trigger.
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger: auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
```

Run this migration in the Supabase dashboard:
- Go to SQL Editor → New Query
- Paste the entire content above
- Click Run
    </details>
    <verification>In Supabase dashboard → Table Editor, `profiles` table is visible with columns: id, email, full_name, avatar_url, created_at, updated_at.</verification>
  </task>

  <task id="4" type="implement">
    <description>Create RLS policies migration</description>
    <details>
Create file `supabase/migrations/0002_rls_policies.sql`:

```sql
-- ============================================================
-- ROW LEVEL SECURITY for PROFILES
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

-- Policy: the trigger function (security definer) can insert
-- No INSERT policy needed for regular users — profile is created by trigger only
```

Run this migration in Supabase SQL Editor.
    </details>
    <verification>In Supabase dashboard → Authentication → Policies, the `profiles` table shows 3 policies (select, update, delete). RLS toggle is ON.</verification>
  </task>

  <task id="5" type="configure">
    <description>Configure Supabase Auth settings: email templates, Google OAuth, session config</description>
    <details>
**Email Templates (Portuguese):**

Go to Supabase Dashboard → Authentication → Email Templates.

Set "Confirm signup" subject to:
`Confirme seu email — MamãeApp`

Set "Confirm signup" body to:
```html
<h2>Bem-vinda ao MamãeApp!</h2>
<p>Clique no botão abaixo para confirmar seu email:</p>
<a href="{{ .ConfirmationURL }}" style="background:#ec4899;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Confirmar email</a>
<p>Se você não criou uma conta, ignore este email.</p>
```

Set "Reset Password" subject to:
`Redefinição de senha — MamãeApp`

Set "Reset Password" body to:
```html
<h2>Redefinir sua senha</h2>
<p>Clique no botão abaixo para criar uma nova senha:</p>
<a href="{{ .ConfirmationURL }}" style="background:#ec4899;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Redefinir senha</a>
<p>Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este email.</p>
```

**Google OAuth:**

Go to Supabase Dashboard → Authentication → Providers → Google.

Toggle "Enable Google provider" ON.

Instructions to get Client ID and Secret:
1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing) → name: `MamaeApp`
3. Go to APIs & Services → OAuth consent screen
   - User Type: External
   - App name: MamãeApp
   - Add scopes: email, profile, openid
4. Go to Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs: add `https://xxxxxxxxxxxx.supabase.co/auth/v1/callback`
     (use your actual Supabase project URL)
5. Copy Client ID and Client Secret into Supabase Google provider form

Add to `.env.local` (for reference, not used client-side):
```
# Google OAuth (configured in Supabase dashboard, not here)
# Callback URL: https://xxxxxxxxxxxx.supabase.co/auth/v1/callback
```

**Session Settings:**

Go to Supabase Dashboard → Authentication → Providers → Email.
- Confirm email: ON (required for AUTH-02)
- Enable email signup: ON

Go to Auth → Configuration → General:
- Site URL: `http://localhost:5173` (update to prod URL later)
- Redirect URLs (Additional): `http://localhost:5173/**`
    </details>
    <verification>
- Email provider is enabled with email confirmation ON
- Google provider is enabled with Client ID filled
- Site URL is set to `http://localhost:5173`
    </verification>
  </task>

  <task id="6" type="implement">
    <description>Create a minimal seed file for development testing</description>
    <details>
Create file `supabase/seed.sql` (used only in local dev, not run in production):

```sql
-- This seed file is for local development only.
-- Run AFTER creating a test user via the Supabase Auth dashboard.
-- 
-- To use: replace 'your-test-user-id' with the UUID of a user
-- created via Supabase Auth dashboard → Users → Add user.
--
-- Example:
-- insert into public.profiles (id, email, full_name)
-- values ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Usuária Teste')
-- on conflict (id) do nothing;
--
-- NOTE: In practice, profiles are auto-created by the trigger.
-- This file exists as a reference for manual testing.
select 'Seed file — no automatic data inserted. Profiles are created by trigger.' as info;
```
    </details>
    <verification>File `supabase/seed.sql` exists. Content is a comment/no-op that explains the trigger handles profile creation.</verification>
  </task>
</tasks>

## Verification Criteria
- [ ] Supabase project is live and accessible at the dashboard URL
- [ ] `.env.local` exists with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set to real values
- [ ] `.env.example` exists with placeholder values and is safe to commit
- [ ] `profiles` table exists in Supabase with all required columns
- [ ] `handle_new_user` trigger is active on `auth.users`
- [ ] RLS is enabled on `profiles` with select/update/delete policies
- [ ] Email confirmation is ON in Supabase Auth settings
- [ ] Google OAuth provider is enabled with Client ID/Secret configured
- [ ] Email templates are in Portuguese with correct subject lines
- [ ] Site URL is set to `http://localhost:5173` in Auth settings

## Notes
- The `service_role` key must NEVER be placed in `.env.local` or any client-accessible file. It is only used in server-side scripts and Supabase Edge Functions.
- Google OAuth setup requires a Google Cloud Console project. The Supabase callback URL format is always `https://<project-ref>.supabase.co/auth/v1/callback`.
- The `babies` table is intentionally omitted here — it will be added in Phase 2, Plan 1 with its own migration.
- All future migrations should be numbered sequentially: `0003_`, `0004_`, etc.

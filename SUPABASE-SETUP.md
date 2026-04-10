# Supabase Manual Setup Guide — MamãeApp

This document describes every step that must be performed manually in the Supabase
dashboard before the application can run. These steps cannot be automated because
they require a live Supabase cloud account.

---

## Prerequisites

- A Supabase account at https://supabase.com
- A Google Cloud Console account (for Google OAuth — optional for initial dev)

---

## Step 1 — Create the Supabase Project

1. Go to https://supabase.com/dashboard and sign in.
2. Click **New Project**.
3. Fill in:
   - **Name:** `mamaeapp`
   - **Database Password:** generate a strong password (save it in a password manager)
   - **Region:** `South America (São Paulo)` — `sa-east-1`
4. Click **Create new project** and wait ~2 minutes for provisioning.

---

## Step 2 — Copy API Credentials

1. In your project dashboard, go to **Project Settings → API**.
2. Copy the following values:

   | Variable | Where to find it | Copy to |
   |----------|-----------------|---------|
   | `VITE_SUPABASE_URL` | "Project URL" field | `.env.local` |
   | `VITE_SUPABASE_ANON_KEY` | "anon / public" key | `.env.local` |

3. Create `.env.local` at the project root (copy from `.env.example`):

   ```bash
   cp .env.example .env.local
   ```

   Then fill in the real values:

   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_APP_NAME=MamãeApp
   VITE_APP_URL=http://localhost:5173
   ```

> **IMPORTANT:** Never commit `.env.local`. It is listed in `.gitignore`.
> The `service_role` key must NEVER go in `.env.local` — it is only for
> server-side scripts and Edge Functions.

---

## Step 3 — Run Database Migrations

1. In your project dashboard, go to **SQL Editor → New Query**.
2. Paste the full contents of `supabase/migrations/0001_initial_schema.sql` and click **Run**.
3. Open a new query tab, paste `supabase/migrations/0002_rls_policies.sql` and click **Run**.

**Verify:**
- Go to **Table Editor** → you should see a `profiles` table with columns:
  `id`, `email`, `full_name`, `avatar_url`, `created_at`, `updated_at`
- Go to **Authentication → Policies** → `profiles` should show 3 policies:
  `Users can view own profile`, `Users can update own profile`, `Users can delete own profile`
- The RLS toggle for `profiles` should be **ON**.

---

## Step 4 — Configure Email Auth Settings

1. Go to **Authentication → Providers → Email**.
2. Ensure:
   - **Enable Email Signup:** ON
   - **Confirm email:** ON (required — users must verify before signing in)

3. Go to **Authentication → Email Templates → Confirm signup**.
4. Set the subject to:
   ```
   Confirme seu email — MamãeApp
   ```
5. Set the body to:
   ```html
   <h2>Bem-vinda ao MamãeApp!</h2>
   <p>Clique no botão abaixo para confirmar seu email:</p>
   <a href="{{ .ConfirmationURL }}" style="background:#ec4899;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Confirmar email</a>
   <p>Se você não criou uma conta, ignore este email.</p>
   ```

6. Go to **Authentication → Email Templates → Reset Password**.
7. Set the subject to:
   ```
   Redefinição de senha — MamãeApp
   ```
8. Set the body to:
   ```html
   <h2>Redefinir sua senha</h2>
   <p>Clique no botão abaixo para criar uma nova senha:</p>
   <a href="{{ .ConfirmationURL }}" style="background:#ec4899;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Redefinir senha</a>
   <p>Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este email.</p>
   ```

---

## Step 5 — Configure Auth URLs

1. Go to **Authentication → URL Configuration**.
2. Set:
   - **Site URL:** `http://localhost:5173`
   - **Redirect URLs (Additional):** `http://localhost:5173/**`

> When deploying to production, update these to your production domain.

---

## Step 6 — Configure Google OAuth (Optional for initial dev)

You can skip this step during early development and add it when needed.

### 6a — Create a Google Cloud OAuth Client

1. Go to https://console.cloud.google.com/
2. Create or select a project named `MamaeApp`.
3. Navigate to **APIs & Services → OAuth consent screen**:
   - User Type: **External**
   - App name: `MamãeApp`
   - Add scopes: `email`, `profile`, `openid`
4. Navigate to **Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: `MamaeApp Web`
   - **Authorized redirect URIs:** Add your Supabase callback URL:
     ```
     https://xxxxxxxxxxxx.supabase.co/auth/v1/callback
     ```
     (Replace `xxxxxxxxxxxx` with your actual project reference)
5. Copy the **Client ID** and **Client Secret**.

### 6b — Enable Google Provider in Supabase

1. Go to **Authentication → Providers → Google**.
2. Toggle **Enable Google provider** to ON.
3. Paste the **Client ID** and **Client Secret** from the previous step.
4. Click **Save**.

---

## Step 7 — Verify Everything Works

Run through this checklist before proceeding to Plan 02:

- [ ] Project dashboard loads without errors
- [ ] `.env.local` exists with real `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] `profiles` table visible in Table Editor
- [ ] 3 RLS policies visible for `profiles` (select, update, delete)
- [ ] RLS is ON for `profiles`
- [ ] Email confirmation is ON
- [ ] Email templates are in Portuguese
- [ ] Site URL is `http://localhost:5173`
- [ ] Google OAuth provider enabled (or deferred)

---

## Future Migrations

All future schema changes must be added as numbered SQL files in `supabase/migrations/`:

```
supabase/migrations/
  0001_initial_schema.sql    ← profiles table (Phase 1)
  0002_rls_policies.sql      ← RLS for profiles (Phase 1)
  0003_...                   ← Phase 2 (babies table)
  ...
```

Run each new migration in Supabase SQL Editor in order, or use the Supabase CLI
(`supabase db push`) once the project is linked.

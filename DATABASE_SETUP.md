# SpendSense — Supabase Database Setup Guide

This guide walks you through setting up the SpendSense PostgreSQL database and authentication on **Supabase** (either using the hosted Supabase dashboard or the local Supabase CLI).

---

## Architecture Overview

SpendSense utilizes **Supabase PostgreSQL** with database-level security:
- **`auth.users`**: Managed Supabase Authentication (handles password encryption, JWT issuance, email verification).
- **`public.profiles`**: Stores user settings, base currency, opening balances, notification preferences, and privacy toggles. Automatically synced with `auth.users` via a PostgreSQL trigger.
- **`public.categories`**: Default system categories + user-customizable categories.
- **`public.transactions`**: Double-entry friendly transaction ledger (income/expenses) with foreign keys and cascade deletions.
- **`public.budgets`**: Category-specific spending limits with unique constraints per user/category.
- **`public.goals`**: Target reserves, savings tracking, deadline pacing, and milestone colors.
- **Row Level Security (RLS)**: Enforced on all tables. Authenticated users can only read, create, update, or delete their own data (`auth.uid() = user_id`).

---

## Option A: Hosted Supabase Project (Quickest Setup)

### 1. Create a Supabase Project
1. Log in to [database.new](https://database.new) (Supabase Console).
2. Click **New project**.
3. Choose your organization, assign a project name (e.g. `spendsense-production`), and set a secure database password.
4. Select your preferred AWS/GCP region.

### 2. Run Database Migrations
1. In your Supabase Dashboard, navigate to the **SQL Editor** (left menu).
2. Click **New query**.
3. Open `supabase/migrations/20261030000000_create_spendsense_schema.sql`, copy its entire content, paste it into the SQL Editor, and click **Run**.
4. Open `supabase/migrations/20261030000001_row_level_security.sql`, copy its content, paste into a new query, and click **Run**.
5. Both migrations will complete with status `Success. No rows returned`.

### 3. Retrieve Your API Credentials
Navigate to **Project Settings** → **API**:
- **Project URL**: `https://<your-project-ref>.supabase.co`
- **anon / public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Safe for frontend)
- **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Secret! Backend Express API ONLY)

### 4. Configure Authentication Redirects
1. Go to **Authentication** → **URL Configuration**.
2. Set **Site URL** to:
   - Development: `http://localhost:5173`
   - Production: `https://<your-vercel-domain>.vercel.app`
3. Add redirect URLs under **Redirect URLs**:
   - `http://localhost:5173/**`
   - `https://<your-vercel-domain>.vercel.app/**`

---

## Option B: Local Development with Supabase CLI

If you prefer running Supabase locally in Docker:

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```
2. Start the local Supabase stack from the repository root:
   ```bash
   supabase start
   ```
3. Apply migrations automatically:
   ```bash
   supabase db reset
   ```
4. The CLI will output your local API URL, anon key, and service role key:
   - `API URL: http://localhost:54321`
   - `DB URL: postgresql://postgres:postgres@localhost:54322/postgres`
   - `Studio URL: http://localhost:54323`

---

## Environment Variables Configuration

### 1. Frontend (`project/.env`)
Create `project/.env` (from `project/.env.example`):
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
VITE_API_URL=http://localhost:5000/api
```

### 2. Backend Server (`server/.env`)
Create `server/.env` (from `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
```

---

## Verification Checklist

1. **Table Creation**: Check Supabase **Table Editor** to confirm 5 tables exist (`profiles`, `categories`, `transactions`, `budgets`, `goals`).
2. **Categories Seeded**: Verify `categories` contains 17 default records (`salary`, `groceries`, `housing`, etc.).
3. **RLS Active**: Verify each table displays the badge `RLS Enabled`.
4. **Trigger Active**: Create a test user via Supabase Dashboard **Authentication** → **Users** → **Add user**. A corresponding row in `public.profiles` should automatically appear.


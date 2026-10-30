-- =============================================================================
-- SpendSense Database Migration 01: Core Schema & Relationships
-- =============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR')),
    opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    hide_balance BOOLEAN NOT NULL DEFAULT false,
    notifications JSONB NOT NULL DEFAULT '{"budgetAlerts": true, "weeklyDigest": true, "goalMilestones": true}'::jsonb,
    dismissed_recommendations TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

CREATE TRIGGER update_profiles_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

-- 4. Categories table (system defaults + optional user-defined categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT true,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Seed default system categories
INSERT INTO public.categories (id, label, type, color, icon, is_system) VALUES
    ('salary', 'Salary', 'income', '#34d399', 'Briefcase', true),
    ('freelance', 'Freelance', 'income', '#67e8f9', 'Laptop', true),
    ('investments', 'Investments', 'income', '#fde047', 'TrendingUp', true),
    ('other-income', 'Other income', 'income', '#a3e635', 'Sparkles', true),
    ('housing', 'Housing', 'expense', '#2dd4bf', 'Home', true),
    ('groceries', 'Groceries', 'expense', '#4ade80', 'ShoppingBasket', true),
    ('food', 'Dining out', 'expense', '#fb923c', 'Utensils', true),
    ('transport', 'Transport', 'expense', '#38bdf8', 'Car', true),
    ('utilities', 'Utilities', 'expense', '#facc15', 'Zap', true),
    ('entertainment', 'Entertainment', 'expense', '#f472b6', 'Clapperboard', true),
    ('shopping', 'Shopping', 'expense', '#fb7185', 'ShoppingBag', true),
    ('health', 'Health & fitness', 'expense', '#f87171', 'HeartPulse', true),
    ('education', 'Education', 'expense', '#60a5fa', 'GraduationCap', true),
    ('subscriptions', 'Subscriptions', 'expense', '#e2e8f0', 'Repeat', true),
    ('travel', 'Travel', 'expense', '#22d3ee', 'Plane', true),
    ('home-goods', 'Home & decor', 'expense', '#fcd34d', 'Armchair', true),
    ('other', 'Other', 'expense', '#94a3b8', 'MoreHorizontal', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

CREATE TRIGGER update_transactions_timestamp
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

-- 6. Budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE,
    limit_amount NUMERIC(12, 2) NOT NULL CHECK (limit_amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    CONSTRAINT budgets_user_category_unique UNIQUE (user_id, category_id)
);

CREATE TRIGGER update_budgets_timestamp
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

-- 7. Savings Goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    saved_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (saved_amount >= 0),
    deadline DATE NOT NULL,
    color TEXT NOT NULL DEFAULT '#2dd4bf',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

CREATE TRIGGER update_goals_timestamp
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON public.transactions(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions(user_id, type);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- 9. Automatic new user trigger to populate public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- SpendSense Sample Seed Script (Safe for Development)
-- Note: Replace '<USER_UUID>' with an actual auth.users UUID when testing manually
-- in a local or staging Supabase project.
-- =============================================================================

-- Ensure system categories are present
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


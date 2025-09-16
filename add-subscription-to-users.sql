-- Add subscription status to existing users
-- Run this in your Supabase SQL Editor

-- 1. Add subscription columns to auth.users (if possible) or create a user_profiles table
-- Since we can't modify auth.users directly, let's create a user_profiles table

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Create function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Create function to update subscription status
CREATE OR REPLACE FUNCTION public.update_user_subscription(
    user_email TEXT,
    status TEXT,
    stripe_customer_id TEXT DEFAULT NULL,
    stripe_subscription_id TEXT DEFAULT NULL,
    start_date TIMESTAMPTZ DEFAULT NULL,
    end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_profiles
    SET 
        subscription_status = status,
        stripe_customer_id = COALESCE(update_user_subscription.stripe_customer_id, user_profiles.stripe_customer_id),
        stripe_subscription_id = COALESCE(update_user_subscription.stripe_subscription_id, user_profiles.stripe_subscription_id),
        subscription_start_date = COALESCE(update_user_subscription.start_date, user_profiles.subscription_start_date),
        subscription_end_date = COALESCE(update_user_subscription.end_date, user_profiles.subscription_end_date),
        updated_at = NOW()
    WHERE email = user_email;
    
    -- If no rows were updated, create a new profile
    IF NOT FOUND THEN
        INSERT INTO public.user_profiles (email, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_start_date, subscription_end_date)
        VALUES (user_email, status, stripe_customer_id, stripe_subscription_id, start_date, end_date);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to get user subscription status
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_email TEXT)
RETURNS TABLE (
    subscription_status TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.subscription_status,
        up.stripe_customer_id,
        up.stripe_subscription_id,
        up.subscription_start_date,
        up.subscription_end_date
    FROM public.user_profiles up
    WHERE up.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create existing users' profiles (for users who already exist)
INSERT INTO public.user_profiles (id, email, subscription_status)
SELECT 
    au.id,
    au.email,
    'free' as subscription_status
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = au.id
);

-- 9. Enable realtime for user_profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;

-- 10. Verify the setup
SELECT 'User profiles created:' as info;
SELECT COUNT(*) as total_profiles FROM public.user_profiles;

SELECT 'Sample profiles:' as info;
SELECT email, subscription_status, created_at FROM public.user_profiles LIMIT 5;

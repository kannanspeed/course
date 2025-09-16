-- Stripe Subscription Setup for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    status TEXT NOT NULL, -- active, canceled, past_due, etc.
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription features table
CREATE TABLE public.subscription_features (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL, -- 'premium_tasks', 'unlimited_tasks', etc.
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions table
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for subscription features table
CREATE POLICY "Users can view own subscription features" ON public.subscription_features
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription features" ON public.subscription_features
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription features" ON public.subscription_features
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE email = auth.jwt() ->> 'email' 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can view all subscription features" ON public.subscription_features
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE email = auth.jwt() ->> 'email' 
            AND is_admin = true
        )
    );

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.subscriptions 
        WHERE user_id = user_uuid 
        AND status = 'active' 
        AND current_period_end > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user subscription status
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_uuid UUID)
RETURNS TABLE (
    has_subscription BOOLEAN,
    subscription_status TEXT,
    current_period_end TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE WHEN s.id IS NOT NULL THEN true ELSE false END as has_subscription,
        COALESCE(s.status, 'none') as subscription_status,
        s.current_period_end
    FROM auth.users u
    LEFT JOIN public.subscriptions s ON u.id = s.user_id 
        AND s.status = 'active' 
        AND s.current_period_end > NOW()
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscription_features_user_id ON public.subscription_features(user_id);

-- Insert default subscription features for existing users
INSERT INTO public.subscription_features (user_id, feature_name, is_active)
SELECT 
    u.id,
    'premium_tasks',
    false
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.subscription_features sf 
    WHERE sf.user_id = u.id AND sf.feature_name = 'premium_tasks'
);

-- Verify the setup
SELECT 'Subscriptions table created successfully' as status;
SELECT 'Subscription features table created successfully' as status;
SELECT 'RLS policies created successfully' as status;
SELECT 'Helper functions created successfully' as status;

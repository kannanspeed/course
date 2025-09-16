-- Complete Subscription Setup (for existing tables)
-- Run this SQL in your Supabase SQL Editor

-- Check if functions exist and create them if they don't
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_features_user_id ON public.subscription_features(user_id);

-- Insert default subscription features for existing users (if not already exists)
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
SELECT 'Functions created successfully' as status;
SELECT 'Indexes created successfully' as status;
SELECT 'Default features inserted successfully' as status;

-- Test the functions
SELECT 'Testing functions...' as status;
SELECT public.has_active_subscription(auth.uid()) as test_result;


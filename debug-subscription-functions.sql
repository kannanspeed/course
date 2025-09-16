-- Debug subscription functions
-- Run this SQL to check what's wrong

-- Check if the functions exist
SELECT 
    routine_name, 
    routine_type, 
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('has_active_subscription', 'get_user_subscription_status');

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'subscription_features');

-- Test the function directly
SELECT public.has_active_subscription('00000000-0000-0000-0000-000000000000'::uuid) as test_result;

-- Check current user
SELECT auth.uid() as current_user_id;

-- Check if user exists in auth.users
SELECT id, email FROM auth.users WHERE email = 'kannan9486542476@gmail.com';


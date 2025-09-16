-- Verify Admin Setup
-- Run this in your Supabase SQL Editor to check if everything is set up correctly

-- 1. Check if admin_users table exists and has your email
SELECT 'Admin Users Table Check:' as check_type;
SELECT * FROM admin_users WHERE email = 'kannan9486542476@gmail.com';

-- 2. Check all admin users
SELECT 'All Admin Users:' as check_type;
SELECT * FROM admin_users;

-- 3. Check if RLS policies are set up correctly
SELECT 'RLS Policies Check:' as check_type;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('tasks', 'admin_users');

-- 4. Test if you can query admin_users table (this should work for admin)
SELECT 'Admin Query Test:' as check_type;
SELECT email, is_admin FROM admin_users WHERE email = 'kannan9486542476@gmail.com';

-- 5. Check current user context
SELECT 'Current User Context:' as check_type;
SELECT auth.jwt() ->> 'email' as current_user_email;


-- Fix the infinite recursion issue in admin_users policies
-- Run this in your Supabase SQL Editor

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Create a simpler policy that doesn't cause recursion
-- Allow users to check their own admin status
CREATE POLICY "Users can check own admin status" ON public.admin_users
    FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Also, let's make sure the tasks policies are working correctly
-- Drop and recreate the tasks policies to ensure they work with the fixed admin_users policy
DROP POLICY IF EXISTS "Users can view own tasks or admins can view all" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks or admins can update all" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks or admins can delete all" ON public.tasks;

-- Recreate the tasks policies
CREATE POLICY "Users can view own tasks or admins can view all" ON public.tasks
    FOR SELECT USING (
        auth.jwt() ->> 'email' = email OR
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE email = auth.jwt() ->> 'email' 
            AND is_admin = true
        )
    );

CREATE POLICY "Users can update own tasks or admins can update all" ON public.tasks
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = email OR
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE email = auth.jwt() ->> 'email' 
            AND is_admin = true
        )
    );

CREATE POLICY "Users can delete own tasks or admins can delete all" ON public.tasks
    FOR DELETE USING (
        auth.jwt() ->> 'email' = email OR
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE email = auth.jwt() ->> 'email' 
            AND is_admin = true
        )
    );

-- Verify the setup
SELECT 'Admin users table:' as info;
SELECT * FROM admin_users;

SELECT 'RLS policies:' as info;
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('tasks', 'admin_users');


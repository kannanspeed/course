-- Fix admin setup for kannangod123@gmail.com
-- Run this in your Supabase SQL Editor

-- 1. Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can check own admin status" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- 4. Create simple policy that allows users to check their own admin status
CREATE POLICY "Users can check own admin status" ON public.admin_users
    FOR SELECT USING (email = auth.jwt() ->> 'email');

-- 5. Insert or update the admin user
INSERT INTO public.admin_users (email, is_admin)
VALUES ('kannangod123@gmail.com', true)
ON CONFLICT (email) 
DO UPDATE SET is_admin = true;

-- 6. Verify the setup
SELECT 'Admin users table check:' as info;
SELECT * FROM public.admin_users WHERE email = 'kannangod123@gmail.com';

-- 7. Check RLS policies
SELECT 'RLS policies check:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'admin_users';

# Admin Functionality Test Guide

## How to Test the Admin Functionality

### 1. Test with Admin Account (kannan9486542476@gmail.com)

1. **Sign up/Sign in** with your admin email: `kannan9486542476@gmail.com`
2. **Verify Admin Status**:
   - You should see "ADMIN" badge in the header
   - You should see "🔑 ADMIN MODE" indicator in the task manager
   - You should see "Admin Panel" section with total task count

3. **Test Admin Capabilities**:
   - Create a task with your admin account
   - You should see your email displayed next to the task title
   - You should be able to edit and delete your own tasks

### 2. Test with Normal User Account

1. **Create a new account** with a different email (e.g., `testuser@example.com`)
2. **Sign in** with the normal user account
3. **Verify Normal User Experience**:
   - You should NOT see "ADMIN" badge in the header
   - You should NOT see "🔑 ADMIN MODE" indicator
   - You should NOT see "Admin Panel" section
   - You should only see your own tasks

4. **Create tasks** with the normal user account

### 3. Test Admin Viewing All Tasks

1. **Sign out** from the normal user account
2. **Sign in** with your admin account (`kannan9486542476@gmail.com`)
3. **Verify Admin Can See All Tasks**:
   - You should see tasks from BOTH admin and normal user accounts
   - Each task should show the user's email who created it
   - You should be able to edit and delete ANY task (from any user)

### 4. Test Security

1. **Sign in** with normal user account
2. **Try to access admin features**:
   - Normal user should NOT be able to see other users' tasks
   - Normal user should NOT be able to edit/delete other users' tasks
   - This is enforced at the database level (Row Level Security)

## Expected Results

### Admin Account (kannan9486542476@gmail.com):
- ✅ Can see ALL tasks from ALL users
- ✅ Can edit/delete ANY task
- ✅ Shows admin indicators in UI
- ✅ Each task shows the creator's email

### Normal User Account:
- ✅ Can only see their own tasks
- ✅ Can only edit/delete their own tasks
- ✅ No admin indicators shown
- ✅ Cannot access other users' tasks

## Troubleshooting

If something doesn't work:

1. **Check Database**: Verify your email is in the `admin_users` table with `is_admin = true`
2. **Check Console**: Look for any error messages in browser console
3. **Check Network**: Verify API calls are working in browser dev tools
4. **Check RLS Policies**: Ensure the database policies are correctly set up

## Database Verification

Run this SQL in Supabase to verify admin setup:

```sql
-- Check if admin user exists
SELECT * FROM admin_users WHERE email = 'kannan9486542476@gmail.com';

-- Check all tasks (should show all tasks for admin)
SELECT * FROM tasks ORDER BY created_at DESC;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'tasks';
```


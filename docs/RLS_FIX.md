# User Signup RLS Issue Fix

## Problem
The error "new row violates row-level security policy for table 'users'" occurs during user signup because the Row Level Security (RLS) policies on the `users` table are missing an INSERT policy.

## Root Cause
The database schema has RLS enabled for the `users` table with policies for SELECT and UPDATE, but no INSERT policy. When a new user tries to sign up, the `handle_new_user()` trigger function attempts to insert a new row into the `users` table, but RLS blocks this operation.

## Solution
Execute the following SQL in your Supabase SQL Editor to add the missing INSERT policy:

```sql
-- Add INSERT policy to allow user creation during signup
CREATE POLICY "Enable user signup" ON users FOR INSERT WITH CHECK (true);
```

Or run the complete migration from `supabase/migrations/003_fix_user_signup_rls.sql`.

## How to Apply the Fix

### Method 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the SQL from `supabase/migrations/003_fix_user_signup_rls.sql`
4. Click **Run** to execute

### Method 2: Using the Project Script
```bash
npm run db:fix-rls
```
This will display the SQL you need to copy and paste into Supabase.

## Verification
After applying the fix:
1. Try signing up a new user
2. The signup should complete successfully
3. Check the `users` table to confirm the new user was created

## Technical Details
- The `handle_new_user()` function is triggered when a new user is created in `auth.users`
- This function inserts a corresponding record in the `public.users` table
- Without the INSERT policy, RLS blocks this operation
- The fix allows any user creation (INSERT) while maintaining security for other operations

## Files Modified
- `supabase/migrations/003_fix_user_signup_rls.sql` - New migration file
- `scripts/apply-rls-fix.js` - Script to help apply the fix
- `package.json` - Added `db:fix-rls` script

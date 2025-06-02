# Authentication Troubleshooting Guide

## Issue: "Invalid login credentials" Error

### Root Cause
The login error is caused by **email confirmation being required**. Your user account was created successfully but hasn't been email confirmed yet.

### Diagnosis Results
- ✅ User exists in both `auth.users` and `public.users` tables
- ❌ Email confirmation status: **Not confirmed** (`email_confirmed_at` is null)
- ⚠️  Confirmation email was sent but not acted upon

## Solutions

### 🎯 Option 1: Disable Email Confirmation (Recommended for Development)

**Steps:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Settings**
4. Find **"Enable email confirmations"** 
5. **Turn it OFF**
6. Save changes

**Result:** Users can sign in immediately without email confirmation.

### 🎯 Option 2: Manually Confirm Existing User

**Execute this SQL in Supabase SQL Editor:**
```sql
-- Confirm specific user
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'shubhorai12@gmail.com';

-- Or confirm all unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

### 🎯 Option 3: Implement Proper Email Confirmation Flow

If you want to keep email confirmation enabled:

1. **Set up email templates** in Supabase
2. **Configure SMTP** for email delivery
3. **Add confirmation page** to handle email confirmation links
4. **Show pending confirmation message** after signup

## Scripts Available

```bash
# Diagnose authentication issues
npm run auth:diagnose

# Get email confirmation fix instructions
npm run auth:fix-email
```

## Code Changes Made

### Fixed Duplicate User Creation
- **Issue:** Both trigger function and manual insert were creating user profiles
- **Fix:** Removed manual insertion from `useAuth.signUp()` 
- **Result:** Only the trigger function `handle_new_user()` creates user profiles now

### Updated signup to use user metadata
```typescript
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      username,
      full_name: full_name || ''
    }
  }
})
```

## Testing the Fix

1. **Apply one of the solutions above**
2. **Try logging in** with your existing credentials:
   - Email: `shubhorai12@gmail.com`
   - Password: (your password)
3. **Should redirect to dashboard** on successful login

## Prevention for Future

- Set email confirmation preference during development setup
- Add proper error handling for unconfirmed accounts
- Implement email confirmation UI if keeping confirmations enabled
- Add clear messaging about email confirmation requirements

## Related Files
- `lib/hooks/useAuth.ts` - Fixed duplicate user creation
- `scripts/diagnose-auth.js` - Authentication diagnostic tool
- `scripts/fix-email-confirmation.js` - Email confirmation fix helper

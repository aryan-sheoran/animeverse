# Quick Test Guide

## Before Testing

Make sure both apps are running:

```bash
# Terminal 1 - Server (port 3000)
cd /home/luffy/animeverse/apps/server
npm run dev

# Terminal 2 - Web (port 3001)
cd /home/luffy/animeverse/apps/web
npm run dev
```

## Test Scenario: Complete Password Reset Flow

### Step 1: Create a Test Account (if you don't have one)

1. Go to: http://localhost:3001/signup
2. Fill in:
   - Email: `test@example.com`
   - Password: `oldpassword123`
   - Username: `testuser`
3. Click "Sign Up"
4. Should redirect to `/hub`

### Step 2: Logout (if logged in)

Just close the tab or clear cookies, or navigate to a route that triggers logout

### Step 3: Test Forgot Password

1. Go to: http://localhost:3001/forgot-password
2. Enter email: `test@example.com`
3. Click "Send Reset Link"
4. Should see success message: "Password reset link sent! Check your email and server console logs."

### Step 4: Get Reset Token from Server Logs

**IMPORTANT**: Look at your server terminal (Terminal 1). You should see output like:

```
========== PASSWORD RESET REQUEST ==========
User: test@example.com
Reset URL: http://localhost:3000/forgot-password?token=ABC123XYZ...
Token: ABC123XYZ...
==========================================
```

### Step 5: Use the Reset Link

**Option A (Recommended)**:

- Copy the full Reset URL from server logs
- Change `http://localhost:3000` to `http://localhost:3001` (web app port)
- Example: `http://localhost:3001/forgot-password?token=ABC123XYZ...`
- Paste into browser

**Option B**:

- Copy just the token value
- Manually build URL: `http://localhost:3001/forgot-password?token=PASTE_TOKEN_HERE`

### Step 6: Set New Password

1. You should see the "Set New Password" form
2. Enter:
   - New Password: `newpassword456`
   - Confirm Password: `newpassword456`
3. Click "Reset Password"
4. Should see: "Password reset successful! Redirecting to login..."
5. Should auto-redirect to `/login` after 2 seconds

### Step 7: Login with New Password

1. At login page, enter:
   - Username: `testuser`
   - Password: `newpassword456` (the NEW password)
2. Click "Login"
3. Should successfully login and redirect to `/hub`

## Expected Results

✅ Password reset successful
✅ Can login with new password
✅ Old password no longer works

## Troubleshooting

### Problem: "Failed to send reset email"

- Check that email exists in database
- Check server logs for errors

### Problem: "Invalid or expired reset link"

- Token might have expired (default: 1 hour)
- Request new reset link
- Make sure you're using the correct URL (port 3001 for web app)

### Problem: "Login failed" after reset

- Make sure you're using the NEW password
- Check server logs for detailed error
- Try the full flow again from Step 3

### Problem: Can't see reset URL in logs

- Make sure server terminal is visible (Terminal 1)
- Check that `console.log` hasn't been disabled
- Verify `sendResetPassword` is configured in `auth.ts`

### Problem: "Internal server error"

- Check server terminal for detailed error
- Verify MongoDB connection is working
- Make sure Better Auth is properly configured

## Database Verification (Optional)

If you want to verify in MongoDB directly:

```javascript
// Connect to your MongoDB
// Find user
db.user.findOne({ email: "test@example.com" });

// Find account (contains password hash)
db.account.findOne({ userId: "USER_ID_FROM_ABOVE" });
// Should see: providerId: "credential", password: "HASH.SALT"
```

The password field format: `SCRYPT_HASH.SALT`

## Next Steps After Successful Test

1. ✅ Verify login works with new password
2. ✅ Verify old password doesn't work anymore
3. ✅ Test password reset multiple times to ensure consistency
4. 🔧 Implement email sending for production (see FIX_SUMMARY.md)
5. 🔧 Add rate limiting to prevent abuse
6. 🔧 Add better error handling and user feedback

## Production Deployment Checklist

Before going to production:

- [ ] Replace console.log with actual email service in `sendResetPassword`
- [ ] Configure proper CORS origins in `auth.ts`
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Add rate limiting on auth endpoints
- [ ] Test with real email addresses
- [ ] Update environment variables for production URLs
- [ ] Enable email verification for new signups (optional but recommended)

---

**All tests passing?** Great! Your authentication system is now using Better Auth's proper, secure password reset flow! 🎉

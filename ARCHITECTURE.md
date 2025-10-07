# Authentication Architecture - Before vs After

## The Problem

Your forgot password and login system had a critical security flaw where password reset bypassed Better Auth's security mechanisms.

## Before (Broken Implementation)

### Password Reset Flow - INSECURE ❌

```
User enters email + username
    ↓
Custom /api/auth/verify-identity route
    ↓
Manual MongoDB query to verify user
    ↓
User enters new password
    ↓
Custom /api/auth/reset-password route
    ↓
Manual password hashing with scrypt
    ↓
Direct MongoDB update of account.password
```

**Problems:**

1. ❌ No token-based security - anyone with email+username could reset
2. ❌ Manual password hashing might not match Better Auth's format
3. ❌ Password salt format might be incorrect
4. ❌ No expiration on reset requests
5. ❌ Bypassed Better Auth's security features
6. ❌ Hard to maintain - duplicated password logic

### Why Login Failed After Reset

```
Password Reset: Manual scrypt hash → "HASH1.SALT1"
Login Attempt: Better Auth scrypt verify → Expected "HASH2.SALT2" format
Result: MISMATCH → "Login failed" error
```

The manual hashing created a password hash in a slightly different format than what Better Auth expected, causing verification to fail.

## After (Secure Implementation) ✅

### Password Reset Flow - SECURE ✅

```
User enters email
    ↓
authClient.forgetPassword()
    ↓
Better Auth generates secure token
    ↓
Better Auth calls sendResetPassword callback
    ↓
Email sent with: /forgot-password?token=SECURE_TOKEN
    ↓
User clicks link with token
    ↓
User enters new password
    ↓
authClient.resetPassword({ token, newPassword })
    ↓
Better Auth validates token (not expired, correct user)
    ↓
Better Auth hashes password correctly
    ↓
Better Auth updates database
    ↓
Better Auth invalidates token
```

**Benefits:**

1. ✅ Token-based security (can't reset without valid token)
2. ✅ Consistent password hashing with Better Auth
3. ✅ Automatic token expiration (1 hour default)
4. ✅ One source of truth for password handling
5. ✅ Secure, battle-tested implementation
6. ✅ Easy to maintain - no duplicate code

### Why Login Works Now

```
Password Reset: Better Auth scrypt hash → "HASH.SALT"
Login Attempt: Better Auth scrypt verify → Expected "HASH.SALT" format
Result: MATCH ✅ → Login successful!
```

Both operations use the same Better Auth code, ensuring compatibility.

## Code Changes

### Deleted Files (Custom Routes)

```
apps/server/src/app/api/auth/
  ├── verify-identity/route.ts  ❌ DELETED
  └── reset-password/route.ts   ❌ DELETED
```

**Why deleted**: These bypassed Better Auth's security

### Modified Files

#### 1. `forgot-password/page.tsx` - Complete Rewrite

**Before:**

```tsx
// Step 1: Custom verify identity
fetch("/api/auth/verify-identity", {
  body: { email, username },
});

// Step 2: Custom reset password
fetch("/api/auth/reset-password", {
  body: { email, username, newPassword },
});
```

**After:**

```tsx
// Step 1: Request reset (sends email with token)
await authClient.forgetPassword({
  email,
  redirectTo: "/forgot-password",
});

// Step 2: Reset with token from URL
await authClient.resetPassword({
  newPassword,
  token: searchParams.get("token"),
});
```

#### 2. `auth.ts` - Already Had Configuration ✅

```typescript
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      // In dev: logs to console
      // In prod: send email
      console.log(`Reset URL: ${url}`);
    },
  },
  plugins: [username()],
  // ... rest of config
});
```

This was already correctly configured!

## Security Improvements

### Token-Based Reset

**Before**:

- Verify identity: just email + username (both might be public)
- Reset password: no additional verification
- **Risk**: Anyone knowing your email/username could reset password

**After**:

- Request reset: generates unique, time-limited token
- Token sent only to registered email
- Reset requires valid token
- **Security**: Need access to email account to reset

### Password Hashing

**Before**:

```typescript
// Manual implementation
const salt = randomBytes(16).toString("hex");
const buf = await scrypt(password, salt, 64);
const hashedPassword = `${buf.toString("hex")}.${salt}`;
```

**After**:

```typescript
// Better Auth handles it internally
// Uses same algorithm but with consistent format
// No manual implementation needed
```

### Token Expiration

**Before**: None - reset link could work forever

**After**: Default 1 hour expiration (configurable)

```typescript
// In auth.ts (optional)
emailAndPassword: {
  resetPasswordTokenExpiresIn: 3600, // seconds
}
```

## Database Schema

Better Auth manages these collections:

### `user` Collection

```json
{
  "_id": "user-id",
  "email": "user@example.com",
  "name": "Test User",
  "username": "testuser", // from username() plugin
  "displayUsername": "TestUser", // from username() plugin
  "emailVerified": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### `account` Collection

```json
{
  "_id": "account-id",
  "userId": "user-id",
  "providerId": "credential", // email/password auth
  "password": "hash.salt", // scrypt hashed
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### `session` Collection

```json
{
  "_id": "session-id",
  "userId": "user-id",
  "token": "session-token",
  "expiresAt": "2024-01-08T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### `verificationToken` Collection (for password resets)

```json
{
  "_id": "token-id",
  "identifier": "user-email",
  "token": "reset-token",
  "expiresAt": "2024-01-01T01:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## API Endpoints

### Built-in Better Auth Endpoints

Now using these official Better Auth endpoints:

```
POST /api/auth/sign-in/username
POST /api/auth/sign-up/email
POST /api/auth/sign-out
POST /api/auth/forgot-password      ← New (replaces verify-identity)
POST /api/auth/reset-password       ← New (Better Auth's version)
GET  /api/auth/session
```

### Custom Endpoints (Removed)

```
POST /api/auth/verify-identity  ❌ DELETED
POST /api/auth/reset-password   ❌ DELETED (custom version)
```

## Flow Diagrams

### Login Flow (Always Worked)

```
User → Login Page → authClient.signIn.username()
                           ↓
                    Better Auth validates
                           ↓
                    Check password hash
                           ↓
                    Create session
                           ↓
                    Return session cookie
                           ↓
                    Redirect to /hub
```

### Password Reset Flow (Now Fixed)

```
User → Forgot Password Page
         ↓
         Enter email
         ↓
authClient.forgetPassword()
         ↓
Better Auth generates token
         ↓
sendResetPassword callback
         ↓
Email sent (or logged in dev)
         ↓
User clicks link with token
         ↓
/forgot-password?token=XXX
         ↓
Enter new password
         ↓
authClient.resetPassword({ token, newPassword })
         ↓
Better Auth validates token
         ↓
Better Auth hashes password
         ↓
Better Auth updates account
         ↓
Redirect to login
         ↓
Login with new password ✅
```

## Key Takeaways

1. **Never bypass authentication library's built-in methods**

   - Libraries like Better Auth have battle-tested security
   - Manual implementations introduce vulnerabilities

2. **Use token-based password resets**

   - More secure than just email+username verification
   - Prevents unauthorized password resets

3. **Let the library handle password hashing**

   - Ensures consistent format
   - Avoids subtle bugs like the login failure

4. **Follow the library's recommended patterns**

   - Better Auth has clear documentation
   - Saves time and prevents security issues

5. **Development vs Production**
   - Dev: Log reset links to console
   - Prod: Send actual emails
   - Easy to switch by updating sendResetPassword

## Next Steps

1. ✅ Test the complete flow (see TEST_GUIDE.md)
2. 🔧 Implement email sending for production
3. 🔧 Add rate limiting
4. 🔧 Consider adding 2FA (Better Auth supports this)
5. 🔧 Add email verification for new signups

---

**Result**: Secure, maintainable authentication system using Better Auth's proven methods! 🔒✨

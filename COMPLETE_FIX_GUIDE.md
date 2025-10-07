# Complete Fix Guide for 500 Login Error

## 🔍 Current Situation

You're getting a **500 Internal Server Error** because:

1. ✅ Local code is fixed
2. ❌ **Vercel deployment** still has the old buggy code
3. ❌ Database may be missing username fields

## 🎯 Three-Step Solution

### Step 1: Migrate Database (Add Username Fields)

Your database needs `username` and `displayUsername` fields for existing users.

```bash
cd /home/luffy/animeverse/apps/server

# Run the migration script
npm run tsx src/scripts/migrate-username.ts
```

This will:

- Add `username` field to all existing users
- Add `displayUsername` field
- Use existing `name` field or email prefix as username

### Step 2: Test Locally First

Before deploying, test everything works locally:

```bash
# Terminal 1: Start the server
cd /home/luffy/animeverse/apps/server
npm run dev

# Terminal 2: Start the web app
cd /home/luffy/animeverse/apps/web
npm run dev

# The web app should connect to http://localhost:3000 (as per .env)
```

Then test:

1. Go to `http://localhost:3001/login`
2. Try logging in with username + password
3. Should work! ✅

### Step 3: Deploy to Vercel

Once local testing works, deploy the fixed code:

```bash
cd /home/luffy/animeverse

# Commit the changes
git add .
git commit -m "fix: resolve username plugin schema conflict causing 500 error"
git push origin master

# This will automatically trigger Vercel deployment
```

## 🔧 Alternative: Run Migration Directly in MongoDB

If the script doesn't work, manually update the database:

### Option A: MongoDB Atlas UI

1. Go to MongoDB Atlas
2. Browse Collections → `user` collection
3. For each user document, add:
   ```json
   {
     "username": "<lowercase_username>",
     "displayUsername": "<original_username>"
   }
   ```

### Option B: MongoDB Shell

```javascript
// Connect to your MongoDB
use your_database_name;

// Update all users without username field
db.user.find({ username: { $exists: false } }).forEach(function(user) {
    var username = user.name || user.email.split('@')[0];
    db.user.updateOne(
        { _id: user._id },
        {
            $set: {
                username: username.toLowerCase(),
                displayUsername: username,
                updatedAt: new Date()
            }
        }
    );
    print("Updated: " + user.email);
});

// Verify
db.user.find({}, { email: 1, username: 1, displayUsername: 1 }).limit(5);
```

## 📝 Verification Checklist

Before deploying, verify:

- [ ] `/apps/server/src/lib/auth.ts` - username NOT in additionalFields ✅
- [ ] `/apps/server/src/lib/auth.ts` - `plugins: [username()]` present ✅
- [ ] Database - All users have `username` field
- [ ] Database - All users have `displayUsername` field
- [ ] Local server starts without errors
- [ ] Local login works
- [ ] Changes committed to git
- [ ] Vercel deployment triggered

## 🚨 Common Issues & Solutions

### Issue 1: "username already exists" error

**Cause:** Username field duplicated in schema  
**Solution:** ✅ Already fixed in auth.ts

### Issue 2: "user not found" during login

**Cause:** Database missing username fields  
**Solution:** Run migration script (Step 1 above)

### Issue 3: Still getting 500 on Vercel

**Cause:** Old code still deployed  
**Solutions:**

1. Check Vercel dashboard → Latest deployment time
2. Force redeploy: Vercel Dashboard → Deployments → Redeploy
3. Check Vercel logs for actual error message

### Issue 4: Local works but Vercel doesn't

**Possible causes:**

- Environment variables not set on Vercel
- Database not accessible from Vercel
- Different build configuration

**Check:**

```bash
# Verify Vercel environment variables
vercel env ls

# Should have:
# - DATABASE_URL
# - CORS_ORIGIN
# - BETTER_AUTH_SECRET
# - BETTER_AUTH_URL
```

## 🔬 Debug: Check Vercel Logs

1. Go to Vercel Dashboard
2. Select your project → Deployments
3. Click latest deployment → Function Logs
4. Look for the actual error message

Common errors you might see:

- "username field is required" → Database migration needed
- "duplicate field" → Schema conflict (already fixed)
- "Cannot find module" → Build issue

## 📊 Expected Database Schema

After migration, each user document should look like:

```json
{
  "_id": "user_123",
  "email": "user@example.com",
  "name": "TestUser",
  "username": "testuser", // ← Added by migration (lowercase)
  "displayUsername": "TestUser", // ← Added by migration (original case)
  "emailVerified": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-07T00:00:00.000Z"
}
```

And in the `account` collection:

```json
{
  "_id": "account_123",
  "userId": "user_123",
  "providerId": "credential", // ← Important for email/password
  "password": "hashed_password", // ← Password stored here
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-07T00:00:00.000Z"
}
```

## 🎯 Quick Commands

```bash
# 1. Migrate database
cd /home/luffy/animeverse/apps/server && npm run tsx src/scripts/migrate-username.ts

# 2. Test locally
cd /home/luffy/animeverse/apps/server && npm run dev
# In another terminal:
cd /home/luffy/animeverse/apps/web && npm run dev

# 3. Deploy to Vercel
cd /home/luffy/animeverse
git add . && git commit -m "fix: username plugin configuration" && git push

# 4. Check Vercel deployment status
vercel ls
```

## ✅ Success Criteria

You'll know it's working when:

1. ✅ Server starts without errors
2. ✅ Login returns 200 (or 401 for wrong password, not 500)
3. ✅ You can login with username + password
4. ✅ Password reset works
5. ✅ All auth flows functional

---

**Current Status:** Code fixed ✅, Database needs migration ⚠️, Deployment needed 🚀  
**Next Actions:**

1. Run database migration
2. Test locally
3. Deploy to Vercel

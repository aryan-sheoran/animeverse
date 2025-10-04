# 🚀 AnimeVerse Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- Git

## Step-by-Step Setup

### 1. Environment Configuration

Create `.env` file in `apps/server/`:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/animeverse
# Or for MongoDB Atlas:
# DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/animeverse

# CORS & Server
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3001

# Better Auth (automatically managed)
BETTER_AUTH_SECRET=<will be generated>
```

### 2. Install Dependencies

```bash
cd apps/server
npm install
```

If you need to add tsx for the seed script:

```bash
npm install -D tsx
```

### 3. Start MongoDB

**Local MongoDB:**

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**MongoDB Atlas:**

- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Get connection string and update DATABASE_URL

### 4. Seed the Database

```bash
npm run seed
```

This will:

- Clear existing data
- Insert 12 anime shows with complete information
- Create homepage featured items
- Set up initial data for testing

### 5. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3001`

### 6. Verify Installation

Test the API:

```bash
# Health check
curl http://localhost:3001/api/healthCheck

# Get all shows
curl http://localhost:3001/api/shows

# Get home items
curl http://localhost:3001/api/home
```

### 7. Frontend Setup

In `apps/web/.env`:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

Then start the web app:

```bash
cd apps/web
npm run dev
```

## 🧪 Testing the API

### REST API Examples

**Get all shows:**

```bash
curl http://localhost:3001/api/shows
```

**Get show by ID:**

```bash
curl http://localhost:3001/api/shows/<show-id>
```

**Search shows:**

```bash
curl "http://localhost:3001/api/shows?search=naruto&limit=5"
```

**Get reviews for a show:**

```bash
curl http://localhost:3001/api/reviews/anime/<show-id>
```

### ORPC Examples (from frontend)

```typescript
import { client } from "@/utils/orpc";

// Get shows
const shows = await client.shows.getAll({
  limit: 10,
  sortBy: "rating",
});

// Create review (requires auth)
const review = await client.reviews.create({
  showId: "show-id",
  title: "Amazing anime!",
  content: "This is one of the best...",
  rating: 9,
});

// Add show to user's list (requires auth)
const userShow = await client.userShows.addShow({
  showId: "show-id",
  status: "watching",
  isFavorite: true,
});
```

## 📁 Directory Structure After Setup

```
apps/server/
├── .env                          ✅ Created
├── src/
│   ├── app/api/                  ✅ REST API routes
│   ├── db/models/                ✅ Database models
│   ├── lib/                      ✅ Auth & ORPC setup
│   ├── middleware/               ✅ Auth & upload middleware
│   ├── routers/                  ✅ ORPC routers
│   └── scripts/seed.ts           ✅ Seeding script
└── public/uploads/               📁 Will be created on first upload
```

## 🔍 Troubleshooting

### Database Connection Issues

**Error: "Error connecting to database"**

Solution:

1. Check MongoDB is running: `mongosh` (should connect)
2. Verify DATABASE_URL in .env
3. For Atlas, check IP whitelist

### Port Already in Use

**Error: "Port 3001 is already in use"**

Solution:

```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### Authentication Issues

**Error: "UNAUTHORIZED"**

Solution:

1. Check CORS_ORIGIN matches frontend URL
2. Verify cookies are being sent (credentials: 'include')
3. Check Better Auth configuration

### Seeding Fails

**Error during npm run seed**

Solution:

1. Ensure MongoDB is running
2. Check DATABASE_URL
3. Verify write permissions
4. Clear database manually:

```bash
mongosh animeverse
db.dropDatabase()
```

## 🧹 Maintenance Commands

### Clear Database

```bash
mongosh animeverse
db.dropDatabase()
```

### Re-seed Database

```bash
npm run seed
```

### View Database

```bash
mongosh animeverse
show collections
db.shows.find().pretty()
```

### Backup Database

```bash
mongodump --db animeverse --out ./backup
```

### Restore Database

```bash
mongorestore --db animeverse ./backup/animeverse
```

## 🔐 Production Deployment

### Environment Variables for Production

```env
DATABASE_URL=mongodb+srv://...  # Production MongoDB
CORS_ORIGIN=https://yourdomain.com
NEXT_PUBLIC_SERVER_URL=https://api.yourdomain.com
BETTER_AUTH_SECRET=<generate-strong-secret>
NODE_ENV=production
```

### Generate Secure Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Build for Production

```bash
npm run build
npm start
```

### Recommended Production Setup

1. **Use MongoDB Atlas** - Managed, scalable MongoDB
2. **Enable Database Indexes** - Already configured in models
3. **Set up SSL/TLS** - For secure connections
4. **Use Redis** - For rate limiting and caching
5. **Enable Logging** - Use Winston or Pino
6. **Monitor Performance** - Use New Relic or DataDog
7. **Set up CI/CD** - GitHub Actions, Vercel, etc.

## 📊 Database Monitoring

### Check Database Size

```bash
mongosh animeverse
db.stats()
```

### View Collections

```bash
show collections
```

### Count Documents

```bash
db.shows.countDocuments()
db.reviews.countDocuments()
db.users.countDocuments()
```

### Check Indexes

```bash
db.shows.getIndexes()
```

## 🎯 Next Steps

1. ✅ Backend is running
2. ✅ Database is seeded
3. ✅ API is accessible
4. 🔄 Test frontend integration
5. 🔄 Add user authentication on frontend
6. 🔄 Test all CRUD operations
7. 🔄 Implement file uploads
8. 🔄 Add error boundaries on frontend
9. 🔄 Set up production deployment

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Better Auth Docs](https://www.better-auth.com/)
- [ORPC Documentation](https://orpc.dev/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)

## 🆘 Support

If you encounter issues:

1. Check the API_DOCUMENTATION.md for detailed API reference
2. Check the BACKEND_IMPLEMENTATION.md for architecture overview
3. Review console logs for error messages
4. Verify all environment variables are set
5. Ensure MongoDB is running and accessible

## ✨ Success!

Your backend is now fully configured and ready to power your AnimeVerse application! 🎉

All endpoints are documented in `API_DOCUMENTATION.md`.

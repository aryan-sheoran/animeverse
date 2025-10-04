# 📋 AnimeVerse API Quick Reference

## Base URLs

- **Server**: `http://localhost:3001`
- **REST API**: `/api/*`
- **ORPC**: `/rpc`
- **Auth**: `/api/auth/*`

## 🔑 Authentication

All protected endpoints require authentication via session cookie.

**Login:**

```typescript
await authClient.signIn.email({
  email: "user@example.com",
  password: "password",
});
```

**Logout:**

```typescript
await authClient.signOut();
```

## 📡 REST API Endpoints

### Shows

| Method | Endpoint         | Auth | Description                  |
| ------ | ---------------- | ---- | ---------------------------- |
| GET    | `/api/shows`     | ❌   | Get all shows (with filters) |
| GET    | `/api/shows/:id` | ❌   | Get show by ID               |
| POST   | `/api/shows`     | ✅   | Create new show              |
| PUT    | `/api/shows/:id` | ✅   | Update show                  |
| DELETE | `/api/shows/:id` | ✅   | Delete show                  |

**Query Parameters for GET /api/shows:**

- `limit` (number): Max results (default: 50)
- `skip` (number): Skip results (default: 0)
- `search` (string): Search in title/description
- `genres` (string): Comma-separated genres
- `sortBy` (string): rating, recent, title

### Reviews

| Method | Endpoint                     | Auth | Description          |
| ------ | ---------------------------- | ---- | -------------------- |
| GET    | `/api/reviews/anime/:showId` | ❌   | Get reviews for show |
| GET    | `/api/reviews/my-reviews`    | ✅   | Get user's reviews   |
| POST   | `/api/reviews/my-reviews`    | ✅   | Create review        |

### User Shows

| Method | Endpoint          | Auth | Description          |
| ------ | ----------------- | ---- | -------------------- |
| GET    | `/api/user-shows` | ✅   | Get user's show list |
| POST   | `/api/user-shows` | ✅   | Add show to list     |

**Query Parameters for GET /api/user-shows:**

- `status`: watching, completed, plan-to-watch, on-hold, dropped
- `isFavorite`: true/false

### Blogs

| Method | Endpoint              | Auth | Description      |
| ------ | --------------------- | ---- | ---------------- |
| GET    | `/api/blogs/my-blogs` | ✅   | Get user's blogs |
| POST   | `/api/blogs/my-blogs` | ✅   | Create blog post |

### Ratings

| Method | Endpoint                    | Auth | Description        |
| ------ | --------------------------- | ---- | ------------------ |
| GET    | `/api/ratings/show/:showId` | ❌   | Get season ratings |

**Query Parameters:**

- `seasonNumber` (number): Filter by season

### Home Items

| Method | Endpoint    | Auth | Description        |
| ------ | ----------- | ---- | ------------------ |
| GET    | `/api/home` | ❌   | Get homepage items |

**Query Parameters:**

- `section`: hero, featured, popular, trending

## 🎯 ORPC Procedures

### Usage Example

```typescript
import { client } from "@/utils/orpc";

// Type-safe API calls
const result = await client.shows.getAll({ limit: 10 });
```

### Shows Router

```typescript
client.shows.getAll({ limit?, skip?, search?, genres?, sortBy? })
client.shows.getById({ id })
client.shows.create({ title, description?, ... }) // Auth required
client.shows.update({ id, ...updates }) // Auth required
client.shows.delete({ id }) // Auth required
client.shows.incrementViewCount({ id })
```

### Reviews Router

```typescript
client.reviews.getByShowId({ showId, limit?, skip? })
client.reviews.getMyReviews({ limit?, skip? }) // Auth required
client.reviews.getById({ id })
client.reviews.create({ showId, title, content, rating, ... }) // Auth required
client.reviews.update({ id, ...updates }) // Auth required
client.reviews.delete({ id }) // Auth required
client.reviews.like({ id }) // Auth required
```

### UserShows Router

```typescript
client.userShows.getMyShows({ status?, isFavorite?, limit?, skip? }) // Auth required
client.userShows.getUserShow({ showId }) // Auth required
client.userShows.addShow({ showId, status?, isFavorite?, ... }) // Auth required
client.userShows.updateShow({ showId, ...updates }) // Auth required
client.userShows.removeShow({ showId }) // Auth required
client.userShows.toggleFavorite({ showId }) // Auth required
```

### Blogs Router

```typescript
client.blogs.getAll({ limit?, skip?, category?, search? })
client.blogs.getMyBlogs({ limit?, skip? }) // Auth required
client.blogs.getById({ id })
client.blogs.create({ title, content, ... }) // Auth required
client.blogs.update({ id, ...updates }) // Auth required
client.blogs.delete({ id }) // Auth required
client.blogs.like({ id }) // Auth required
```

### Ratings Router

```typescript
client.ratings.getByShowId({ showId, seasonNumber });
client.ratings.getMyRatings({ showId }); // Auth required
client.ratings.upsertRating({ showId, seasonNumber, rating, comment }); // Auth required
client.ratings.deleteRating({ showId, seasonNumber }); // Auth required
client.ratings.getAverageRating({ showId, seasonNumber });
```

### Home Router

```typescript
client.home.getBySection({ section, limit? })
client.home.getAll()
client.home.create({ showId, section, order?, ... }) // Auth required
client.home.update({ id, ...updates }) // Auth required
client.home.delete({ id }) // Auth required
```

## 📝 Common Request Bodies

### Create Review

```json
{
  "showId": "507f1f77bcf86cd799439011",
  "title": "Amazing anime!",
  "content": "This anime is incredible because...",
  "rating": 9,
  "bestMoment": "The final battle was epic",
  "worstMoment": "The pacing in episode 5",
  "seasonNumber": 1,
  "episodeNumber": 12,
  "isPublic": true
}
```

### Add Show to User List

```json
{
  "showId": "507f1f77bcf86cd799439011",
  "status": "watching",
  "isFavorite": true,
  "currentEpisode": 5,
  "currentSeason": 1,
  "personalRating": 8,
  "notes": "Great so far!"
}
```

### Create Blog Post

```json
{
  "title": "Top 10 Anime of 2024",
  "content": "Here are my picks for...",
  "excerpt": "A curated list of the best anime",
  "coverImage": "/uploads/blog-cover.jpg",
  "tags": ["recommendations", "2024"],
  "category": "lists",
  "isPublished": true
}
```

### Create/Update Season Rating

```json
{
  "showId": "507f1f77bcf86cd799439011",
  "seasonNumber": 2,
  "rating": 4.5,
  "comment": "Best season yet!"
}
```

## 🎨 Response Formats

### Show Object

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Attack on Titan",
  "description": "Humanity lives inside...",
  "coverImageUrl": "/assets/card-images/aot.jpeg",
  "genres": ["Action", "Dark Fantasy"],
  "rating": 4.8,
  "seasons": [
    {
      "seasonNumber": 1,
      "title": "Season 1",
      "episodes": 25,
      "status": "Finished"
    }
  ],
  "status": "Completed",
  "isFeatured": true,
  "isPopular": true,
  "viewCount": 1234,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

### Review Object

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "user-id",
  "showId": "show-id",
  "title": "Amazing anime!",
  "content": "This anime is...",
  "rating": 9,
  "bestMoment": "The final battle",
  "worstMoment": "The pacing",
  "seasonNumber": 1,
  "episodeNumber": 12,
  "isPublic": true,
  "likeCount": 42,
  "viewCount": 150,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "username": "john_doe"
  }
}
```

## ❌ Error Responses

All errors return standard format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found
- `500` - Internal Server Error

## 🔧 Common Filters

### Show Filters

```typescript
// Search
const shows = await fetch("/api/shows?search=naruto");

// By genre
const shows = await fetch("/api/shows?genres=Action,Fantasy");

// Sort by rating
const shows = await fetch("/api/shows?sortBy=rating&limit=10");

// Pagination
const shows = await fetch("/api/shows?skip=20&limit=10");
```

### User Show Filters

```typescript
// Only watching
const shows = await fetch("/api/user-shows?status=watching");

// Only favorites
const shows = await fetch("/api/user-shows?isFavorite=true");

// Completed shows
const shows = await fetch("/api/user-shows?status=completed");
```

## 💡 Pro Tips

1. **Use ORPC for type safety** - Frontend gets autocomplete and type checking
2. **Paginate large lists** - Use skip/limit to avoid large responses
3. **Include credentials** - Always set `credentials: 'include'` in fetch
4. **Handle errors** - Check response.ok before parsing JSON
5. **Cache strategically** - Cache public data, invalidate user data
6. **Use search** - Full-text search is indexed and fast
7. **Batch requests** - Use ORPC to make multiple calls efficiently

## 🚀 Quick Start Examples

### Fetch and Display Shows

```typescript
const response = await fetch("http://localhost:3001/api/shows?limit=10");
const shows = await response.json();
```

### Create Review (Auth Required)

```typescript
const review = await fetch("http://localhost:3001/api/reviews/my-reviews", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    showId: "show-id",
    title: "Great anime",
    content: "I loved it because...",
    rating: 9,
  }),
});
```

### Track Show Progress

```typescript
await fetch("http://localhost:3001/api/user-shows", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    showId: "show-id",
    status: "watching",
    currentEpisode: 5,
    currentSeason: 1,
  }),
});
```

## 📖 Full Documentation

For complete API reference, see: `/apps/server/API_DOCUMENTATION.md`

## 🆘 Need Help?

1. Check server logs for errors
2. Verify authentication status
3. Validate request body matches schema
4. Ensure ObjectIds are valid 24-char hex strings
5. Check CORS settings if requests are blocked

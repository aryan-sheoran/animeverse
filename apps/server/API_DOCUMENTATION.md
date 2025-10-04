# AnimeVerse Backend API Documentation

## Overview

This is the backend server for AnimeVerse, an anime review and tracking platform. It provides both REST API endpoints and ORPC (type-safe RPC) procedures for all frontend operations.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Better Auth
- **API Layer**: ORPC for type-safe procedures
- **Validation**: Zod schemas

## Database Models

### 1. Show Model

Represents anime/show information.

**Fields:**

- `title`: String (required) - Show title
- `description`: String - Show description
- `coverImageUrl`: String - Cover image URL
- `imageUrl`: String - Alternative image URL
- `cardImage`: String - Card thumbnail URL
- `genres`: Array of Strings - Show genres
- `rating`: Number (0-5) - Average rating
- `seasons`: Array of Season objects
- `totalEpisodes`: Number - Total episode count
- `status`: Enum - Ongoing, Completed, Upcoming, Hiatus
- `releaseYear`: Number
- `studio`: String
- `director`: String
- `tags`: Array of Strings
- `isFeatured`: Boolean
- `isPopular`: Boolean
- `viewCount`: Number
- `createdBy`: String (User ID)

### 2. Review Model

User reviews for shows.

**Fields:**

- `userId`: String (required) - Reference to User
- `showId`: ObjectId (required) - Reference to Show
- `title`: String (required) - Review title
- `content`: String (required) - Review content
- `rating`: Number (0-10) (required) - User rating
- `bestMoment`: String - Best moment description
- `worstMoment`: String - Worst moment description
- `seasonNumber`: Number - Season reviewed
- `episodeNumber`: Number - Episode reviewed
- `isPublic`: Boolean - Visibility
- `likeCount`: Number - Number of likes
- `commentCount`: Number
- `viewCount`: Number

### 3. UserShow Model

Tracks user's relationship with shows.

**Fields:**

- `userId`: String (required)
- `showId`: ObjectId (required)
- `status`: Enum - watching, completed, plan-to-watch, on-hold, dropped
- `isFavorite`: Boolean
- `currentEpisode`: Number
- `currentSeason`: Number
- `personalRating`: Number (0-10)
- `notes`: String
- `startedAt`: Date
- `completedAt`: Date
- `lastWatchedAt`: Date

### 4. SeasonRating Model

Per-season ratings.

**Fields:**

- `userId`: String (required)
- `showId`: ObjectId (required)
- `seasonNumber`: Number (required)
- `rating`: Number (0-5) (required)
- `comment`: String

### 5. Blog Model

User blog posts.

**Fields:**

- `userId`: String (required)
- `title`: String (required)
- `content`: String (required)
- `excerpt`: String
- `coverImage`: String
- `tags`: Array of Strings
- `category`: String
- `isPublished`: Boolean
- `likeCount`: Number
- `commentCount`: Number
- `viewCount`: Number
- `publishedAt`: Date

### 6. HomeItem Model

Featured content for homepage.

**Fields:**

- `show`: ObjectId (required) - Reference to Show
- `section`: Enum (required) - hero, featured, popular, trending
- `order`: Number - Display order
- `isActive`: Boolean
- `startDate`: Date - When to start showing
- `endDate`: Date - When to stop showing

### 7. Comment Model

Comments on reviews and blogs.

**Fields:**

- `userId`: String (required)
- `targetType`: Enum (required) - review, blog
- `targetId`: ObjectId (required)
- `content`: String (required)
- `parentCommentId`: ObjectId - For nested comments
- `likeCount`: Number
- `isEdited`: Boolean

### 8. Like Model

Tracks user likes.

**Fields:**

- `userId`: String (required)
- `targetType`: Enum (required) - review, blog, comment
- `targetId`: ObjectId (required)

## REST API Endpoints

### Shows

#### GET /api/shows

Get all shows with optional filters.

**Query Parameters:**

- `limit`: Number (default: 50)
- `skip`: Number (default: 0)
- `search`: String - Search in title/description
- `genres`: String (comma-separated) - Filter by genres
- `sortBy`: String - rating, recent, title

**Response:** Array of Show objects

#### GET /api/shows/[id]

Get single show by ID.

**Response:** Show object

#### POST /api/shows

Create new show (requires auth).

**Body:** Show data

**Response:** Created Show object

#### PUT /api/shows/[id]

Update show (requires auth).

**Body:** Show data to update

**Response:** Updated Show object

#### DELETE /api/shows/[id]

Delete show (requires auth).

**Response:** { success: true }

### Reviews

#### GET /api/reviews/anime/[showId]

Get all public reviews for a show.

**Response:** Array of Review objects

#### GET /api/reviews/my-reviews

Get current user's reviews (requires auth).

**Response:** Array of Review objects

#### POST /api/reviews/my-reviews

Create new review (requires auth).

**Body:**

```json
{
  "showId": "string",
  "title": "string",
  "content": "string",
  "rating": 0-10,
  "bestMoment": "string (optional)",
  "worstMoment": "string (optional)",
  "seasonNumber": number (optional),
  "episodeNumber": number (optional),
  "isPublic": boolean (optional)
}
```

**Response:** Created Review object

### User Shows

#### GET /api/user-shows

Get current user's show list (requires auth).

**Query Parameters:**

- `status`: String - watching, completed, plan-to-watch, on-hold, dropped
- `isFavorite`: Boolean

**Response:** Array of UserShow objects

#### POST /api/user-shows

Add show to user's list (requires auth).

**Body:**

```json
{
  "showId": "string",
  "status": "watching",
  "isFavorite": false,
  "currentEpisode": 0,
  "currentSeason": 1,
  "personalRating": 0-10 (optional),
  "notes": "string (optional)"
}
```

**Response:** Created UserShow object

### Blogs

#### GET /api/blogs/my-blogs

Get current user's blogs (requires auth).

**Response:** Array of Blog objects

#### POST /api/blogs/my-blogs

Create new blog post (requires auth).

**Body:**

```json
{
  "title": "string",
  "content": "string",
  "excerpt": "string (optional)",
  "coverImage": "string (optional)",
  "tags": ["string"] (optional),
  "category": "string (optional)",
  "isPublished": boolean (optional)
}
```

**Response:** Created Blog object

### Ratings

#### GET /api/ratings/show/[showId]

Get all season ratings for a show.

**Query Parameters:**

- `seasonNumber`: Number (optional) - Filter by season

**Response:** Array of SeasonRating objects

### Home Items

#### GET /api/home

Get all active home items.

**Query Parameters:**

- `section`: String (optional) - hero, featured, popular, trending

**Response:**

- If section specified: Array of HomeItem objects
- If no section: Object grouped by section

## ORPC Procedures

All ORPC procedures are available at `/rpc` endpoint and provide type-safe access from the frontend.

### Shows Router (`appRouter.shows`)

- `getAll(input)` - Get all shows
- `getById(input)` - Get show by ID
- `create(input)` - Create new show (protected)
- `update(input)` - Update show (protected)
- `delete(input)` - Delete show (protected)
- `incrementViewCount(input)` - Increment view count

### Reviews Router (`appRouter.reviews`)

- `getByShowId(input)` - Get reviews for show
- `getMyReviews(input)` - Get user's reviews (protected)
- `getById(input)` - Get review by ID
- `create(input)` - Create review (protected)
- `update(input)` - Update review (protected)
- `delete(input)` - Delete review (protected)
- `like(input)` - Like review (protected)
- `incrementViewCount(input)` - Increment view count

### User Shows Router (`appRouter.userShows`)

- `getMyShows(input)` - Get user's shows (protected)
- `getUserShow(input)` - Get specific user show (protected)
- `addShow(input)` - Add show to list (protected)
- `updateShow(input)` - Update user show (protected)
- `removeShow(input)` - Remove show from list (protected)
- `toggleFavorite(input)` - Toggle favorite status (protected)

### Blogs Router (`appRouter.blogs`)

- `getAll(input)` - Get all public blogs
- `getMyBlogs(input)` - Get user's blogs (protected)
- `getById(input)` - Get blog by ID
- `create(input)` - Create blog (protected)
- `update(input)` - Update blog (protected)
- `delete(input)` - Delete blog (protected)
- `like(input)` - Like blog (protected)

### Ratings Router (`appRouter.ratings`)

- `getByShowId(input)` - Get ratings for show
- `getMyRatings(input)` - Get user's ratings (protected)
- `upsertRating(input)` - Create or update rating (protected)
- `deleteRating(input)` - Delete rating (protected)
- `getAverageRating(input)` - Get average rating for season

### Home Router (`appRouter.home`)

- `getBySection(input)` - Get home items by section
- `getAll()` - Get all home items
- `create(input)` - Create home item (protected)
- `update(input)` - Update home item (protected)
- `delete(input)` - Delete home item (protected)

## Middleware

### Authentication Middleware

Located in `/middleware/auth.middleware.ts`:

- `requireAuth` - Ensures user is authenticated
- `optionalAuth` - Includes user if authenticated
- `requireAdmin` - Ensures user has admin privileges
- `rateLimit(maxRequests, windowMs)` - Rate limiting
- `validate(schema)` - Input validation with Zod
- `logger` - Request/response logging

### Upload Middleware

Located in `/middleware/upload.middleware.ts`:

- `validateFile(file)` - Validates file uploads
- `saveFile(file, userId)` - Saves file and returns URL
- `deleteFile(filepath)` - Deletes file
- `sanitizeFilename(filename)` - Sanitizes filename

**Constraints:**

- Max file size: 5MB
- Allowed types: JPEG, JPG, PNG, GIF, WebP
- Files stored in: `/public/uploads`

## Authentication

All authenticated endpoints require a valid session cookie from Better Auth.

**Protected routes** will return 401 Unauthorized if not authenticated.

## Error Handling

All endpoints return proper HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found
- `500` - Internal Server Error

Error responses format:

```json
{
  "error": "Error message"
}
```

## Environment Variables

Required environment variables:

```env
DATABASE_URL=mongodb://...
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Type Safety

The ORPC procedures are fully type-safe. Import the client in your frontend:

```typescript
import { client } from "@/utils/orpc";

// Fully typed!
const shows = await client.shows.getAll({ limit: 10 });
const review = await client.reviews.create({
  showId: "...",
  title: "...",
  content: "...",
  rating: 8,
});
```

## Notes

- All ObjectId fields are validated before querying
- Timestamps (createdAt, updatedAt) are automatically managed by Mongoose
- Indexes are set up for optimal query performance
- Cascading deletes should be handled at application level
- File uploads are stored locally; consider using cloud storage for production

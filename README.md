# Animeverse

Animeverse is a full-stack anime discovery and community application. Users can
browse anime, manage a personal library, write and explore reviews, rate shows,
and maintain their profile.

The project is organized as an npm workspaces monorepo managed with Turborepo:

- `apps/web` - the Next.js frontend
- `apps/server` - the Next.js backend and API
- MongoDB - application data and Better Auth persistence

## Features

- Anime home page with featured and popular shows
- Anime browsing and show details
- User registration and login
- Password reset through Better Auth
- Personal anime library
- Anime reviews and review exploration
- Show and season ratings
- User profile and settings
- Responsive UI with locally stored anime artwork

## Tech stack

- Next.js 15
- React 19
- TypeScript
- MongoDB with Mongoose
- Better Auth
- oRPC and Zod
- Turborepo
- Tailwind CSS 4 and CSS Modules

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A running MongoDB deployment, either local MongoDB or MongoDB Atlas

## Getting started

### 1. Install dependencies

From the repository root:

```bash
npm install
```

### 2. Configure the server

Create `apps/server/.env` from the example file:

```bash
cp apps/server/.env.example apps/server/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item apps/server/.env.example apps/server/.env
```

Set the values in `apps/server/.env`:

```env
DATABASE_URL=mongodb://127.0.0.1:27017/animeverse
CORS_ORIGIN=http://localhost:3001
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
```

For MongoDB Atlas, replace `DATABASE_URL` with the Atlas connection string.
The server reads the optional `dbName` query parameter from the connection
string; otherwise it uses the `myDB` database name.

### 3. Configure the web app

Create `apps/web/.env` from the example file:

```bash
cp apps/web/.env.example apps/web/.env
```

On Windows PowerShell:

```powershell
Copy-Item apps/web/.env.example apps/web/.env
```

Set the frontend's server URL:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 4. Start the development servers

Start both applications from the repository root:

```bash
npm run dev
```

Or start them independently:

```bash
npm run dev:web
npm run dev:server
```

The default local URLs are:

- Web app: <http://localhost:3001>
- API server: <http://localhost:3000>
- API health check: <http://localhost:3000>

The backend connects to MongoDB during startup. Make sure MongoDB is
reachable before starting the server.

## Available scripts

Run these commands from the repository root:

| Command | Description |
| --- | --- |
| `npm run dev` | Start all workspace development tasks |
| `npm run dev:web` | Start only the web app |
| `npm run dev:server` | Start only the API server |
| `npm run build` | Build all workspaces |
| `npm run check-types` | Run the configured workspace type checks |
| `npm run ruler:apply` | Apply the repository's Ruler instructions |

The individual applications also provide `build` and `start` scripts for
production builds.

## Application routes

### Frontend routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login` | User login |
| `/signup` | User registration |
| `/hub` | Authenticated user hub |
| `/home` | Featured and popular anime |
| `/shows` | Browse anime |
| `/review` | Create or edit a review |
| `/anime-reviews` | View reviews for an anime |
| `/explore-review` | Explore review content |
| `/mystuff` | Personal shows, reviews, and profile |
| `/settings` | Profile settings |

### Backend API areas

The server exposes Better Auth under `/api/auth` and application endpoints
under `/api`, plus typed oRPC procedures under `/rpc`. The main API areas are:

- Shows
- Home page content
- User shows and personal library
- Reviews and comments
- Ratings
- Authentication and sessions

## Project structure

```text
animeverse/
├── apps/
│   ├── server/
│   │   └── src/
│   │       ├── app/api/       # REST-style Next.js API routes
│   │       ├── db/            # MongoDB connection and models
│   │       ├── lib/           # Auth, context, and shared server utilities
│   │       └── routers/       # oRPC routers
│   └── web/
│       ├── public/            # Anime artwork and static assets
│       └── src/
│           ├── app/           # Next.js pages and layouts
│           ├── components/    # Reusable UI components
│           ├── lib/           # Auth client and frontend utilities
│           └── utils/         # oRPC client setup
├── ARCHITECTURE.md            # Authentication architecture notes
├── package.json               # Workspace scripts
└── turbo.json                 # Turborepo task configuration
```

## Environment variables

### Server

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | MongoDB connection string |
| `CORS_ORIGIN` | URL allowed to access the backend, normally `http://localhost:3001` |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth for signing and encryption |
| `BETTER_AUTH_URL` | Public base URL of the backend |

### Web

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SERVER_URL` | Base URL used by the frontend for auth and oRPC requests |

Never commit `.env` files or production secrets. Use the provided `.env.example`
files as templates.

## Production build

Build all workspaces:

```bash
npm run build
```

Then run the applications using their workspace start scripts:

```bash
npm --workspace web run start
npm --workspace server run start
```

Set production values for all environment variables before starting the
applications, including a strong `BETTER_AUTH_SECRET` and the correct public
frontend/backend origins.

## Authentication notes

Authentication is implemented with Better Auth and stored in MongoDB. The
frontend uses the Better Auth client, while the backend handles authentication
requests at `/api/auth/[...all]`. Password reset should use Better Auth's
token-based flow rather than directly modifying account records.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the password reset architecture
and security decisions.

## License

No license has been specified for this project yet.

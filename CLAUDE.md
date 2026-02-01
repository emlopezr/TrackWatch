# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TrackWatch is a full-stack application that integrates with Spotify to track favorite artists and automatically manage music releases. It connects to Spotify accounts to notify users of new releases and add them to an auto-generated playlist.

## Commands

### Docker (Recommended for deployment)
```bash
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
docker-compose up -d --build  # Rebuild and start
```

### Frontend (in `/frontend`)
```bash
npm run dev      # Start dev server on :5173
npm run build    # Type check + production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

### Backend (in `/backend`)
```bash
python manage.py runserver       # Start dev server on :8000
python manage.py migrate         # Run database migrations
python manage.py makemigrations  # Create new migrations
python manage.py run_scheduler   # Run background scheduler (blocking)
python manage.py run_scheduler --run-now  # Run scheduler + immediate task
```

## Architecture

### Frontend (`/frontend`)
- **React 18 + TypeScript + Vite**
- Entry point: `src/main.tsx` → `App.tsx` (router setup)
- **State Management**: React Context API (`src/context/UserContext.tsx`)
- **API Layer**: Service modules in `src/services/` split into:
  - `spotify/` - Direct Spotify API calls
  - `trackwatch/` - Backend API calls
- **Routing**: Protected routes via `MainRoute.tsx`, OAuth callback via `CallbackRoute.tsx`
- **Components**: Co-located with styles in their own directories (e.g., `components/ArtistCard/`)

### Backend (`/backend`)
- **Django 5 + Django REST Framework**
- Custom User model using Spotify ID as primary key (`app/models/user.py`)
- **Views** (`app/views/`) - REST API endpoints
- **Services** (`app/services/`) - Business logic layer including:
  - `generate_artist_playlist_use_case.py` - Playlist generation
  - `search_followed_releases_use_case.py` - New release detection
- **Clients** (`app/clients/`) - External API wrappers for Spotify and Resend (email)
- **Background Jobs**: APScheduler for periodic tasks

### API Authentication
- Spotify tokens passed via custom headers: `X-Spotify-Access-Token`, `X-Spotify-Refresh-Token`
- Token management handled by `useTokenManager` hook on frontend

### Database Models
- `User` - Extended AbstractBaseUser with Spotify credentials and settings
- `UserRecentlyAddedTrack` - Prevents duplicate track additions to playlists

### Artist Following
- Followed artists are managed via Spotify API (source of truth)
- Uses `user-follow-read` and `user-follow-modify` OAuth scopes
- Client functions in `app/clients/spotify/spotify_follow_api_client.py`

## Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ping` | GET | Health check |
| `/users/register` | POST | Register new user |
| `/users/me` | GET | Get current user |
| `/artists/follow` | POST | Follow an artist |
| `/artists/unfollow` | POST | Unfollow an artist |
| `/actions/generate` | POST | Generate artist playlist |
| `/actions/releases` | POST | Update new releases |

## Environment Variables

Frontend uses `VITE_*` prefixed variables. Backend requires Spotify API credentials, PostgreSQL connection, and Resend API key for email notifications.

## Active Technologies
- Python 3.10+ (Backend), TypeScript 5.6 (Frontend) + Django 5.2, Django REST Framework, React 18.3, Vite 6.4
- PostgreSQL
- Python 3.10+ (Backend), TypeScript 5.6 (Frontend) + Django 5.2, Django REST Framework, React 18.3, Vite 6.4, react-router-dom 7.5 (002-ghost-tracks)
- PostgreSQL (existing) (002-ghost-tracks)

## Docker Configuration

The application is designed for Docker-first deployment:

- `docker-compose.yml` - Orchestrates all services (db, backend, scheduler, frontend)
- `backend/Dockerfile` - Python/Django with Gunicorn
- `backend/entrypoint.sh` - Handles migrations and starts Gunicorn
- `frontend/Dockerfile` - Multi-stage build (Node build + Nginx serve)
- `frontend/nginx.conf` - SPA routing + reverse proxy to `/api/*` endpoints
- `.env.docker.example` - Environment configuration template

### Docker Services

| Service | Description |
|---------|-------------|
| `db` | PostgreSQL database with persistent volume |
| `backend` | Django REST API served by Gunicorn |
| `scheduler` | APScheduler running `run_scheduler` command |
| `frontend` | Nginx serving React SPA + reverse proxy |

### Docker Networking

In Docker mode, the frontend Nginx proxies `/api/*` requests to the backend at `http://backend:8000`, stripping the `/api` prefix. The `VITE_TRACKWATCH_API_BASE_URL` should be set to `/api` for Docker builds.

### Background Tasks

The scheduler runs as a separate service using `python manage.py run_scheduler`. For external triggers (n8n, cron), use `POST /actions/releases` with `X-Admin-Key` header.

## Recent Changes
- Docker-first deployment: Added complete Docker setup with Gunicorn, Nginx reverse proxy, and PostgreSQL.
- 001-spotify-artists-sync: Migrated followed artists from local database to Spotify API as source of truth. Removed `UserFollowedArtist` model. Added Spotify follow/unfollow API integration.

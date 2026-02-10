# Quickstart: All-in-One Docker Deployment

## Prerequisites

- Docker and Docker Compose installed
- A Spotify Developer App (create at https://developer.spotify.com/dashboard)

## Steps

### 1. Clone and configure

```bash
git clone <repo-url> && cd trackwatch
cp .env.docker.example .env
```

Edit `.env` with your values:
- `SECRET_KEY` — generate with: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- `DATABASE_PASSWORD` — any secure password
- `SPOTIFY_CLIENT_ID` — from Spotify Developer Dashboard
- `SPOTIFY_CLIENT_SECRET` — from Spotify Developer Dashboard

### 2. Build and start

```bash
docker-compose -f docker-compose.aio.yml up -d --build
```

This starts 2 containers:
- `db` — PostgreSQL database
- `trackwatch` — Backend + Frontend + Scheduler (all-in-one)

### 3. Access the application

Open `http://127.0.0.1` in your browser.

### 4. Verify health

```bash
# Check container status
docker-compose -f docker-compose.aio.yml ps

# Check internal processes
docker exec trackwatch supervisorctl status

# View logs
docker-compose -f docker-compose.aio.yml logs -f trackwatch
```

### 5. Stop

```bash
docker-compose -f docker-compose.aio.yml down
```

## Switching between deployment modes

Both modes use the same `.env` file. Do not run both simultaneously on the same host (port conflict).

```bash
# Multi-container mode (recommended for development)
docker-compose up -d

# All-in-One mode (simplified self-hosted deployment)
docker-compose -f docker-compose.aio.yml up -d --build
```

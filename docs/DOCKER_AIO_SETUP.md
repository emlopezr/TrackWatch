# Docker All-in-One Setup

This guide covers deploying TrackWatch using the **All-in-One (AiO) Docker image**, which bundles everything into a single container: frontend, backend, background scheduler, and PostgreSQL database.

For multi-container deployment, see the [main README](../README.md). For local development without Docker, see [Manual Setup](./MANUAL_SETUP.md).

## Architecture

```
┌──────────────────────────────────────────┐
│            trackwatch (AiO)              │
│                                          │
│  ┌────────────┐    ┌─────────────────┐   │
│  │   Nginx    │    │    Gunicorn     │   │
│  │  (port 80) │───▶│   (port 8000)  │   │
│  └────────────┘    └─────────────────┘   │
│  ┌────────────┐    ┌─────────────────┐   │
│  │ PostgreSQL │    │   APScheduler   │   │
│  │ (port 5432)│    │    (cron)       │   │
│  └────────────┘    └─────────────────┘   │
│                                          │
│  Managed by supervisord                  │
│  Volume: /var/lib/postgresql/data        │
└──────────────────────────────────────────┘
```

**One container. One command. Everything included.**

> **About ports:** Only port 80 (Nginx) is exposed to your machine. PostgreSQL (5432) and Gunicorn (8000) run **inside** the container on `127.0.0.1` and are not accessible from outside. This means there are no port conflicts even if you already have PostgreSQL or other services running on your machine.

## Prerequisites

- Docker installed
- A Spotify Developer App ([create one here](https://developer.spotify.com/dashboard))

## Option A: Pull Pre-built Image

The fastest way to get started. No cloning, no building.

The image is available on both registries:

| Registry | Image |
|----------|-------|
| **GHCR** | `ghcr.io/emlopezr/trackwatch:latest` |
| **Docker Hub** | `emlopezr/trackwatch:latest` |

### 1. Run the container

**From GHCR (GitHub Container Registry):**

```bash
docker run -d \
  --name trackwatch \
  -e SPOTIFY_CLIENT_ID=your-spotify-client-id \
  -e SPOTIFY_CLIENT_SECRET=your-spotify-client-secret \
  -e SECRET_KEY=your-secret-key \
  -v trackwatch_data:/var/lib/postgresql/data \
  -p 80:80 \
  --restart unless-stopped \
  ghcr.io/emlopezr/trackwatch:latest
```

**From Docker Hub:**

```bash
docker run -d \
  --name trackwatch \
  -e SPOTIFY_CLIENT_ID=your-spotify-client-id \
  -e SPOTIFY_CLIENT_SECRET=your-spotify-client-secret \
  -e SECRET_KEY=your-secret-key \
  -v trackwatch_data:/var/lib/postgresql/data \
  -p 80:80 \
  --restart unless-stopped \
  emlopezr/trackwatch:latest
```

That's it. Open **http://127.0.0.1** in your browser.

> Generate a SECRET_KEY with: `python3 -c "import secrets; print(secrets.token_urlsafe(50))"`

#### With optional variables

You can add any optional variable with additional `-e` flags. For example, to enable email notifications and change the port:

```bash
docker run -d \
  --name trackwatch \
  -e SPOTIFY_CLIENT_ID=your-spotify-client-id \
  -e SPOTIFY_CLIENT_SECRET=your-spotify-client-secret \
  -e SECRET_KEY=your-secret-key \
  -e RESEND_API_KEY=re_your-resend-api-key \
  -e ADMIN_EMAIL=you@yourdomain.com \
  -e EMAIL_DOMAIN=yourdomain.com \
  -e SCHEDULER_HOURS=8,16,22 \
  -v trackwatch_data:/var/lib/postgresql/data \
  -p 8080:80 \
  --restart unless-stopped \
  ghcr.io/emlopezr/trackwatch:latest
```

> See the full [Environment Variables Reference](#environment-variables-reference) below for all available options.

#### Port configuration

The `-p` flag maps a port on your machine to port 80 inside the container:

```bash
-p 80:80      # Access at http://127.0.0.1       (default)
-p 8080:80    # Access at http://127.0.0.1:8080
-p 3000:80    # Access at http://127.0.0.1:3000
```

Remember to update the **Redirect URI** in your Spotify app to match your port (e.g. `http://127.0.0.1:80/callback` or `http://127.0.0.1:8080/callback`). The port is mandatory in Spotify's dashboard.

### Or use Docker Compose

Create a `docker-compose.yml`:

```yaml
services:
  trackwatch:
    image: ghcr.io/emlopezr/trackwatch:latest  # or emlopezr/trackwatch:latest
    restart: unless-stopped
    environment:
      # Required
      SECRET_KEY: ${SECRET_KEY:?Secret key required}
      SPOTIFY_CLIENT_ID: ${SPOTIFY_CLIENT_ID:?Spotify Client ID required}
      SPOTIFY_CLIENT_SECRET: ${SPOTIFY_CLIENT_SECRET:?Spotify Client Secret required}
      # Optional (uncomment to enable)
      # RESEND_API_KEY: ${RESEND_API_KEY:-}
      # ADMIN_EMAIL: ${ADMIN_EMAIL:-}
      # EMAIL_DOMAIN: ${EMAIL_DOMAIN:-}
      # SCHEDULER_HOURS: ${SCHEDULER_HOURS:-7,14,21}
    volumes:
      - trackwatch_data:/var/lib/postgresql/data
    ports:
      - "${PORT:-80}:80"

volumes:
  trackwatch_data:
```

Create a `.env` file next to it:

```env
# Required
SECRET_KEY=your-secret-key-here
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# Optional
# PORT=8080
# RESEND_API_KEY=re_your-resend-api-key
# ADMIN_EMAIL=you@yourdomain.com
# EMAIL_DOMAIN=yourdomain.com
# SCHEDULER_HOURS=8,16,22
```

Then run:

```bash
docker-compose up -d
```

---

## Option B: Build from Source

Best if you want to customize the build or contribute to the project.

### 1. Clone the repository

```bash
git clone https://github.com/emlopezr/TrackWatch.git
cd TrackWatch
```

### 2. Configure environment

```bash
cp .env.docker.example .env
```

Edit `.env` with your values:

```env
# REQUIRED — Generate with:
# python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
SECRET_KEY=your-secret-key-here

# REQUIRED — From https://developer.spotify.com/dashboard
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

### 3. Build and start

```bash
docker-compose -f docker-compose.aio.yml up -d --build
```

### 4. Access the application

Open **http://127.0.0.1** in your browser.

---

## Spotify App Configuration

In your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), add this **Redirect URI** to your app:

```
http://127.0.0.1:80/callback
```

> **Important:** Spotify only allows `http://` for `127.0.0.1`. Any other address (LAN IPs like `192.168.x.x`, custom domains) **requires HTTPS**. `localhost` is not accepted at all.

## Verifying the Deployment

```bash
# Check container status
docker ps

# Check all internal processes are running
docker exec trackwatch supervisorctl status

# Expected output:
# gunicorn     RUNNING   pid 45, uptime 0:01:00
# nginx        RUNNING   pid 43, uptime 0:01:00
# postgresql   RUNNING   pid 41, uptime 0:01:00
# scheduler    RUNNING   pid 47, uptime 0:01:00

# Check health endpoints
curl http://127.0.0.1/health        # Nginx health
curl http://127.0.0.1/api/ping      # Backend health

# View logs
docker logs -f trackwatch
```

## Data Persistence

The PostgreSQL database is stored in the Docker volume `trackwatch_data` (mounted at `/var/lib/postgresql/data`).

- **Restarting** the container preserves all data
- **Removing** the container preserves all data (volume persists)
- **Removing the volume** (`docker volume rm trackwatch_data`) deletes all data

### Backup

```bash
# Create a database dump
docker exec trackwatch pg_dump -U trackwatch trackwatch > backup.sql

# Restore from a dump
docker exec -i trackwatch psql -U trackwatch trackwatch < backup.sql
```

## Environment Variables Reference

### Required

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `SPOTIFY_CLIENT_ID` | From [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) |
| `SPOTIFY_CLIENT_SECRET` | From [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_NAME` | `trackwatch` | PostgreSQL database name |
| `DATABASE_USER` | `trackwatch` | PostgreSQL username |
| `DATABASE_PASSWORD` | `trackwatch` | PostgreSQL password |
| `PORT` | `80` | Host port to expose |
| `DEBUG` | `False` | Django debug mode |
| `ALLOWED_HOSTS` | `*` | Comma-separated allowed hosts |
| `VITE_SPOTIFY_REDIRECT_URI` | `http://<host>:<port>/callback` | Spotify OAuth redirect URI |
| `VITE_TRACKWATCH_API_BASE_URL` | `/api` | API base URL for frontend |
| `VITE_HIDE_PUBLIC_LOGIN` | `false` | Hide the public login button |
| `RESEND_API_KEY` | *(empty)* | [Resend](https://resend.com) API key for email notifications |
| `ADMIN_EMAIL` | *(empty)* | Admin email for notifications |
| `EMAIL_DOMAIN` | `emlopezr.com` | Domain for the "from" email address (must be verified in your Resend account) |
| `SCHEDULER_HOURS` | `7,14,21` | Hours to check for new releases (24h, comma-separated) |
| `SCHEDULER_MINUTE` | `0` | Minute of the hour to run checks |
| `GUNICORN_WORKERS` | `2` | Number of Gunicorn workers |
| `GUNICORN_THREADS` | `4` | Threads per worker |
| `GUNICORN_TIMEOUT` | `120` | Worker timeout in seconds |

## Custom Domain / HTTPS

If deploying behind a reverse proxy with a custom domain:

1. Set the redirect URI in your Spotify app to `https://yourdomain.com/callback`
2. Set the environment variable:
   ```env
   VITE_SPOTIFY_REDIRECT_URI=https://yourdomain.com/callback
   ```
3. Configure your reverse proxy to forward traffic to the container's port

## Updating

### Pre-built image (Option A)

```bash
docker pull ghcr.io/emlopezr/trackwatch:latest
docker stop trackwatch && docker rm trackwatch
# Run the docker run command again (same as initial setup)
```

Or with Compose:

```bash
docker-compose pull
docker-compose up -d
```

### From source (Option B)

```bash
git pull
docker-compose -f docker-compose.aio.yml up -d --build
```

## Stopping

```bash
# Stop container (data is preserved in the volume)
docker stop trackwatch

# Remove container (data still preserved)
docker rm trackwatch

# DELETE all data (database will be wiped!)
docker volume rm trackwatch_data
```

## Troubleshooting

### OAuth Redirect Issues

If Spotify login fails with a redirect error:

1. Verify the redirect URI in your Spotify app matches **exactly** (including port and protocol)
2. Use `127.0.0.1` instead of `localhost` — Spotify does not allow `localhost`
3. Spotify only allows `http://` for `127.0.0.1` — LAN IPs (e.g. `192.168.x.x`) and custom domains require HTTPS
4. For HTTPS, set up a reverse proxy with a valid certificate and use an internal domain

### Container Starts but App Not Accessible

```bash
# Check if all processes are running
docker exec trackwatch supervisorctl status

# If a process shows FATAL, check the logs
docker logs trackwatch | tail -50
```

### Database Issues

```bash
# Connect to the internal PostgreSQL
docker exec -it trackwatch psql -U trackwatch trackwatch

# Check database logs within the container
docker logs trackwatch 2>&1 | grep -i postgres
```

### Process Crashed Inside Container

supervisord automatically restarts crashed processes. Check if it recovered:

```bash
docker exec trackwatch supervisorctl status
```

If a process keeps crashing (FATAL state), check the container logs for the root cause:

```bash
docker logs trackwatch 2>&1 | grep -i error
```

## Comparison: AiO vs Multi-Container

| Aspect | AiO (this guide) | Multi-Container |
|--------|-------------------|-----------------|
| Containers | 1 | 4 (db + backend + scheduler + frontend) |
| Command | `docker run ...` | `docker-compose up -d` |
| Database | Included (internal PostgreSQL) | Separate container |
| Pre-built image | Yes (`docker pull`) | No (must build from source) |
| Data persistence | Docker volume | Docker volume |
| Independent service restart | No (whole container) | Yes (per service) |
| Log separation | Mixed | Per container |
| Best for | Self-hosting, quick setup | Development, production scaling |

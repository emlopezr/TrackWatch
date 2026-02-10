# Implementation Plan: All-in-One Docker Image

**Branch**: `003-aio-docker-image` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-aio-docker-image/spec.md`

## Summary

Provide a true All-in-One Docker deployment option that consolidates PostgreSQL, the frontend (Nginx + React SPA), backend (Gunicorn + Django), and scheduler (APScheduler) into a single container managed by supervisord. The container is fully self-contained — no sidecar database needed. Runtime environment variable injection allows pre-built images (GHCR/Docker Hub) to be configured at startup without rebuilding.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.6 (frontend build only), Node.js 20 (build stage only)
**Primary Dependencies**: supervisord (pip), nginx (apt), gunicorn, Django 5.2, React 18.3, Vite 6.4
**Storage**: PostgreSQL 17 (embedded inside container, data persisted via Docker volume)
**Testing**: Manual integration testing (Docker build + compose up + functional verification)
**Target Platform**: Linux (Docker, amd64)
**Project Type**: Web application (existing backend + frontend)
**Performance Goals**: Container health check passes within 60 seconds, all features functional
**Constraints**: Image size < 700MB, same env var names, backward-compatible changes only
**Scale/Scope**: 8 new files, 4 modified files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. API-First Design | PASS | No API changes. Nginx AiO config replicates existing proxy behavior. |
| II. Service Layer Architecture | PASS | No application code changes. Process supervisor is infrastructure-only. |
| III. Type Safety | N/A | No application code changes. Docker/Bash/Nginx configs are untyped by nature. |
| IV. Component Isolation | PASS | No UI changes. Frontend is built identically and served as static files. |
| V. Security-First Development | PASS | Gunicorn binds to localhost only (127.0.0.1:8000). Only port 80 exposed. No secrets in Dockerfile. Environment variables passed at runtime via compose. |
| Security: Auth & Authorization | N/A | No auth changes. Same Spotify OAuth flow. |
| Security: Data Protection | PASS | Same database connection. Logs redirected to Docker stdout (no file persistence of tokens). |
| Security: Input Validation | N/A | No new user input paths. |
| Code Quality | PASS | Infrastructure files follow established patterns (reuse of existing entrypoint logic, nginx config). |

**Gate Result**: PASS — No violations. All new files are infrastructure configuration, not application logic.

## Project Structure

### Documentation (this feature)

```text
specs/003-aio-docker-image/
├── plan.md              # This file
├── research.md          # Phase 0 output (completed)
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
# New files (AiO feature)
Dockerfile.aio                          # Multi-stage build: Node build → Python/Nginx/PostgreSQL/supervisord
docker-compose.aio.yml                  # 1 service: trackwatch (fully self-contained)
supervisord.conf                        # Process manager: PostgreSQL + Nginx + Gunicorn + Scheduler
nginx-aio.conf                          # Nginx config with proxy_pass to 127.0.0.1:8000
entrypoint-aio.sh                       # PG init → supervisord → migrations → env.js generation
.dockerignore                           # Build context optimization
frontend/public/env.js                  # Empty placeholder for local dev (prevents 404)
docs/DOCKER_AIO_SETUP.md               # Full setup documentation
.github/workflows/docker-publish.yml    # CI/CD: build and publish to GHCR + Docker Hub

# Modified files (backward-compatible changes)
frontend/index.html                     # Added <script src="/env.js"> for runtime config
frontend/src/common/constants.ts        # env() helper reads window.__ENV__ first, falls back to import.meta.env
backend/app/constants.py                # EMAIL_DOMAIN configurable via env var (default: emlopezr.com)
docker-compose.yml                      # Added EMAIL_DOMAIN env var to backend service

# Existing Docker files (NOT modified)
backend/Dockerfile.compose              # Unchanged
backend/entrypoint.sh                   # Unchanged
frontend/Dockerfile.compose             # Unchanged
frontend/nginx.conf                     # Unchanged
```

**Structure Decision**: All AiO infrastructure files placed at repository root. The `Dockerfile.aio` needs access to both `backend/` and `frontend/` as build context.

## Complexity Tracking

No violations to justify. All constitution gates pass.

## File-by-File Implementation Details

### File 1: `Dockerfile.aio`

**Purpose**: Multi-stage build that produces a single image with frontend assets, backend runtime, Nginx, and supervisord.

**Stage 1 — Frontend Build** (node:20-alpine):
- Copy `frontend/` source and lockfiles
- Install pnpm via corepack, install dependencies
- Accept VITE_* build args for Spotify OAuth configuration
- Run `pnpm run build` (or `npm run build` fallback)
- Output: `/app/dist/` with built React SPA

**Stage 2 — Runtime** (python:3.11-slim):
- Install system dependencies: `libpq-dev`, `gcc`, `curl`, `nginx`, `postgresql`, `postgresql-client`
- Install Python dependencies from `backend/requirements.txt` + `supervisor`
- Prepare PostgreSQL data directory (`/var/lib/postgresql/data`), declare VOLUME
- Copy backend application code from `backend/`
- Copy frontend build from Stage 1 to `/usr/share/nginx/html`
- Copy `nginx-aio.conf` to `/etc/nginx/conf.d/default.conf`
- Remove default Nginx config
- Copy `supervisord.conf` to `/etc/supervisord.conf`
- Copy `entrypoint-aio.sh` to `/entrypoint.sh`
- Set environment defaults for Gunicorn workers/threads/timeout
- Expose port 80
- Health check: `curl -f http://localhost/health && curl -f http://localhost:8000/ping`
- Entrypoint: `/entrypoint.sh`

### File 2: `docker-compose.aio.yml`

**Purpose**: Simplified compose file with a single service (true all-in-one).

**Service: trackwatch**
- Build context: `.` (repository root) with `Dockerfile.aio`
- Build args: VITE_* variables for frontend build
- Environment: All backend env vars (Django, DB, Spotify, Resend, Gunicorn, Scheduler) + VITE_* runtime vars for env.js generation
- Database credentials default to `trackwatch`/`trackwatch`/`trackwatch` (internal PostgreSQL)
- Port: `${PORT:-80}:80`
- Restart: unless-stopped
- `stop_grace_period: 150s` (exceeds max supervisord stopwaitsecs)

**Volume**: `trackwatch_aio_postgres_data` (separate volume name to avoid conflicts with multi-container setup)

### File 3: `supervisord.conf`

**Purpose**: Manage 4 processes with auto-restart and Docker-compatible logging.

**[supervisord] section**:
- `nodaemon=true` (run in foreground for Docker)
- `logfile=/dev/null` (no supervisor log file)
- `user=root`

**[unix_http_server]** + **[supervisorctl]** + **[rpcinterface:supervisor]**:
- Unix socket at `/var/run/supervisor.sock` for `supervisorctl` access

**[program:postgresql]**:
- Command: `/usr/lib/postgresql/17/bin/postgres -D /var/lib/postgresql/data -c listen_addresses=127.0.0.1 -c port=5432`
- User: postgres
- Priority: 1 (starts first)
- `autorestart=true`, `startsecs=5`, `startretries=3`
- `stopwaitsecs=30`

**[program:nginx]**:
- Command: `nginx -g "daemon off;"`
- Priority: 10
- `autorestart=true`, `startsecs=5`, `startretries=3`
- `stopwaitsecs=30`
- stdout/stderr → `/dev/fd/1` and `/dev/fd/2`

**[program:gunicorn]**:
- Command: `gunicorn trackwatch.wsgi:application --bind 127.0.0.1:8000 --workers ${GUNICORN_WORKERS:-2} --threads ${GUNICORN_THREADS:-4} --timeout ${GUNICORN_TIMEOUT:-120} --access-logfile - --error-logfile - --capture-output --enable-stdio-inheritance`
- Directory: `/app`
- Priority: 20
- `autorestart=true`, `startsecs=10`, `startretries=3`
- `stopwaitsecs=60`, `stopasgroup=true`, `killasgroup=true`
- stdout/stderr → `/dev/fd/1` and `/dev/fd/2`

**[program:scheduler]**:
- Command: `python manage.py run_scheduler`
- Directory: `/app`
- Priority: 30
- `autorestart=true`, `startsecs=10`, `startretries=3`
- `stopwaitsecs=120` (scheduler tasks may be long-running)
- `stopasgroup=true`, `killasgroup=true`
- stdout/stderr → `/dev/fd/1` and `/dev/fd/2`

### File 4: `nginx-aio.conf`

**Purpose**: Identical to `frontend/nginx.conf` but with `proxy_pass http://127.0.0.1:8000` instead of `proxy_pass http://backend:8000`.

**Differences from existing `nginx.conf`**:
- Line 25: `proxy_pass http://127.0.0.1:8000;` (was `http://backend:8000`)

Everything else is identical: gzip, security headers, SPA fallback, static asset caching, health endpoint, Spotify header pass-through, timeouts, buffering settings.

### File 5: `entrypoint-aio.sh`

**Purpose**: PostgreSQL initialization, startup, migrations, and runtime config generation.

**Flow**:
1. `set -e` (exit on error)
2. PostgreSQL initialization (first run only — checks for `PG_VERSION` file):
   - `chown` data directory, run `initdb` as postgres user
   - Start PostgreSQL temporarily, create user/database with configured credentials
   - Stop PostgreSQL (supervisord will manage it going forward)
3. Ensure correct ownership of data directory and run directory
4. Export `DATABASE_HOST=127.0.0.1`, `DATABASE_PORT=5432` and other DB vars
5. Start supervisord in background (launches PostgreSQL, Nginx, Gunicorn, Scheduler)
6. Wait for PostgreSQL to be ready (`pg_isready` with retries)
7. Run `python manage.py migrate --noinput`
8. Run `python manage.py collectstatic --noinput`
9. Generate `/usr/share/nginx/html/env.js` with runtime `window.__ENV__` from environment variables (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, VITE_SPOTIFY_REDIRECT_URI, etc.)
10. `wait $SUPERVISORD_PID` (keep container running)

**Working directory**: `/app` (set by Dockerfile WORKDIR)

## Deployment Modes Comparison

| Aspect | Multi-Container (existing) | AiO (new) |
|--------|---------------------------|-----------|
| Command | `docker-compose up -d` | `docker run ...` or `docker-compose -f docker-compose.aio.yml up -d` |
| Pre-built image | No (must build from source) | Yes (`docker pull` from GHCR or Docker Hub) |
| Containers | 4 (db, backend, scheduler, frontend) | 1 (everything included) |
| Database | Separate container (postgres:15-alpine) | Embedded PostgreSQL 17 |
| Process management | Docker per container | supervisord inside container |
| Independent restart | Yes (per service) | No (whole container) |
| Log separation | By container | Mixed (all to stdout) |
| Volume names | `trackwatch_postgres_data` | `trackwatch_aio_postgres_data` |
| Env vars | Same | Same names, + VITE_* runtime injection |
| Port | `${PORT:-80}:80` | `${PORT:-80}:80` |
| Best for | Development, production scaling | Self-hosting, quick setup |

# Implementation Plan: All-in-One Docker Image

**Branch**: `003-aio-docker-image` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-aio-docker-image/spec.md`

## Summary

Provide an All-in-One Docker deployment option that consolidates the frontend (Nginx + React SPA), backend (Gunicorn + Django), and scheduler (APScheduler) into a single container managed by supervisord. This runs alongside a PostgreSQL database container via a dedicated `docker-compose.aio.yml`. Zero existing files are modified — the feature is purely additive (5 new files).

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.6 (frontend build only), Node.js 20 (build stage only)
**Primary Dependencies**: supervisord (pip), nginx (apt), gunicorn, Django 5.2, React 18.3, Vite 6.4
**Storage**: PostgreSQL 15 (external container, unchanged)
**Testing**: Manual integration testing (Docker build + compose up + functional verification)
**Target Platform**: Linux (Docker, amd64)
**Project Type**: Web application (existing backend + frontend)
**Performance Goals**: Container health check passes within 60 seconds, all features functional
**Constraints**: Image size < 700MB, zero modifications to existing files, same `.env` format
**Scale/Scope**: 5 new files, 0 modified files

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
# New files (AiO feature) — all at repository root
Dockerfile.aio           # Multi-stage build: Node build → Python/Nginx/supervisord runtime
docker-compose.aio.yml   # 2 services: db + trackwatch
supervisord.conf         # Process manager config for Nginx + Gunicorn + Scheduler
nginx-aio.conf           # Nginx config with proxy_pass to 127.0.0.1:8000
entrypoint-aio.sh        # DB wait → migrations → collectstatic → exec supervisord

# Existing files (NOT modified)
docker-compose.yml       # Unchanged — 4-service setup
backend/
├── Dockerfile.compose   # Unchanged
├── entrypoint.sh        # Unchanged
└── ...
frontend/
├── Dockerfile.compose   # Unchanged
├── nginx.conf           # Unchanged
└── ...
.env.docker.example      # Unchanged — same vars work for both modes
```

**Structure Decision**: All 5 new files placed at repository root. The `Dockerfile.aio` needs access to both `backend/` and `frontend/` as build context. The compose and config files follow the convention of the existing `docker-compose.yml` at root level.

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
- Install system dependencies: `libpq-dev`, `gcc`, `curl`, `nginx`
- Install Python dependencies from `backend/requirements.txt` + `supervisor`
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

**Purpose**: Simplified compose file with 2 services only.

**Service: db**
- Same as existing `docker-compose.yml` db service (postgres:15-alpine, health check, persistent volume)

**Service: trackwatch**
- Build context: `.` (repository root) with `Dockerfile.aio`
- Build args: VITE_* variables for frontend
- Environment: All backend env vars (Django, DB, Spotify, Resend, Gunicorn, Scheduler)
- `DATABASE_HOST: db` (overrides any .env value to use the compose network)
- Port: `${PORT:-80}:80`
- Depends on: db (healthy)
- Restart: unless-stopped
- `stop_grace_period: 150s` (exceeds max supervisord stopwaitsecs)

**Network**: `trackwatch-aio-network` (separate from multi-container network to avoid conflicts)
**Volume**: `trackwatch_aio_postgres_data` (separate volume name to avoid conflicts)

### File 3: `supervisord.conf`

**Purpose**: Manage 3 processes with auto-restart and Docker-compatible logging.

**[supervisord] section**:
- `nodaemon=true` (run in foreground for Docker)
- `logfile=/dev/null` (no supervisor log file)
- `user=root`

**[program:nginx]**:
- Command: `nginx -g "daemon off;"`
- Priority: 10 (starts first)
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

**Purpose**: Sequential startup: DB wait → migrations → collectstatic → supervisord.

**Flow**:
1. `set -e` (exit on error)
2. Database readiness check (same logic as existing `entrypoint.sh`):
   - Skip if `SKIP_DB_WAIT=true`
   - Python psycopg2 connection test with retries (max `DB_WAIT_MAX_RETRIES`, default 30)
3. Run `python manage.py migrate --noinput`
4. Run `python manage.py collectstatic --noinput`
5. `exec supervisord -c /etc/supervisord.conf` (replaces shell, becomes PID 1)

**Working directory**: `/app` (set by Dockerfile WORKDIR)

## Deployment Modes Comparison

| Aspect | Multi-Container (existing) | AiO (new) |
|--------|---------------------------|-----------|
| Command | `docker-compose up -d` | `docker-compose -f docker-compose.aio.yml up -d --build` |
| Containers | 4 (db, backend, scheduler, frontend) | 2 (db, trackwatch) |
| Process management | Docker per container | supervisord inside container |
| Independent restart | Yes (per service) | No (whole container) |
| Log separation | By container | Mixed (all to stdout) |
| Network names | `trackwatch-network` | `trackwatch-aio-network` |
| Volume names | `trackwatch_postgres_data` | `trackwatch_aio_postgres_data` |
| `.env` file | Same | Same |
| Port | `${PORT:-80}:80` | `${PORT:-80}:80` |

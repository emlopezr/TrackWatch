# Research: All-in-One Docker Image

**Feature**: 003-aio-docker-image
**Date**: 2026-02-08

## Decision 1: Process Supervisor

**Decision**: Use `supervisord` (installed via pip) to manage Nginx, Gunicorn, and APScheduler inside a single container.

**Rationale**:
- Most widely adopted multi-process supervisor for Docker containers
- Native Python package — installs cleanly via pip in the Python 3.11-slim base image
- Docker's official documentation recommends supervisord for multi-process containers
- Supports stdout/stderr log redirection to Docker's logging driver via `/dev/fd/1` and `/dev/fd/2`
- Supports `stopasgroup` and `killasgroup` for proper child process cleanup (important for Gunicorn workers)

**Alternatives considered**:
- **s6-overlay**: More Docker-native but adds complexity and has a steeper learning curve. Better for base images, overkill for 3 processes.
- **tini + background processes**: Simpler but no auto-restart, no health monitoring, no process group management.
- **runit**: Less community support, less documentation for Docker use cases.
- **Custom bash script with trap**: Fragile, no auto-restart, poor signal propagation.

## Decision 2: Nginx Installation Method

**Decision**: Install Nginx via `apt-get` in the Python 3.11-slim base image during the runtime stage.

**Rationale**:
- Python 3.11-slim is Debian-based, so `apt-get install nginx` is straightforward
- Avoids a separate Nginx image stage and keeps the Dockerfile simpler
- The Nginx package from Debian repos is stable and well-maintained
- Adds ~25MB to the image, acceptable for AiO use case

**Alternatives considered**:
- **Copy Nginx binary from nginx:alpine stage**: More complex multi-stage build, library dependency issues between Alpine and Debian.
- **Use Caddy instead of Nginx**: Simpler config but breaks consistency with existing `nginx.conf`. Users would need to learn a different reverse proxy.

## Decision 3: Frontend Build Strategy

**Decision**: Multi-stage build with Node.js 20 Alpine as the first stage, building the React SPA, then copying the `dist/` output to the Python runtime stage.

**Rationale**:
- Identical to the existing `frontend/Dockerfile.compose` pattern
- Node.js is only needed at build time, not in the final image
- VITE_* environment variables are passed as build args (same as current setup)
- The built `dist/` folder is copied to `/usr/share/nginx/html` (same location as current Nginx setup)

**Alternatives considered**:
- **Install Node.js in runtime image**: Wastes ~150MB, Node.js not needed at runtime.
- **External frontend build**: Requires CI/CD, doesn't work for local builds.

## Decision 4: Gunicorn Bind Address

**Decision**: Bind Gunicorn to `127.0.0.1:8000` (localhost only) in the AiO container.

**Rationale**:
- In the AiO container, Nginx and Gunicorn run in the same network namespace
- Binding to localhost prevents direct external access to port 8000, enforcing traffic through Nginx
- Nginx proxies to `http://127.0.0.1:8000` instead of `http://backend:8000`
- Matches security best practice: only expose the Nginx port (80) externally

**Alternatives considered**:
- **Bind to 0.0.0.0:8000**: Works but unnecessarily exposes the raw Django API. Would require explicit port exclusion in Docker.

## Decision 5: Entrypoint Strategy

**Decision**: A dedicated `entrypoint-aio.sh` script that runs database wait + migrations + static files collection, then `exec supervisord`.

**Rationale**:
- Migrations must run once before any processes start
- Using `exec` replaces the shell with supervisord, making it PID 1 for proper signal handling
- Reuses the same database wait logic from existing `entrypoint.sh`
- Separate file (`entrypoint-aio.sh`) avoids modifying the existing `entrypoint.sh`

**Alternatives considered**:
- **Run migrations as a supervisor program**: Risk of race condition — Gunicorn could start before migrations finish.
- **Modify existing entrypoint.sh**: Violates the "zero existing files modified" constraint.

## Decision 6: Graceful Shutdown Timeout Cascade

**Decision**: Docker stop (150s) > supervisord stopwaitsecs (60-120s per process) > Gunicorn graceful_timeout (30s).

**Rationale**:
- Docker sends SIGTERM, then waits `stop_grace_period` before SIGKILL
- Supervisord receives SIGTERM and forwards it to managed processes
- Each process has `stopwaitsecs` to shut down gracefully
- The scheduler may need the most time (up to 120s) if a long-running task is in progress
- Gunicorn's `graceful_timeout` handles in-flight HTTP requests (30s is generous)
- Docker's `stop_grace_period` must exceed the max `stopwaitsecs` to avoid premature SIGKILL

**Alternatives considered**:
- **Shorter timeouts**: Risk of killing in-flight requests or scheduler tasks mid-execution.

## Decision 7: Health Check Strategy

**Decision**: Combined health check that verifies both Nginx and Gunicorn are responding.

**Rationale**:
- Check `http://localhost:80/health` (Nginx serving) AND `http://localhost:8000/ping` (Django responding)
- If either fails, the container is marked unhealthy
- The scheduler doesn't have an HTTP endpoint, but if Gunicorn is healthy, the scheduler's database connection is likely healthy too
- Docker/compose can restart the container on persistent unhealthy status

**Alternatives considered**:
- **supervisorctl status check**: Checks process state but not actual responsiveness. A process can be RUNNING but deadlocked.
- **Check all three with supervisorctl + curl**: Over-engineered for the use case.

## Decision 8: Nginx Configuration Approach

**Decision**: Create a separate `nginx-aio.conf` file that is a copy of the existing `nginx.conf` with `proxy_pass` changed from `http://backend:8000` to `http://127.0.0.1:8000`.

**Rationale**:
- Only one line differs between the two configs
- Keeping a separate file avoids any modification to the existing `nginx.conf`
- Clear naming (`nginx-aio.conf`) makes the purpose obvious
- Future changes to the base `nginx.conf` will need to be manually synced to `nginx-aio.conf` (acceptable trade-off for zero breaking changes)

**Alternatives considered**:
- **Nginx envsubst template**: Could use `${BACKEND_HOST}` placeholder and resolve at runtime. More elegant but adds complexity and a runtime dependency. Could be a future improvement.
- **Symlink or include**: Nginx includes require more complex config structure.

## Decision 9: File Placement

**Decision**: Place all AiO-specific files in the repository root directory.

**Rationale**:
- `Dockerfile.aio` in root — needs access to both `backend/` and `frontend/` build contexts
- `docker-compose.aio.yml` in root — alongside existing `docker-compose.yml`
- `supervisord.conf` in root — copied into the image during build
- `nginx-aio.conf` in root — copied into the image during build
- `entrypoint-aio.sh` in root — copied into the image during build
- Root placement is the standard Docker convention for project-level Dockerfiles

**Alternatives considered**:
- **`docker/` subdirectory**: Cleaner filesystem but breaks Docker convention and requires context path adjustments.
- **Inside `backend/` or `frontend/`**: Doesn't make sense since AiO spans both.

## Decision 10: pnpm vs npm in Frontend Build Stage

**Decision**: Support both pnpm and npm with fallback, matching the existing `frontend/Dockerfile.compose`.

**Rationale**:
- The existing frontend Dockerfile already handles this: `pnpm install --frozen-lockfile || npm ci`
- The project uses pnpm (has `pnpm-lock.yaml`) but the fallback ensures robustness
- Replicating the same pattern maintains consistency

**Alternatives considered**:
- **Only pnpm**: Would break if someone clones without pnpm-lock.yaml.
- **Only npm**: Would ignore the existing pnpm lockfile.

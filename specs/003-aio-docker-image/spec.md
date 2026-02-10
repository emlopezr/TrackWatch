# Feature Specification: All-in-One Docker Image

**Feature Branch**: `003-aio-docker-image`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "AiO Docker Image - All-in-one Docker image that consolidates backend, scheduler, and frontend into a single container for simplified self-hosted deployment. Must coexist with the existing multi-container docker-compose setup without breaking changes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy TrackWatch with a single container (Priority: P1)

As a self-hosted user, I want to deploy TrackWatch using a single Docker container (plus a database) so that I can get the application running with minimal configuration and without managing multiple containers.

**Why this priority**: This is the core value proposition of the feature. Self-hosted users on platforms like CasaOS, Unraid, or Portainer expect single-image deployments. Reducing the number of containers from 4 to 2 (app + database) significantly lowers the barrier to adoption.

**Independent Test**: Can be fully tested by running `docker-compose -f docker-compose.aio.yml up -d`, providing the required environment variables, and verifying that the application is accessible and fully functional (frontend loads, API responds, scheduler runs).

**Acceptance Scenarios**:

1. **Given** a machine with Docker installed and a valid `.env` file, **When** the user runs `docker-compose -f docker-compose.aio.yml up -d`, **Then** the application starts with two containers (database + trackwatch) and the frontend is accessible on the configured port.
2. **Given** the AiO container is running, **When** the user navigates to the application URL, **Then** the React SPA loads, API requests to `/api/*` are proxied to the backend, and the user can log in with Spotify.
3. **Given** the AiO container is running, **When** the scheduler's configured time arrives, **Then** new releases are checked and playlists are updated automatically, just like the multi-container setup.

---

### User Story 2 - Preserve existing multi-container setup (Priority: P1)

As an existing user or developer, I want the current `docker-compose.yml` multi-container setup to continue working exactly as before so that the AiO option is purely additive and introduces no breaking changes.

**Why this priority**: Equal to P1 because breaking existing deployments is unacceptable. The AiO image must coexist as an alternative, not a replacement.

**Independent Test**: Can be tested by running `docker-compose up -d` (the original file) and verifying that all four services start and function correctly with no modifications to existing files.

**Acceptance Scenarios**:

1. **Given** the existing `docker-compose.yml`, `backend/Dockerfile.compose`, `frontend/Dockerfile.compose`, `backend/entrypoint.sh`, and `frontend/nginx.conf`, **When** the AiO feature is added, **Then** none of these files are modified.
2. **Given** a user running the existing multi-container setup, **When** they pull the latest code with AiO changes, **Then** their deployment continues to work without any reconfiguration.

---

### User Story 3 - Process resilience within the AiO container (Priority: P2)

As a self-hosted user running the AiO container, I want the internal processes (web server, backend, scheduler) to be supervised and automatically restarted if any of them crash, so that the application remains available without manual intervention.

**Why this priority**: Self-hosted users expect fire-and-forget reliability. If the backend process crashes inside the container, it should be restarted automatically rather than silently failing.

**Independent Test**: Can be tested by intentionally stopping a managed process inside the container and verifying it is automatically restarted by the process supervisor.

**Acceptance Scenarios**:

1. **Given** the AiO container is running with all three processes, **When** the backend process crashes, **Then** the process supervisor automatically restarts it and the application recovers without container restart.
2. **Given** the AiO container is running, **When** the scheduler process crashes, **Then** the process supervisor automatically restarts it and scheduled tasks resume.

---

### User Story 4 - Same environment variable experience (Priority: P2)

As a self-hosted user, I want to configure the AiO deployment using the same `.env` file format as the multi-container setup so that switching between deployment modes requires no learning curve.

**Why this priority**: Consistent configuration reduces friction. Users should be able to use the same `.env.docker.example` as a reference regardless of deployment mode.

**Independent Test**: Can be tested by using the same `.env` file with both `docker-compose.yml` and `docker-compose.aio.yml` and verifying both deployments work correctly.

**Acceptance Scenarios**:

1. **Given** a valid `.env` file configured for the multi-container setup, **When** the user switches to the AiO compose file, **Then** the application starts and functions correctly using the same environment variables.
2. **Given** the AiO container, **When** the user sets `SCHEDULER_HOURS` and `SCHEDULER_MINUTE` environment variables, **Then** the scheduler respects these settings just like in the multi-container setup.

---

### Edge Cases

- What happens when the database is not reachable at container startup? The AiO container should retry the database connection (same behavior as current `entrypoint.sh`) and eventually start all processes once the database is available.
- What happens when one of the three internal processes fails to start? The process supervisor should log the failure and continue retrying. The container's health check should reflect unhealthy status if the backend is down.
- What happens when the user provides an `.env` file with `DATABASE_HOST=db` (the multi-container default)? The AiO compose file should override `DATABASE_HOST` to point to the correct database hostname for the AiO network.
- What happens if the user runs both compose files simultaneously? This could cause port conflicts. Documentation should warn against running both at the same time on the same host.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an All-in-One Dockerfile that builds a single image containing the frontend (Nginx + React SPA), backend (Gunicorn + Django), and scheduler (APScheduler) processes.
- **FR-002**: The system MUST provide a separate `docker-compose.aio.yml` file that orchestrates the AiO container alongside a PostgreSQL database container.
- **FR-003**: The AiO container MUST use a process supervisor to manage and automatically restart the three internal processes (Nginx, Gunicorn, APScheduler scheduler).
- **FR-004**: The AiO container MUST run database migrations on startup before starting the application processes.
- **FR-005**: The AiO container MUST serve the React SPA and proxy `/api/*` requests to the backend, identical to the current Nginx behavior.
- **FR-006**: The AiO container MUST expose a single port (default 80) for all user-facing traffic.
- **FR-007**: The AiO container MUST provide a health check endpoint that reflects the status of the backend process.
- **FR-008**: The existing `docker-compose.yml` and all current Docker-related files (Dockerfiles, entrypoint, nginx.conf) MUST NOT be modified.
- **FR-009**: The AiO setup MUST use the same `.env` file format and variable names as the existing multi-container setup.
- **FR-010**: The Nginx configuration for the AiO image MUST proxy to `localhost` instead of the Docker service hostname `backend`, since all processes run in the same container.

### Key Entities

- **AiO Dockerfile**: Multi-stage build file that compiles the frontend and packages it with the backend runtime, Nginx, and process supervisor into a single image.
- **AiO Nginx Configuration**: A variant of the existing `nginx.conf` that proxies to `localhost:8000` instead of `backend:8000`.
- **AiO Entrypoint Script**: Startup script that handles database readiness check, migrations, static file collection, and launches the process supervisor.
- **Process Supervisor Configuration**: Configuration file defining the three managed processes and their restart policies.
- **AiO Docker Compose File**: Simplified compose file with only two services (database + trackwatch).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from cloning the repository to a fully running TrackWatch instance (AiO mode) in under 5 minutes, excluding Spotify Developer App creation.
- **SC-002**: The AiO container starts and passes its health check within 60 seconds on a standard machine (2 CPU cores, 4GB RAM).
- **SC-003**: All existing application features (Spotify login, artist following, playlist generation, release notifications, scheduled checks) work identically in AiO mode compared to multi-container mode.
- **SC-004**: Zero existing files are modified — the feature is purely additive (only new files created).
- **SC-005**: If any internal process crashes, the process supervisor restarts it within 10 seconds, and the application recovers without manual container restart.
- **SC-006**: The AiO image size remains under 700MB to be practical for self-hosted environments with limited storage.

## Assumptions

- Users deploying the AiO image will build it locally using `docker-compose -f docker-compose.aio.yml up -d --build`. Publishing a pre-built image to a container registry (which requires runtime environment variable injection for frontend configuration) is out of scope for this feature and will be addressed in a future phase.
- The process supervisor used will be `supervisord`, which is the most widely adopted solution for multi-process Docker containers in the self-hosted community.
- The AiO container will use the same base Python image as the current backend Dockerfile, with Nginx and Node.js added during the build stages.
- Self-hosted users are comfortable editing a `.env` file and running basic Docker commands.

## Scope Boundaries

### In Scope
- New `Dockerfile.aio` at repository root (multi-stage build)
- New `docker-compose.aio.yml` at repository root
- New `nginx-aio.conf` at repository root (or appropriate location)
- New `supervisord.conf` at repository root (or appropriate location)
- New `entrypoint-aio.sh` at repository root (or appropriate location)
- Documentation updates to reference the AiO deployment option

### Out of Scope
- Publishing pre-built images to Docker Hub or GHCR (future phase)
- Runtime environment variable injection for frontend (future phase, needed for pre-built images)
- Multi-architecture builds (linux/arm64 for Raspberry Pi, etc.)
- Integration with self-hosted platforms (CasaOS app store, Unraid templates, etc.)
- Modifications to application source code (frontend or backend)

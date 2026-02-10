# Tasks: All-in-One Docker Image

**Input**: Design documents from `/specs/003-aio-docker-image/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No setup phase needed — this feature creates new standalone files only. No project initialization, no dependencies to install, no frameworks to configure. Proceed directly to Phase 2.

---

## Phase 2: Foundational (Core AiO Infrastructure)

**Purpose**: Create the three configuration files that all user stories depend on. These files are the building blocks referenced by the Dockerfile and compose file in later phases.

- [x] T001 [P] Create supervisord process manager configuration in `supervisord.conf` at repository root. Define three programs (nginx, gunicorn, scheduler) with `nodaemon=true`, auto-restart policies, Docker-compatible logging to `/dev/fd/1` and `/dev/fd/2`, `stopasgroup=true`/`killasgroup=true` for gunicorn and scheduler, and timeout cascade (nginx: 30s, gunicorn: 60s, scheduler: 120s). Use `%(ENV_GUNICORN_WORKERS)s` syntax for environment variable interpolation. See plan.md "File 3: supervisord.conf" for full details.

- [x] T002 [P] Create AiO Nginx configuration in `nginx-aio.conf` at repository root. Copy the existing `frontend/nginx.conf` and change `proxy_pass http://backend:8000` to `proxy_pass http://127.0.0.1:8000`. All other settings (gzip, security headers, SPA fallback, static asset caching, health endpoint, Spotify header pass-through, timeouts, buffering) must be identical to the existing config.

- [x] T003 [P] Create AiO entrypoint script in `entrypoint-aio.sh` at repository root. Implement: `set -e`, database readiness check with retry loop (reuse logic from `backend/entrypoint.sh`), `python manage.py migrate --noinput`, `python manage.py collectstatic --noinput`, then `exec supervisord -c /etc/supervisord.conf`. Must support `SKIP_DB_WAIT` and `DB_WAIT_MAX_RETRIES` environment variables. Make file executable (`chmod +x`).

**Checkpoint**: All three config files exist and are ready to be referenced by the Dockerfile.

---

## Phase 3: User Story 1 - Deploy TrackWatch with a single container (Priority: P1) 🎯 MVP

**Goal**: A self-hosted user can deploy TrackWatch using `docker-compose -f docker-compose.aio.yml up -d --build` and have a fully working application (frontend + backend + scheduler) in a single container alongside PostgreSQL.

**Independent Test**: Run `docker-compose -f docker-compose.aio.yml up -d --build` with a valid `.env` file, then verify: frontend loads at `http://127.0.0.1`, API responds at `http://127.0.0.1/api/ping`, and `docker exec <container> supervisorctl status` shows all 3 processes RUNNING.

### Implementation for User Story 1

- [x] T004 [US1] Create multi-stage Dockerfile in `Dockerfile.aio` at repository root. Stage 1 (node:20-alpine): copy `frontend/` source, install pnpm via corepack, install dependencies with `pnpm install --frozen-lockfile || npm ci`, accept VITE_* build args, run `pnpm run build || npm run build`. Stage 2 (python:3.11-slim): install system deps (`libpq-dev`, `gcc`, `curl`, `nginx`), install Python deps from `backend/requirements.txt` + `supervisor` via pip, copy backend code from `backend/`, copy frontend build from stage 1 to `/usr/share/nginx/html`, remove default nginx config, copy `nginx-aio.conf` to `/etc/nginx/conf.d/default.conf`, copy `supervisord.conf` to `/etc/supervisord.conf`, copy `entrypoint-aio.sh` to `/entrypoint.sh` with `chmod +x`, set `WORKDIR /app`, expose port 80, add HEALTHCHECK (`curl -f http://localhost/health && curl -f http://localhost:8000/ping`), set ENTRYPOINT to `/entrypoint.sh`. See plan.md "File 1: Dockerfile.aio" for full details.

- [x] T005 [US1] Create AiO Docker Compose file in `docker-compose.aio.yml` at repository root. Define two services: (1) `db` — postgres:15-alpine with health check, persistent volume `trackwatch_aio_postgres_data`, env vars for DB name/user/password; (2) `trackwatch` — build from `Dockerfile.aio` with context `.`, build args for VITE_* variables, environment section with all backend vars (Django, DB, Spotify, Resend, Gunicorn, Scheduler) plus `DATABASE_HOST: db`, port `${PORT:-80}:80`, depends_on db (healthy), restart unless-stopped, `stop_grace_period: 150s`. Use network `trackwatch-aio-network` (separate from existing). See plan.md "File 2: docker-compose.aio.yml" for full details.

- [ ] T006 [US1] Build and smoke-test the AiO image. Run `docker-compose -f docker-compose.aio.yml up -d --build` with a valid `.env` file. Verify: (1) only 2 containers are running, (2) `curl http://localhost/health` returns 200, (3) `curl http://localhost:8000/ping` returns 200 from inside the container (via `docker exec`), (4) frontend loads in browser at configured port, (5) `docker exec <container> supervisorctl status` shows nginx, gunicorn, and scheduler all in RUNNING state.

**Checkpoint**: AiO deployment is fully functional. User Story 1 is complete and independently testable.

---

## Phase 4: User Story 2 - Preserve existing multi-container setup (Priority: P1)

**Goal**: Verify that no existing Docker files were modified by the AiO feature.

**Independent Test**: Run `docker-compose up -d` (original compose file) and verify all four services start correctly.

### Implementation for User Story 2

- [x] T007 [US2] Verify zero existing files were modified. Confirm that the following files have NOT been changed: `docker-compose.yml`, `backend/Dockerfile.compose`, `backend/entrypoint.sh`, `frontend/Dockerfile.compose`, `frontend/nginx.conf`, `.env.docker.example`. This can be verified with `git diff` on these specific files — diff should be empty.

- [ ] T008 [US2] Verify the existing multi-container setup still works. Run `docker-compose up -d` (original file) and confirm all four services (db, backend, scheduler, frontend) start and pass health checks. Verify the application is fully functional through the original setup.

**Checkpoint**: Both deployment modes coexist without interference.

---

## Phase 5: User Story 3 - Process resilience within AiO container (Priority: P2)

**Goal**: supervisord automatically restarts any crashed process inside the AiO container without requiring a full container restart.

**Independent Test**: Kill a managed process inside the container and verify supervisord restarts it automatically.

### Implementation for User Story 3

- [ ] T009 [US3] Verify auto-restart of Gunicorn. With the AiO container running, exec into the container and kill the gunicorn master process (`kill <pid>`). Verify that supervisord detects the crash and restarts gunicorn within 10 seconds. Confirm the API becomes responsive again at `/api/ping`.

- [ ] T010 [US3] Verify auto-restart of Scheduler. With the AiO container running, exec into the container and kill the scheduler process (`kill <pid>`). Verify that supervisord detects the crash and restarts the scheduler. Confirm via `supervisorctl status` that scheduler returns to RUNNING state.

- [ ] T011 [US3] Verify auto-restart of Nginx. With the AiO container running, exec into the container and stop nginx (`nginx -s stop`). Verify that supervisord detects the exit and restarts nginx. Confirm the frontend is accessible again at the configured port.

**Checkpoint**: All three processes are resilient to crashes.

---

## Phase 6: User Story 4 - Same environment variable experience (Priority: P2)

**Goal**: The same `.env` file works for both deployment modes without any changes.

**Independent Test**: Use the exact same `.env` file with both `docker-compose.yml` and `docker-compose.aio.yml` and verify both work.

### Implementation for User Story 4

- [ ] T012 [US4] Verify `.env` compatibility. Use the same `.env` file (based on `.env.docker.example`) to start both the multi-container setup (`docker-compose up -d`) and the AiO setup (`docker-compose -f docker-compose.aio.yml up -d --build`). Confirm both deployments start and function correctly with identical configuration. Note: `DATABASE_HOST` is overridden in `docker-compose.aio.yml` to `db`, so the user does not need to change it.

- [ ] T013 [US4] Verify scheduler environment variables. With the AiO container running, set custom `SCHEDULER_HOURS` and `SCHEDULER_MINUTE` values in `.env`. Restart the AiO container. Verify the scheduler respects the custom schedule by checking the logs for the configured cron expression.

**Checkpoint**: Environment variable experience is consistent across deployment modes.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final validation.

- [x] T014 Add `.dockerignore` entry or create a root-level `.dockerignore` for the AiO build context to exclude unnecessary files (`.git`, `specs/`, `.specify/`, `node_modules/`, `*.md` except README, etc.) to reduce build context size and speed up builds.

- [ ] T015 Verify AiO image size is under 700MB. Run `docker images` and check the size of the built AiO image. If over 700MB, investigate optimization opportunities (cleanup apt cache, multi-stage improvements, etc.).

- [ ] T016 Run quickstart.md validation. Follow the steps in `specs/003-aio-docker-image/quickstart.md` from scratch on a clean environment to verify the documented deployment flow works end-to-end.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — T001, T002, T003 can all run in parallel
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (T001-T003). T004 depends on T001, T002, T003 (Dockerfile references all three). T005 depends on T004 (compose references Dockerfile). T006 depends on T005.
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion (need AiO files to exist to verify no existing files were changed)
- **User Story 3 (Phase 5)**: Depends on Phase 3 completion (need running AiO container)
- **User Story 4 (Phase 6)**: Depends on Phase 3 completion (need working AiO setup)
- **Polish (Phase 7)**: Depends on Phase 3 completion at minimum

### User Story Dependencies

- **US1 (P1)**: Core implementation — all other stories depend on this
- **US2 (P1)**: Verification only — depends on US1 being complete (files exist)
- **US3 (P2)**: Verification only — depends on US1 (running container)
- **US4 (P2)**: Verification only — depends on US1 (working deployment)
- **US3 and US4** can run in parallel after US1 is complete

### Within Each Phase

Phase 2: T001, T002, T003 are all [P] — can run in parallel (different files, no dependencies)
Phase 3: T004 → T005 → T006 (sequential: Dockerfile → Compose → Smoke test)
Phase 4: T007, T008 can run in parallel
Phase 5: T009, T010, T011 can run in parallel
Phase 6: T012 → T013 (sequential: verify compatibility before testing specific vars)
Phase 7: T014, T015, T016 can run in parallel

### Parallel Opportunities

```text
# Phase 2 — All three foundational files in parallel:
Task: T001 "Create supervisord.conf"
Task: T002 "Create nginx-aio.conf"
Task: T003 "Create entrypoint-aio.sh"

# After US1 complete — US3 and US4 verification in parallel:
Task: T009-T011 "Process resilience tests (US3)"
Task: T012-T013 "Env var compatibility tests (US4)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T003) — create 3 config files in parallel
2. Complete Phase 3: User Story 1 (T004-T006) — create Dockerfile + compose + smoke test
3. **STOP and VALIDATE**: AiO deployment works end-to-end
4. This delivers the core value: self-hosted users can deploy with 2 containers

### Incremental Delivery

1. Phase 2 (T001-T003) → Config files ready
2. Phase 3 (T004-T006) → AiO works → **MVP complete!**
3. Phase 4 (T007-T008) → Verified no breaking changes
4. Phase 5 (T009-T011) → Process resilience confirmed
5. Phase 6 (T012-T013) → Env var compatibility confirmed
6. Phase 7 (T014-T016) → Polished and documented

---

## Notes

- This feature creates **5 new files** and modifies **0 existing files**
- No application code changes (frontend/backend) are needed
- US2, US3, US4 are verification-only stories (no new files to create)
- The critical implementation work is concentrated in Phase 2 (3 config files) and Phase 3 (Dockerfile + compose)
- Total: 16 tasks across 7 phases

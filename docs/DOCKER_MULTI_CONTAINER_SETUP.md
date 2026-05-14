# Docker Multi-Container Setup

This is the recommended deployment mode for TrackWatch. It runs each component separately:

- `frontend`: Nginx serving the React app and proxying `/api`
- `backend`: Django + Gunicorn
- `db`: PostgreSQL
- `scheduler`: optional APScheduler worker, enabled with the `scheduler` Compose profile

The database from the previous All-in-One container is not reused. This setup creates a new PostgreSQL volume.

## Published Images

| Component | GHCR image | Docker Hub image |
| --- | --- | --- |
| Frontend | `ghcr.io/emlopezr/trackwatch-frontend:latest` | `emlopezr/trackwatch-frontend:latest` |
| Backend | `ghcr.io/emlopezr/trackwatch-backend:latest` | `emlopezr/trackwatch-backend:latest` |
| Scheduler | `ghcr.io/emlopezr/trackwatch-scheduler:latest` | `emlopezr/trackwatch-scheduler:latest` |
| Database | `postgres:15-alpine` | `postgres:15-alpine` |

## 1. Create The Deployment Directory

If the old AiO container is still running on port 80, stop it first:

```bash
docker stop trackwatch
docker rm trackwatch
```

You can keep the old AiO volume around until you confirm the new deployment works.

```bash
mkdir -p /opt/trackwatch
cd /opt/trackwatch
```

Put the repository `docker-compose.yml` in this directory, or clone the repository:

```bash
git clone https://github.com/emlopezr/trackwatch.git .
```

## 2. Create `.env`

Use your current AiO values, with the database values added for the new separate PostgreSQL container.

```env
SECRET_KEY=xxx
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx

VITE_SPOTIFY_REDIRECT_URI=https://trackwatch.emlopezr.com/callback
VITE_TRACKWATCH_API_BASE_URL=/api
VITE_HIDE_PUBLIC_LOGIN=true
BACKEND_PROXY_PASS=http://backend:8000

RESEND_API_KEY=xxx
ADMIN_EMAIL=lopezrodemmanuel@gmail.com
EMAIL_DOMAIN=emlopezr.com

SCHEDULER_HOURS=1,7,13,19
SCHEDULER_MINUTE=0

DEBUG=False
ALLOWED_HOSTS=*
PORT=80

DATABASE_NAME=trackwatch
DATABASE_USER=trackwatch
DATABASE_PASSWORD=replace-with-a-new-strong-password
DATABASE_HOST=db
DATABASE_PORT=5432

FRONTEND_IMAGE=ghcr.io/emlopezr/trackwatch-frontend:latest
BACKEND_IMAGE=ghcr.io/emlopezr/trackwatch-backend:latest
SCHEDULER_IMAGE=ghcr.io/emlopezr/trackwatch-scheduler:latest
```

`SECRET_KEY` is also currently used as the admin key for `POST /actions/releases`, so keep it private.

## 3. Deploy Without The Internal Scheduler

Use this mode if you will trigger release checks from n8n, cron, or another external automation.

```bash
docker compose pull
docker compose up -d
```

This starts only:

- `db`
- `backend`
- `frontend`

The `scheduler` service is not started unless the `scheduler` profile is enabled.

## 4. Trigger Release Checks From n8n

Create an HTTP Request node with:

- Method: `POST`
- URL: `https://trackwatch.emlopezr.com/api/actions/releases`
- Header: `X-Admin-Key: xxx`

Use the same value as `SECRET_KEY` for `X-Admin-Key`.

Optional query parameter:

```text
daysLimit=30
```

Example request:

```bash
curl -X POST "https://trackwatch.emlopezr.com/api/actions/releases?daysLimit=30" \
  -H "X-Admin-Key: xxx"
```

The endpoint returns immediately and runs the update in a background thread in the backend container.

## 5. Deploy With The Internal Scheduler

If you prefer TrackWatch to run its own scheduled checks, enable the Compose profile:

```bash
docker compose pull
docker compose --profile scheduler up -d
```

With your `.env`, the scheduler runs at `01:00`, `07:00`, `13:00`, and `19:00`.

To stop only the scheduler later:

```bash
docker compose stop scheduler
```

## 6. Verify The Deployment

```bash
docker compose ps
docker compose logs -f backend
curl -fsSL http://127.0.0.1/health
curl -fsSL http://127.0.0.1/api/ping
```

For the public domain:

```bash
curl -fsSL https://trackwatch.emlopezr.com/health
curl -fsSL https://trackwatch.emlopezr.com/api/ping
```

## 7. Update Later

```bash
cd /opt/trackwatch
docker compose pull
docker compose up -d
```

If you use the internal scheduler:

```bash
docker compose pull
docker compose --profile scheduler up -d
```

## 8. Reset The New Database

This deletes the new PostgreSQL volume.

```bash
docker compose down -v
docker compose up -d
```

Use `--profile scheduler` on the second command if you want the internal scheduler enabled.

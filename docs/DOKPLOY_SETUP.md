# Dokploy Setup

This guide deploys TrackWatch as separate Dokploy resources:

- `trackwatch-db`: PostgreSQL database
- `trackwatch-backend`: Django API
- `trackwatch-frontend`: React/Nginx app
- `trackwatch-scheduler`: optional worker app

If you will trigger updates from n8n, do not create the scheduler app.

## Images

Use these Docker images in Dokploy:

| Component | Image | Exposed port |
| --- | --- | --- |
| Frontend | `ghcr.io/emlopezr/trackwatch-frontend:latest` | `80` |
| Backend | `ghcr.io/emlopezr/trackwatch-backend:latest` | `8000` |
| Scheduler | `ghcr.io/emlopezr/trackwatch-scheduler:latest` | none |

## 1. Create PostgreSQL

Create a PostgreSQL database in Dokploy:

- Name: `trackwatch-db`
- Database: `trackwatch`
- User: `trackwatch`
- Password: generate a new strong password

Keep the internal connection details shown by Dokploy. The backend can use either `DATABASE_URL` or the split `DATABASE_*` variables.

## 2. Create The Backend App

Create a new app:

- Provider: `Docker`
- Docker Image: `ghcr.io/emlopezr/trackwatch-backend:latest`
- Registry URL: `ghcr.io`
- Port: `8000`
- Domain: `trackwatch-api.emlopezr.com`
- Path: `/`
- HTTPS: enabled

Environment:

```env
SECRET_KEY=xxx
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx

RESEND_API_KEY=xxx
ADMIN_EMAIL=lopezrodemmanuel@gmail.com
EMAIL_DOMAIN=emlopezr.com

DEBUG=False
ALLOWED_HOSTS=*

DATABASE_NAME=trackwatch
DATABASE_USER=trackwatch
DATABASE_PASSWORD=replace-with-your-dokploy-db-password
DATABASE_HOST=replace-with-your-dokploy-db-host
DATABASE_PORT=5432
```

Alternatively, if Dokploy gives you a Postgres URL, use this instead of the split database variables:

```env
DATABASE_URL=postgresql://trackwatch:password@host:5432/trackwatch
```

Health check:

```text
/ping
```

## 3. Create The Frontend App

Create a new app:

- Provider: `Docker`
- Docker Image: `ghcr.io/emlopezr/trackwatch-frontend:latest`
- Registry URL: `ghcr.io`
- Port: `80`
- Domain: `trackwatch.emlopezr.com`
- Path: `/`
- HTTPS: enabled

Environment:

```env
VITE_SPOTIFY_CLIENT_ID=xxx
VITE_SPOTIFY_CLIENT_SECRET=xxx
VITE_SPOTIFY_REDIRECT_URI=https://trackwatch.emlopezr.com/callback
VITE_TRACKWATCH_API_BASE_URL=/api
VITE_HIDE_PUBLIC_LOGIN=true
BACKEND_PROXY_PASS=https://trackwatch-api.emlopezr.com
BACKEND_PROXY_HOST=trackwatch-api.emlopezr.com
```

`BACKEND_PROXY_PASS` tells the frontend Nginx container where to send `/api/*` requests. With the value above:

- Browser calls `https://trackwatch.emlopezr.com/api/ping`
- Frontend strips `/api`
- Frontend proxies to `https://trackwatch-api.emlopezr.com/ping`

`BACKEND_PROXY_HOST` is used for the upstream `Host` header and TLS SNI. It must match the backend domain when `BACKEND_PROXY_PASS` uses `https://`.

Health check:

```text
/health
```

## 4. Use n8n Instead Of Scheduler

Do not create the scheduler app.

In n8n, create an HTTP Request node:

- Method: `POST`
- URL: `https://trackwatch-api.emlopezr.com/actions/releases`
- Header: `X-Admin-Key: xxx`

Use the same value as `SECRET_KEY` for `X-Admin-Key`.

Optional query parameter:

```text
daysLimit=30
```

Equivalent curl:

```bash
curl -X POST "https://trackwatch-api.emlopezr.com/actions/releases?daysLimit=30" \
  -H "X-Admin-Key: xxx"
```

You can also call through the frontend domain:

```bash
curl -X POST "https://trackwatch.emlopezr.com/api/actions/releases?daysLimit=30" \
  -H "X-Admin-Key: xxx"
```

## 5. Optional: Create The Scheduler App

Create this only if you want TrackWatch to schedule release checks internally.

- Provider: `Docker`
- Docker Image: `ghcr.io/emlopezr/trackwatch-scheduler:latest`
- Registry URL: `ghcr.io`
- Domain: none
- Public port: none

Environment:

```env
SECRET_KEY=xxx
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx

RESEND_API_KEY=xxx
ADMIN_EMAIL=lopezrodemmanuel@gmail.com
EMAIL_DOMAIN=emlopezr.com

SCHEDULER_HOURS=1,7,13,19
SCHEDULER_MINUTE=0

DEBUG=False
ALLOWED_HOSTS=*

DATABASE_NAME=trackwatch
DATABASE_USER=trackwatch
DATABASE_PASSWORD=replace-with-your-dokploy-db-password
DATABASE_HOST=replace-with-your-dokploy-db-host
DATABASE_PORT=5432
```

Use the same database variables as the backend app.

## 6. Deployment Order

Deploy in this order:

1. PostgreSQL
2. Backend
3. Frontend
4. Scheduler, only if you want it

Then verify:

```bash
curl -fsSL https://trackwatch-api.emlopezr.com/ping
curl -fsSL https://trackwatch.emlopezr.com/health
curl -fsSL https://trackwatch.emlopezr.com/api/ping
```

## 7. GitHub Actions Deploy Webhooks

Each Dokploy app has its own deployment webhook. Add these GitHub repository secrets:

| Secret | Dokploy app |
| --- | --- |
| `BACKEND_DEPLOY_WEBHOOK_URL` | `trackwatch-backend` |
| `FRONTEND_DEPLOY_WEBHOOK_URL` | `trackwatch-frontend` |
| `SCHEDULER_DEPLOY_WEBHOOK_URL` | `trackwatch-scheduler`, only if you deploy it |

The workflow publishes and deploys only the affected component:

- Changes under `backend/**` publish `trackwatch-backend` and `trackwatch-scheduler`, then trigger their webhooks.
- Changes under `frontend/**` publish `trackwatch-frontend`, then trigger its webhook.
- Changes to `docker-compose.yml` or `.github/workflows/docker-publish.yml` affect all component images.

If you are using n8n instead of the internal scheduler, do not set `SCHEDULER_DEPLOY_WEBHOOK_URL` and do not create the scheduler app. In that case, backend changes will still publish the scheduler image, but deployment is only needed if the scheduler app exists.

## 8. Spotify Redirect URI

In the Spotify Developer Dashboard, set:

```text
https://trackwatch.emlopezr.com/callback
```

Do not use the backend API domain as the Spotify redirect URI.

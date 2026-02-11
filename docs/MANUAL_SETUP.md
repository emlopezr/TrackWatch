# Manual Development Setup

This guide covers setting up TrackWatch for local development without Docker. For production deployment, see the [main README](../README.md) for Docker instructions.

## Prerequisites

- Python 3.10+
- Node.js 18+ (with pnpm recommended)
- PostgreSQL 13+
- Spotify Developer Account

## Spotify App Configuration

1. Create a Spotify app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. In your Spotify app settings, add the following **Redirect URI**:
   ```
   http://127.0.0.1:5173/callback
   ```
   > **Note:** Spotify only allows `http://` for `127.0.0.1`. LAN IPs and custom domains require HTTPS. `localhost` is not accepted.
3. Note your **Client ID** and **Client Secret** for the environment configuration

## Database Setup

1. Install PostgreSQL if not already installed
2. Create a database for TrackWatch:
   ```bash
   createdb trackwatch
   ```

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database and Spotify credentials

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=*

DATABASE_NAME=trackwatch
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# Optional: Email notifications
RESEND_API_KEY=
ADMIN_EMAIL=
```

## Frontend Setup

```bash
cd frontend

# Install dependencies (using pnpm)
pnpm install
# Or with npm: npm install

# Configure environment
cp .env.example .env
# Edit .env with your Spotify credentials

# Start development server
pnpm run dev
# Or with npm: npm run dev
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_SPOTIFY_CLIENT_ID=your-spotify-client-id
VITE_SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
VITE_TRACKWATCH_API_BASE_URL=http://127.0.0.1:8000
```

## Running the Background Scheduler

For automatic release detection, run the scheduler in a separate terminal:

```bash
cd backend
source venv/bin/activate
python manage.py run_scheduler
```

Options:
- `--hours 7,14,21` - Hours to run (default: 7am, 2pm, 9pm)
- `--minute 0` - Minute of the hour (default: 0)
- `--run-now` - Run immediately on startup

## Accessing the Application

- **Frontend:** http://127.0.0.1:5173
- **Backend API:** http://127.0.0.1:8000

> **Important:** Access the frontend at `http://127.0.0.1:5173` (not `localhost`) to match the Spotify redirect URI configuration.

## Development Commands

### Frontend

```bash
npm run dev      # Start dev server on :5173
npm run build    # Type check + production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

### Backend

```bash
python manage.py runserver      # Start dev server on :8000
python manage.py migrate        # Run database migrations
python manage.py makemigrations # Create new migrations
python manage.py run_scheduler  # Run background task scheduler
```

## Troubleshooting

### OAuth Redirect Issues

If Spotify OAuth fails, ensure:
1. The redirect URI in your Spotify app matches exactly: `http://127.0.0.1:5173/callback`
2. You're accessing the frontend via `127.0.0.1`, not `localhost`
3. Both Client ID and Secret are correctly set in both frontend and backend `.env` files

### Database Connection Errors

Verify PostgreSQL is running and credentials in `.env` are correct:
```bash
psql -U your_db_user -d trackwatch -c "SELECT 1;"
```

### CORS Errors

The backend allows CORS from common development origins. If you're using a different port, update `CORS_ALLOWED_ORIGINS` in `backend/trackwatch/settings.py`.

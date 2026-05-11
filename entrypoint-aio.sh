#!/bin/bash
set -e

echo "=== TrackWatch All-in-One Container Starting ==="

# --- PostgreSQL initialization ---
PG_DATA="/var/lib/postgresql/data"
DB_NAME="${DATABASE_NAME:-trackwatch}"
DB_USER="${DATABASE_USER:-trackwatch}"
DB_PASS="${DATABASE_PASSWORD:-trackwatch}"
PG_BINDIR="${PG_BINDIR:-$(pg_config --bindir)}"

if [ -z "$PG_BINDIR" ] || [ ! -x "$PG_BINDIR/postgres" ]; then
    echo "PostgreSQL binaries not found. Checked: ${PG_BINDIR:-<empty>}"
    exit 1
fi

echo "Using PostgreSQL binaries from: $PG_BINDIR"

# Initialize database if data directory is empty (first run)
if [ ! -f "$PG_DATA/PG_VERSION" ]; then
    echo "Initializing PostgreSQL database..."
    chown -R postgres:postgres "$PG_DATA"
    su - postgres -c "'$PG_BINDIR'/initdb -D '$PG_DATA'"

    # Start PostgreSQL temporarily to create user and database
    su - postgres -c "'$PG_BINDIR'/pg_ctl -D '$PG_DATA' -w start -o '-c listen_addresses=127.0.0.1'"

    # Create user and database
    su - postgres -c "psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';\""  2>/dev/null || true
    su - postgres -c "psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\""  2>/dev/null || true
    su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;\""

    # Stop temporary PostgreSQL (supervisord will start it properly)
    su - postgres -c "'$PG_BINDIR'/pg_ctl -D '$PG_DATA' -w stop"
    echo "PostgreSQL initialized successfully!"
else
    echo "PostgreSQL data directory found, skipping initialization."
fi

# Ensure correct ownership after volume mount
chown -R postgres:postgres "$PG_DATA" /run/postgresql

# Set database connection to localhost (internal PostgreSQL)
export DATABASE_HOST="127.0.0.1"
export DATABASE_PORT="5432"
export DATABASE_NAME="$DB_NAME"
export DATABASE_USER="$DB_USER"
export DATABASE_PASSWORD="$DB_PASS"
export PG_BINDIR

# Start PostgreSQL via supervisord in background, then wait for it
echo "Starting all services via supervisord..."

# Start supervisord in background temporarily to get PostgreSQL running
supervisord -c /etc/supervisord.conf &
SUPERVISORD_PID=$!

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
MAX_RETRIES=${DB_WAIT_MAX_RETRIES:-30}
RETRY_COUNT=0

until pg_isready -h 127.0.0.1 -p 5432 -q; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "Max retries ($MAX_RETRIES) reached waiting for PostgreSQL."
        exit 1
    fi
    echo "PostgreSQL unavailable - retrying in 1 second... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 1
done
echo "PostgreSQL is ready!"

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Generate runtime env.js for frontend (allows pre-built images to use env vars)
echo "Generating frontend runtime configuration..."
cat > /usr/share/nginx/html/env.js << ENVEOF
window.__ENV__ = {
  VITE_SPOTIFY_CLIENT_ID: "${SPOTIFY_CLIENT_ID:-}",
  VITE_SPOTIFY_CLIENT_SECRET: "${SPOTIFY_CLIENT_SECRET:-}",
  VITE_SPOTIFY_REDIRECT_URI: "${VITE_SPOTIFY_REDIRECT_URI:-}",
  VITE_TRACKWATCH_API_BASE_URL: "${VITE_TRACKWATCH_API_BASE_URL:-/api}",
  VITE_HIDE_PUBLIC_LOGIN: "${VITE_HIDE_PUBLIC_LOGIN:-false}"
};
ENVEOF

echo "=== TrackWatch is running! ==="

# Wait for supervisord (it's already our main process)
wait $SUPERVISORD_PID

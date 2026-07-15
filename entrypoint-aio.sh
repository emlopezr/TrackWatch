#!/bin/bash
set -e

echo "=== TrackWatch All-in-One Container Starting ==="

# --- PostgreSQL initialization ---
PG_DATA="/var/lib/postgresql/data"
DB_NAME="${DATABASE_NAME:-trackwatch}"
DB_USER="${DATABASE_USER:-trackwatch}"
DB_PASS="${DATABASE_PASSWORD:?Database password required}"
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
    runuser -u postgres -- "$PG_BINDIR/initdb" -D "$PG_DATA" --auth-local=peer --auth-host=scram-sha-256

    # Start PostgreSQL temporarily to create user and database
    runuser -u postgres -- "$PG_BINDIR/pg_ctl" -D "$PG_DATA" -w start -o "-c listen_addresses=127.0.0.1"

    # Create the role and database without interpolating credentials into shell or SQL.
    runuser -u postgres -- env DB_NAME="$DB_NAME" DB_USER="$DB_USER" DB_PASS="$DB_PASS" python - <<'PY'
import os

import psycopg2
from psycopg2 import sql

database_name = os.environ["DB_NAME"]
database_user = os.environ["DB_USER"]
database_password = os.environ["DB_PASS"]

connection = psycopg2.connect(dbname="postgres")
try:
    connection.autocommit = True
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 FROM pg_roles WHERE rolname = %s", [database_user])
        if cursor.fetchone() is None:
            cursor.execute(
                sql.SQL("CREATE ROLE {} LOGIN PASSWORD %s").format(sql.Identifier(database_user)),
                [database_password],
            )

        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", [database_name])
        if cursor.fetchone() is None:
            cursor.execute(
                sql.SQL("CREATE DATABASE {} OWNER {}").format(
                    sql.Identifier(database_name),
                    sql.Identifier(database_user),
                )
            )
finally:
    connection.close()
PY

    # Stop temporary PostgreSQL (supervisord will start it properly)
    runuser -u postgres -- "$PG_BINDIR/pg_ctl" -D "$PG_DATA" -w stop
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
runuser -u trackwatch --preserve-environment -- python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
runuser -u trackwatch --preserve-environment -- python manage.py collectstatic --noinput

# Generate runtime env.js for frontend (allows pre-built images to use env vars)
echo "Generating frontend runtime configuration..."
# Only expose public frontend flags here; Spotify secrets must stay server-side.
cat > /usr/share/nginx/html/env.js << ENVEOF
window.__ENV__ = {
  VITE_HIDE_PUBLIC_LOGIN: "${VITE_HIDE_PUBLIC_LOGIN:-false}"
};
ENVEOF

echo "=== TrackWatch is running! ==="

# Start application processes only after the database schema and runtime config are ready.
supervisorctl -c /etc/supervisord.conf start nginx gunicorn scheduler

# Wait for supervisord (it's already our main process)
wait $SUPERVISORD_PID

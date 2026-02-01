#!/bin/bash
set -e

echo "=== TrackWatch Backend Starting ==="

# Skip database wait if SKIP_DB_WAIT is set (useful for Railway/managed databases)
if [ "${SKIP_DB_WAIT:-false}" = "true" ]; then
    echo "Skipping database wait (SKIP_DB_WAIT=true)"
else
    # Wait for database to be ready with timeout
    echo "Waiting for database..."
    MAX_RETRIES=${DB_WAIT_MAX_RETRIES:-30}
    RETRY_COUNT=0
    
    until python << 'EOF'
import sys
import psycopg2
from decouple import config
try:
    conn = psycopg2.connect(
        dbname=config('DATABASE_NAME'),
        user=config('DATABASE_USER'),
        password=config('DATABASE_PASSWORD'),
        host=config('DATABASE_HOST'),
        port=config('DATABASE_PORT', default='5432')
    )
    conn.close()
    print("Database connection successful")
    sys.exit(0)
except Exception as e:
    print(f"Database connection failed: {e}")
    sys.exit(1)
EOF
    do
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
            echo "Max retries ($MAX_RETRIES) reached. Proceeding anyway..."
            break
        fi
        echo "Database unavailable - retrying in 2 seconds... (attempt $RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    done
    echo "Database check complete!"
fi

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn
echo "Starting Gunicorn server..."
exec gunicorn trackwatch.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers ${GUNICORN_WORKERS:-2} \
    --threads ${GUNICORN_THREADS:-4} \
    --timeout ${GUNICORN_TIMEOUT:-120} \
    --access-logfile - \
    --error-logfile - \
    --capture-output \
    --enable-stdio-inheritance

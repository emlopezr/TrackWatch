#!/bin/bash
set -e

echo "=== TrackWatch Backend Starting ==="

# Wait for database to be ready
echo "Waiting for database..."
while ! python -c "
import psycopg2
from decouple import config
try:
    conn = psycopg2.connect(
        dbname=config('DATABASE_NAME'),
        user=config('DATABASE_USER'),
        password=config('DATABASE_PASSWORD'),
        host=config('DATABASE_HOST'),
        port=config('DATABASE_PORT')
    )
    conn.close()
    exit(0)
except:
    exit(1)
" 2>/dev/null; do
    echo "Database unavailable - waiting..."
    sleep 2
done
echo "Database is ready!"

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

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

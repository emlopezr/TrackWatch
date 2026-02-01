#!/bin/bash
set -e

echo "=== TrackWatch Backend Starting ==="

# Wait for database to be ready
echo "Waiting for database..."
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
    echo "Database unavailable - retrying in 2 seconds..."
    sleep 2
done
echo "Database is ready!"

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

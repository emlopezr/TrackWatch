FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN groupadd --system --gid 1001 trackwatch \
    && useradd --system --uid 1001 --gid trackwatch --home-dir /app trackwatch \
    && mkdir -p /app/staticfiles \
    && chown -R trackwatch:trackwatch /app /entrypoint.sh \
    && chmod +x /entrypoint.sh

USER trackwatch

FROM base AS backend

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]

FROM base AS scheduler

ENTRYPOINT []
CMD ["python", "manage.py", "run_scheduler"]

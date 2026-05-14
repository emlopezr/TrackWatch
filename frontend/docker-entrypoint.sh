#!/bin/sh
set -eu

export BACKEND_PROXY_PASS="${BACKEND_PROXY_PASS:-http://backend:8000}"
export BACKEND_PROXY_HOST="${BACKEND_PROXY_HOST:-$(printf '%s' "$BACKEND_PROXY_PASS" | sed -E 's#^[a-zA-Z][a-zA-Z0-9+.-]*://([^/:]+).*#\1#')}"
export NGINX_RESOLVER="${NGINX_RESOLVER:-127.0.0.11}"

envsubst '${BACKEND_PROXY_PASS} ${BACKEND_PROXY_HOST} ${NGINX_RESOLVER}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

cat > /usr/share/nginx/html/env.js << EOF
window.__ENV__ = {
  VITE_HIDE_PUBLIC_LOGIN: "${VITE_HIDE_PUBLIC_LOGIN:-false}"
};
EOF

exec "$@"

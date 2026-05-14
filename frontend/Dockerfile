# Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* package-lock.json* ./

RUN corepack enable && corepack prepare pnpm@10.6.3 --activate
RUN pnpm install --frozen-lockfile || npm ci

COPY . .

RUN pnpm run build || npm run build

FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

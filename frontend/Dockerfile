# Build the React application
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml package-lock.json* ./

RUN corepack enable && corepack prepare pnpm@11.11.0 --activate
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

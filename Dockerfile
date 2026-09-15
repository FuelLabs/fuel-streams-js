# Build stage: install the bun workspace and build the demo site (packages/simple-app).
FROM node:22-bookworm-slim AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g bun@1.3.10

WORKDIR /app

ENV NODE_ENV=production
# Skip the husky git hook install (root "prepare" script); there is no .git in the image.
ENV HUSKY=0

COPY . .

RUN bun install --frozen-lockfile

# turbo builds @fuels/streams first (dependsOn ^build), then simple-app (tsc -b && vite build).
RUN bun run build --filter simple-app

# Runtime stage: serve the static output with nginx.
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/simple-app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

FROM node:20-alpine AS base

WORKDIR /app

RUN npm install -g pnpm

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile

COPY apps/web/ ./apps/web

RUN pnpm --filter web generate:client || echo "Skipping API client generation"

RUN pnpm --filter web build

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/build/client /usr/share/nginx/html

COPY --from=builder /app/apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8

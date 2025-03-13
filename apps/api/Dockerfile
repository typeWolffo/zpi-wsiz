FROM node:20-alpine AS base

WORKDIR /app

RUN npm install -g pnpm

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile

COPY apps/api/ ./apps/api/

RUN pnpm --filter api build

RUN pnpm --filter api deploy --prod ./api-prod

FROM base AS runner
WORKDIR /app

COPY --from=builder /app/api-prod/ ./

RUN mkdir -p ./dist

COPY --from=builder /app/apps/api/dist/ ./dist/

COPY --from=builder /app/apps/api/.env ./.env

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/src/main"]

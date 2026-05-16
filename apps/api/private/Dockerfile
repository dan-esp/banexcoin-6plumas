FROM node:lts-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile && pnpm approve-builds

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm run build

FROM base AS pruned
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs node-app
COPY --from=pruned  --chown=node-app:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=node-app:nodejs /app/dist         ./dist
COPY --from=builder --chown=node-app:nodejs /app/package.json ./package.json
USER node-app
EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/main.js"]

FROM node:lts-alpine AS base
ARG PNPM_VERSION=10.33.2

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Docker builds must stay non-interactive; do not run local build-script approval flows here.
RUN corepack enable \
 && corepack prepare pnpm@${PNPM_VERSION} --activate \
 && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable \
 && corepack prepare pnpm@${PNPM_VERSION} --activate \
 && pnpm run build

FROM base AS pruned
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# The runtime image only needs production dependencies; skip package scripts here
# to avoid pnpm build-policy prompts for packages like @nestjs/core.
RUN corepack enable \
 && corepack prepare pnpm@${PNPM_VERSION} --activate \
 && pnpm install --frozen-lockfile --prod --ignore-scripts

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

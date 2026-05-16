FROM oven/bun:1-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* bun.lockb* ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile || bun install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ./node_modules/.bin/prisma generate
RUN bun build src/index.ts --target=bun --outfile=dist/index.js --minify

FROM base AS runner
WORKDIR /app
RUN apk add --no-cache curl \
 && addgroup --system --gid 1001 bunjs \
 && adduser --system --uid 1001 --ingroup bunjs bun-app
COPY --from=builder --chown=bun-app:bunjs /app/dist                         ./dist
COPY --from=builder --chown=bun-app:bunjs /app/node_modules/.prisma         ./node_modules/.prisma
COPY --from=builder --chown=bun-app:bunjs /app/node_modules/@prisma         ./node_modules/@prisma
COPY --from=builder --chown=bun-app:bunjs /app/package.json                 ./package.json
USER bun-app
EXPOSE 8080
ENV PORT=8080
CMD ["bun", "run", "dist/index.js"]

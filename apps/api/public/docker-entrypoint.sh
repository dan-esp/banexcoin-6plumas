#!/bin/sh
set -e

# Public API owns the Mongo schema (Prisma datasource: MONGODB_URI).
# Idempotent: prisma db push only applies missing indexes / embedded shape changes.
echo "Syncing MongoDB schema with prisma db push..."
./node_modules/.bin/prisma db push --accept-data-loss --skip-generate

# Optional seed. Only runs when SEED_ENABLED=true. The seed itself is idempotent:
# it checks for an existing local-seed-* fingerprint and exits early if present.
# Set SEED_FORCE=true to wipe the seeded fixtures and reseed from scratch.
if [ "${SEED_ENABLED:-false}" = "true" ]; then
  echo "SEED_ENABLED=true — running seed (skips if data already present)..."
  bun run prisma/seed-local.ts
fi

exec "$@"

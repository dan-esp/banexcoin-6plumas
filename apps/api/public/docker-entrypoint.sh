#!/bin/sh
set -e

# Public API owns the Mongo schema (Prisma datasource: MONGODB_URI).
# `prisma db push` is the MongoDB-equivalent of migrate deploy — it syncs
# indexes and embedded shape declarations. Idempotent and safe to run on every boot.
echo "Syncing MongoDB schema with prisma db push..."
bun run migrate:deploy

exec "$@"

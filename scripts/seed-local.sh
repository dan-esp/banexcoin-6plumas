#!/usr/bin/env sh
set -eu

CONTAINER_NAME="banexcoin.prod.public-api"

if command -v docker >/dev/null 2>&1 &&
  docker ps --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  echo "Seeding local data through $CONTAINER_NAME..."
  docker exec "$CONTAINER_NAME" bun run seed:local
  exit 0
fi

echo "Seeding local data through host public API workspace..."
bun run --cwd ./apps/api/public seed:local

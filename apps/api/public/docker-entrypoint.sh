#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-false}" = "true" ] || [ "${RUN_MIGRATIONS:-false}" = "1" ]; then
  echo "Running public API database migration hook..."
  if [ -n "${MIGRATION_COMMAND:-}" ]; then
    sh -c "$MIGRATION_COMMAND"
  else
    bun run migrate:deploy
  fi
else
  echo "Skipping public API database migrations."
fi

exec "$@"

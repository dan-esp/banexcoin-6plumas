#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-false}" = "true" ] || [ "${RUN_MIGRATIONS:-false}" = "1" ]; then
  echo "Running frontend migration hook..."
  if [ -n "${MIGRATION_COMMAND:-}" ]; then
    sh -c "$MIGRATION_COMMAND"
  else
    npm run migrate:deploy --if-present
  fi
else
  echo "Skipping frontend migrations."
fi

exec "$@"

#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-false}" = "true" ] || [ "${RUN_MIGRATIONS:-false}" = "1" ]; then
  echo "Running AI API database migration hook..."
  if [ -n "${MIGRATION_COMMAND:-}" ]; then
    sh -c "$MIGRATION_COMMAND"
  else
    echo "No AI API database migration command configured."
  fi
else
  echo "Skipping AI API database migrations."
fi

exec "$@"

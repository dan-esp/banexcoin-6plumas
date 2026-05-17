#!/bin/sh
set -e

# AI service has no database — nothing to migrate.
exec "$@"

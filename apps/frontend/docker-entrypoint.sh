#!/bin/sh
set -e

# Frontend does not own migrations — public API does.
exec "$@"

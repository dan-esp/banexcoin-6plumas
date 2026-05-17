#!/bin/sh
set -e

# Private API does not own migrations — public API does.
exec "$@"

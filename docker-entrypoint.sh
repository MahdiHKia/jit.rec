#!/bin/bash
# vim:sw=4:ts=4:et

exec 3>&1

/docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
/docker-entrypoint.d/20-envsubst-on-templates.sh
/docker-entrypoint.d/30-tune-worker-processes.sh
/docker-entrypoint.d/generate_env_config.sh -t /docker-entrypoint.d/env_config_template.js -e /app/frontend/env.js

exec 3>&-
exec "$@"
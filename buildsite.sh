#!/usr/bin/env bash

set -euo pipefail

WITH_KROKI=danyill/antora-kroki:latest
NODE_IMAGE=node:20-alpine
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

docker run --rm \
  --user "$(id -u):$(id -g)" \
  --volume "$SCRIPT_DIR:/antora" \
  --workdir /antora \
  "$WITH_KROKI" \
  --cache-dir=./.cache/antora antora-playbook.yml

# build pagefind index over rendered output
npx pagefind --site "$SCRIPT_DIR/build/site"

# generate llms.txt / llms-full.txt / per-page markdown mirrors from the built site
docker run --rm \
  --user "$(id -u):$(id -g)" \
  -e HOME=/tmp \
  --volume "$SCRIPT_DIR:/antora" \
  --workdir /antora \
  "$NODE_IMAGE" \
  sh -c "npm install --no-audit --no-fund && npm run llm-export"

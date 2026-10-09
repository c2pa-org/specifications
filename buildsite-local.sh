#!/usr/bin/env bash

set -euo pipefail

WITH_KROKI=danyill/antora-kroki:latest
NODE_IMAGE=node:20-alpine
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(basename "$SCRIPT_DIR")"

docker run --rm \
  --user "$(id -u):$(id -g)" \
  --volume "$WORKSPACE_DIR:/workspace" \
  --workdir "/workspace/$PROJECT_DIR" \
  "$WITH_KROKI" \
  --cache-dir=./.cache/antora antora-playbook-local.yml

# generate llms.txt / llms-full.txt / per-page markdown mirrors from the built site
docker run --rm \
  --user "$(id -u):$(id -g)" \
  -e HOME=/tmp \
  --volume "$WORKSPACE_DIR:/workspace" \
  --workdir "/workspace/$PROJECT_DIR" \
  "$NODE_IMAGE" \
  sh -c "npm install --no-audit --no-fund && npm run llm-export"

#!/usr/bin/env bash

set -euo pipefail

WITH_KROKI=danyill/antora-kroki:latest
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(basename "$SCRIPT_DIR")"

docker run --rm \
  --user "$(id -u):$(id -g)" \
  --volume "$WORKSPACE_DIR:/workspace" \
  --workdir "/workspace/$PROJECT_DIR" \
  "$WITH_KROKI" \
  --cache-dir=./.cache/antora antora-playbook-local.yml

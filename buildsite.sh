#!/usr/bin/env bash

set -euo pipefail

WITH_KROKI=danyill/antora-kroki:latest
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

docker run --rm \
  --user "$(id -u):$(id -g)" \
  --volume "$SCRIPT_DIR:/antora" \
  --workdir /antora \
  "$WITH_KROKI" \
  --cache-dir=./.cache/antora antora-playbook.yml

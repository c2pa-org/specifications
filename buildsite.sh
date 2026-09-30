#!/bin/bash

# add x for debugging
set -eu

# possible images to use
ANTORA=antora/antora
WITH_KROKI=danyill/antora-kroki:latest
NODE_IMAGE=node:20-alpine

# run antora on the current playbook
docker run -u $(id -u) -v $PWD:/antora:Z \
			--rm -t "${WITH_KROKI}" \
			--cache-dir=./.cache/antora antora-playbook.yml

# generate llms.txt / llms-full.txt / per-page markdown mirrors from the
# built site (post-build step; see docs/superpowers/plans/2026-08-16-llm-friendly-spec-export.md)
#
# -e HOME=/tmp: node:20-alpine's /etc/passwd has no entry for an arbitrary
# host UID passed via -u $(id -u), so HOME resolves to / and npm tries to
# write its cache to the root-owned /.npm, failing with EACCES on a genuine
# fresh checkout (confirmed: reproduces reliably with no host node_modules
# present; only "works" without this flag by accident when node_modules
# already happens to exist on the host from a prior run).
docker run -u $(id -u) -e HOME=/tmp -v $PWD:/antora:Z -w /antora \
			--rm -t "${NODE_IMAGE}" \
			sh -c "npm install --no-audit --no-fund && npm run llm-export"

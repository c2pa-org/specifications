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
			--cache-dir=./.cache/antora antora-playbook-local.yml

# generate llms.txt / llms-full.txt / per-page markdown mirrors from the
# built site (post-build step; see docs/superpowers/plans/2026-08-16-llm-friendly-spec-export.md)
docker run -u $(id -u) -v $PWD:/antora -w /antora \
			--rm -t "${NODE_IMAGE}" \
			sh -c "npm install --no-audit --no-fund && npm run llm-export"

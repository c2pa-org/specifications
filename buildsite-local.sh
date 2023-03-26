#!/bin/bash

# add x for debugging
set -eu

# possible images to use
ANTORA=antora/antora
WITH_KROKI=danyill/antora-kroki:latest

# run antora on the current playbook
docker run -u $(id -u) -v $PWD:/antora:Z --rm -t "${WITH_KROKI}" --cache-dir=./.cache/antora antora-playbook-local.yml

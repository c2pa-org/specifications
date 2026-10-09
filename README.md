# C2PA Specifications

This repository assembles the C2PA specifications and guidance into the public documentation site. Source documents are maintained across C2PA repositories; this repository contains the Antora playbooks, site entry page and navigation, supplemental UI files, and generated site output.

The published site is available at <https://spec.c2pa.org/specifications/>. For site structure, local previews, cross-references, and publishing details, see the [Antora guide](UsingAntora.adoc).

To build from the GitHub repositories, run `./buildsite.sh` from this repository root. To preview the site with local sibling checkouts, run `./buildsite-local.sh`. Both scripts use Docker and write the generated site to `build/site/`.

The GitHub Pages workflow deploys the existing `build/site/` output when changes reach `main`; it does not currently run Antora. Regenerate and review the site output when documentation changes need to appear on the published site.

Learn more about C2PA at <https://c2pa.org/>.

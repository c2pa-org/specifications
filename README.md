# C2PA Specifications

This repository assembles the C2PA specifications and guidance into the public documentation site. Source documents are maintained across C2PA repositories; this repository contains the Antora playbooks, site entry page and navigation, supplemental UI files, and generated site output.

The published site is available at <https://spec.c2pa.org/specifications/>. For site structure, local previews, cross-references, and publishing details, see the [Antora guide](UsingAntora.adoc).

To build from the GitHub repositories, run `./buildsite.sh` from this repository root. To preview the site with local sibling checkouts, run `./buildsite-local.sh`. Both scripts use Docker and write the generated site to `build/site/`.

The GitHub Pages workflow deploys the existing `build/site/` output when changes reach `main`; it does not currently run Antora. Regenerate and review the site output when documentation changes need to appear on the published site.

## LLM exports

The site build also generates Markdown mirrors and LLM discovery files. To regenerate them from existing HTML, run `npm install` followed by `npm run llm-export`, or run `./buildLLMs.sh` using Docker. Run `npm run test:llm-export` for the export tests.

Each version's `llms.txt` links only to the main core specification (`specs/C2PA_Specification.html.md`), and `llms-full.txt` contains only that specification. The site-root copies select the latest version. ISO renditions, companion documents and other pages are not bundled, although their individual Markdown mirrors remain available.

The core Markdown omits the reading guide, role-based reading lists and version history. CDDL listings link to that version's existing `specs/_attachments/C2PA_Schemas.zip`; older versions without an archive use their original HTML sections and emit a build warning. CBOR diagnostic examples link to their original HTML sections: the currently built 2.5 schema archive does not contain `.cbordiag` files. Other code, including hashing pseudocode and JSON Schema, remains inline. Images become ordinary links rather than embedded images. HTML documents and ZIP archives are unchanged.

Learn more about C2PA at <https://c2pa.org/>.

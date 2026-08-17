// scripts/llm-export/generate.js
const fs = require('node:fs');
const path = require('node:path');
const { writeMirrors } = require('./lib/write-mirrors');
const { parseNav } = require('./lib/parse-nav');
const { buildLlmsTxt } = require('./lib/build-llms-txt');
const { buildLlmsFullTxt } = require('./lib/build-llms-full-txt');
const { checkLinks } = require('./lib/check-links');
const { checkWordCountDrift } = require('./lib/word-count-check');

const SITE_TITLE = 'C2PA Technical Specification';
const SITE_SUMMARY =
  'C2PA (Coalition for Content Provenance and Authenticity) defines an end-to-end, open technical ' +
  'standard for certifying the provenance and history of digital media content.';

function stripTags(html) {
  return html.replace(/<[^>]*>/g, ' ');
}

function versionRootsIn(siteRoot) {
  // e.g. build/site/specifications/2.4 — single `specifications` segment on
  // disk; the doubled segment in the published URL
  // (https://spec.c2pa.org/specifications/specifications/2.4/...) comes from
  // antora-playbook.yml's own site.url already ending in /specifications,
  // not from an extra directory level under build/site/.
  const base = path.join(siteRoot, 'specifications');
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(base, e.name));
}

function latestVersion(versionDirs) {
  return versionDirs
    .map((dir) => path.basename(dir))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .pop();
}

function run(siteRoot) {
  const results = writeMirrors(siteRoot);
  const resultsBySourcePath = new Map(results.map((r) => [r.sourcePath, r]));

  const versionDirs = versionRootsIn(siteRoot);
  const latest = latestVersion(versionDirs);

  for (const versionDir of versionDirs) {
    const indexPath = path.join(versionDir, 'index.html');
    if (!fs.existsSync(indexPath)) continue;
    const nav = parseNav(fs.readFileSync(indexPath, 'utf8'));

    const pagesByHref = {};
    for (const category of nav.categories) {
      for (const page of category.pages) {
        const resolvedSource = path.resolve(versionDir, page.href);
        const result = resultsBySourcePath.get(resolvedSource);
        if (result) pagesByHref[page.href] = result;
      }
    }
    // include orphans (pages under this version dir not reachable from nav)
    for (const result of results) {
      if (!result.sourcePath.startsWith(versionDir + path.sep)) continue;
      const href = path.relative(versionDir, result.sourcePath);
      if (!Object.values(pagesByHref).some((p) => p === result)) {
        pagesByHref[href] = result;
      }
    }

    const descriptionsByHref = {};
    for (const [href, result] of Object.entries(pagesByHref)) {
      if (result.description) descriptionsByHref[href] = result.description;
    }

    const llmsTxt = buildLlmsTxt({ siteTitle: SITE_TITLE, summary: SITE_SUMMARY, nav, descriptionsByHref });
    fs.writeFileSync(path.join(versionDir, 'llms.txt'), llmsTxt);

    const llmsFullTxt = buildLlmsFullTxt({ pageOrder: nav.pageOrder, pagesByHref });
    fs.writeFileSync(path.join(versionDir, 'llms-full.txt'), llmsFullTxt);

    if (path.basename(versionDir) === latest) {
      fs.writeFileSync(path.join(siteRoot, 'llms.txt'), llmsTxt);
      fs.writeFileSync(path.join(siteRoot, 'llms-full.txt'), llmsFullTxt);
    }
  }

  const mirrorPaths = results.map((r) => r.mirrorPath);
  const linkResult = checkLinks(mirrorPaths);
  if (linkResult.broken.length > 0) {
    // Deliberately does NOT set a non-zero exit code for broken links.
    // Verified against this repo's real build/site: 5 of these are current,
    // pre-existing content defects in specs-core (an unresolved AsciiDoc
    // xref and a malformed hand-typed markdown-style link, both already
    // broken in the live rendered HTML, not introduced by this conversion
    // pipeline) — see Task 13's dry-run notes. Since generate.js runs as a
    // step in buildsite.sh under `set -eu` (Task 14), a non-zero exit here
    // would fail the *entire* Antora build on every run until someone fixes
    // that unrelated content in a different repo, on a timeline this tool
    // has no control over. Word-count drift below is a much rarer, more
    // actionable signal of an actual regression in this pipeline, so it
    // still fails the build; broken links are surfaced loudly in the build
    // log instead, for a human to act on separately.
    console.error(`llm-export: ${linkResult.broken.length} broken internal link(s) found:`);
    for (const b of linkResult.broken) console.error(`  ${b.file} -> ${b.target}`);
  }

  const driftInput = results.map((r) => ({
    sourceText: stripTags(fs.readFileSync(r.sourcePath, 'utf8')),
    markdown: r.markdown,
  }));
  const drift = checkWordCountDrift(driftInput, 0.5);
  console.log(
    `llm-export: converted ${results.length} pages, word-count ratio ${drift.ratio.toFixed(2)} ` +
      `(${drift.mdWords}/${drift.htmlWords})${drift.ok ? '' : ' — BELOW THRESHOLD, investigate'}`
  );

  if (!drift.ok) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  const siteRoot = process.argv[2];
  if (!siteRoot) {
    console.error('Usage: node scripts/llm-export/generate.js <site-root>');
    process.exit(2);
  }
  run(path.resolve(siteRoot));
}

module.exports = { run };

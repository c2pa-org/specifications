// scripts/llm-export/test/generate.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { run } = require('../generate');

// Minimal ungrouped nav (mirrors the "Pages" fallback shape exercised in
// parse-nav.test.js) listing the version-root page and the subdirectory
// page, in that order.
const INDEX_PAGE_HTML = `
<!DOCTYPE html>
<html><body>
<nav class="nav-menu">
  <ul class="nav-list"><li class="nav-item" data-depth="0">
    <ul class="nav-list">
      <li class="nav-item" data-depth="1"><a class="nav-link" href="index.html">Home</a></li>
      <li class="nav-item" data-depth="1"><a class="nav-link" href="sub/page.html">Sub Page</a></li>
    </ul>
  </li></ul>
</nav>
<article class="doc">
<h1 class="page">Home</h1>
<div class="paragraph"><p>Welcome to the home page.</p></div>
</article>
</body></html>`;

// Lives in a subdirectory of the version root and links back up to the
// index page — this is the exact shape that broke before the Task 12b fix:
// the converted markdown carries a link relative to sub/ (e.g.
// "../index.html.md"), which is only correct as long as this page's
// markdown stays in sub/. Both llms-full.txt (flattened to the version
// root) and the site-root copy (moved up further still) must relocate it.
const SUB_PAGE_HTML = `
<!DOCTYPE html>
<html><body>
<article class="doc">
<h1 class="page">Sub Page</h1>
<div class="paragraph"><p>See the <a href="../index.html">home page</a> for details.</p></div>
</article>
</body></html>`;

function buildSite() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-export-generate-'));
  const versionDir = path.join(root, 'specifications/1.0');
  const subDir = path.join(versionDir, 'sub');
  fs.mkdirSync(subDir, { recursive: true });
  fs.writeFileSync(path.join(versionDir, 'index.html'), INDEX_PAGE_HTML);
  fs.writeFileSync(path.join(subDir, 'page.html'), SUB_PAGE_HTML);
  return { root, versionDir };
}

// Extracts the target of the first markdown link whose text matches `text`.
function linkTarget(markdown, text) {
  const match = markdown.match(new RegExp(`\\[${text}\\]\\(([^)]+)\\)`));
  assert.ok(match, `expected to find a "${text}" link in:\n${markdown}`);
  return match[1];
}

function resolves(fromFile, target) {
  const [withoutFragment] = target.split('#');
  return fs.existsSync(path.resolve(path.dirname(fromFile), withoutFragment));
}

test('run() relocates a subdirectory page\'s links when flattened into the version-root llms-full.txt', () => {
  const { root, versionDir } = buildSite();

  run(root);

  const llmsFullPath = path.join(versionDir, 'llms-full.txt');
  assert.ok(fs.existsSync(llmsFullPath));
  const llmsFull = fs.readFileSync(llmsFullPath, 'utf8');

  const target = linkTarget(llmsFull, 'home page');
  // Before the fix this would still read "../index.html.md" — correct
  // relative to sub/, but wrong once flattened into the version root.
  assert.equal(target, 'index.html.md');
  assert.ok(resolves(llmsFullPath, target), `link "${target}" should resolve from ${llmsFullPath}`);
});

test('run() relocates links again when copying llms-full.txt from the version root up to the site root', () => {
  const { root, versionDir } = buildSite();

  run(root);

  const siteRootLlmsFullPath = path.join(root, 'llms-full.txt');
  assert.ok(fs.existsSync(siteRootLlmsFullPath));
  const siteRootLlmsFull = fs.readFileSync(siteRootLlmsFullPath, 'utf8');

  const target = linkTarget(siteRootLlmsFull, 'home page');
  // Relative to versionDir this link is "index.html.md"; relative to the
  // site root (two levels up: specifications/1.0/) it must become
  // "specifications/1.0/index.html.md".
  assert.equal(target, 'specifications/1.0/index.html.md');
  assert.ok(
    resolves(siteRootLlmsFullPath, target),
    `link "${target}" should resolve from ${siteRootLlmsFullPath}`
  );

  // Sanity: it should indeed point at the same file the version-root
  // llms-full.txt's (already-relocated) link resolves to.
  assert.equal(
    path.resolve(path.dirname(siteRootLlmsFullPath), target),
    path.join(versionDir, 'index.html.md')
  );
});

test('run() also relocates the site-root copy of llms.txt', () => {
  const { root } = buildSite();

  run(root);

  const siteRootLlmsPath = path.join(root, 'llms.txt');
  assert.ok(fs.existsSync(siteRootLlmsPath));
  const siteRootLlms = fs.readFileSync(siteRootLlmsPath, 'utf8');

  const target = linkTarget(siteRootLlms, 'Home');
  assert.equal(target, 'specifications/1.0/index.html.md');
  assert.ok(resolves(siteRootLlmsPath, target), `link "${target}" should resolve from ${siteRootLlmsPath}`);
});

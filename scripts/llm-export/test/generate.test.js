// scripts/llm-export/test/generate.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { run } = require('../generate');

// The navigation deliberately lists pages other than the core spec;
// LLM discovery must select the core independently of this navigation.
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

// Lives in specs/ beneath the version root and links back up to the
// index page — this is the exact shape that broke before the Task 12b fix:
// the converted markdown carries a link relative to specs/ (e.g.
// "../index.html.md"), which is only correct as long as this page's
// markdown stays in specs/. Both llms-full.txt (flattened to the version
// root) and the site-root copy (moved up further still) must relocate it.
const SUB_PAGE_HTML = `
<!DOCTYPE html>
<html><body>
<article class="doc">
<h1 class="page">Sub Page</h1>
<div class="paragraph"><p>See the <a href="../index.html">home page</a> for details.</p></div>
</article>
</body></html>`;

function buildSite(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-export-generate-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const versionDir = path.join(root, 'specifications/1.0');
  const subDir = path.join(versionDir, 'specs');
  fs.mkdirSync(subDir, { recursive: true });
  fs.writeFileSync(path.join(versionDir, 'index.html'), INDEX_PAGE_HTML);
  fs.writeFileSync(path.join(subDir, 'C2PA_Specification.html'), SUB_PAGE_HTML);
  fs.writeFileSync(path.join(subDir, 'ContentCredentials.html'), '<article class="doc"><h1 class="page">ISO rendition</h1><p>ISO-only content.</p></article>');
  fs.mkdirSync(path.join(versionDir, 'guidance'));
  fs.writeFileSync(path.join(versionDir, 'guidance/Guidance.html'), '<article class="doc"><h1 class="page">Guidance</h1><p>Companion-only content.</p></article>');
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

test('run() relocates a subdirectory page\'s links when flattened into the version-root llms-full.txt', (t) => {
  const { root, versionDir } = buildSite(t);

  run(root);

  const llmsFullPath = path.join(versionDir, 'llms-full.txt');
  assert.ok(fs.existsSync(llmsFullPath));
  const llmsFull = fs.readFileSync(llmsFullPath, 'utf8');

  const target = linkTarget(llmsFull, 'home page');
  // Before the fix this would still read "../index.html.md" — correct
  // relative to specs/, but wrong once flattened into the version root.
  assert.equal(target, 'index.html.md');
  assert.ok(resolves(llmsFullPath, target), `link "${target}" should resolve from ${llmsFullPath}`);
});

test('run() relocates links again when copying llms-full.txt from the version root up to the site root', (t) => {
  const { root, versionDir } = buildSite(t);

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

test('run() also relocates the site-root copy of llms.txt', (t) => {
  const { root } = buildSite(t);

  run(root);

  const siteRootLlmsPath = path.join(root, 'llms.txt');
  assert.ok(fs.existsSync(siteRootLlmsPath));
  const siteRootLlms = fs.readFileSync(siteRootLlmsPath, 'utf8');

  const target = linkTarget(siteRootLlms, 'Content Credentials');
  assert.equal(target, 'specifications/1.0/specs/C2PA_Specification.html.md');
  assert.ok(resolves(siteRootLlmsPath, target), `link "${target}" should resolve from ${siteRootLlmsPath}`);
});

test('run() includes only the main core spec in both LLM files, retaining other mirrors', (t) => {
  const { root, versionDir } = buildSite(t);
  run(root);
  for (const dir of [root, versionDir]) {
    const index = fs.readFileSync(path.join(dir, 'llms.txt'), 'utf8');
    const full = fs.readFileSync(path.join(dir, 'llms-full.txt'), 'utf8');
    assert.ok(index.includes('C2PA_Specification.html.md'));
    assert.equal((index.match(/^- \[/gm) || []).length, 1);
    assert.ok(!index.includes('ContentCredentials.html.md'));
    assert.ok(!full.includes('ISO-only content.'));
    assert.ok(!full.includes('Companion-only content.'));
    assert.ok(!full.includes('Welcome to the home page.'));
    assert.ok(full.includes('home page'));
  }
  assert.ok(fs.existsSync(path.join(versionDir, 'specs/ContentCredentials.html.md')));
  assert.ok(fs.existsSync(path.join(versionDir, 'guidance/Guidance.html.md')));
});

test('run() chooses the latest core spec for root files, without blending versions', (t) => {
  const { root, versionDir } = buildSite(t);
  const later = path.join(root, 'specifications/2.0/specs');
  fs.mkdirSync(later, { recursive: true });
  fs.writeFileSync(path.join(later, 'C2PA_Specification.html'), '<article class="doc"><h1 class="page">New core</h1><p>Latest core content.</p></article>');
  run(root);
  assert.ok(fs.readFileSync(path.join(root, 'llms-full.txt'), 'utf8').includes('Latest core content.'));
  assert.ok(!fs.readFileSync(path.join(versionDir, 'llms-full.txt'), 'utf8').includes('Latest core content.'));
  assert.ok(fs.readFileSync(path.join(root, 'llms.txt'), 'utf8').includes('specifications/2.0/specs/'));
});

test('run() refuses to silently substitute an ISO rendition when the main core spec is missing', (t) => {
  const { root, versionDir } = buildSite(t);
  fs.unlinkSync(path.join(versionDir, 'specs/C2PA_Specification.html'));
  assert.throws(() => run(root), /main core specification/i);
});

test('run() compacts the core mirror and relocates archive, image, and original HTML links', (t) => {
  const { root, versionDir } = buildSite(t);
  const specsDir = path.join(versionDir, 'specs');
  fs.mkdirSync(path.join(specsDir, '_attachments'));
  fs.writeFileSync(path.join(specsDir, '_attachments/C2PA_Schemas.zip'), 'archive fixture');
  fs.mkdirSync(path.join(specsDir, '_images'));
  fs.writeFileSync(path.join(specsDir, '_images/diagram.svg'), '<svg/>');
  fs.writeFileSync(path.join(specsDir, 'C2PA_Specification.html'), `<article class="doc">
    <h1 class="page">Core</h1>
    <div class="sect1"><h2 id="claims">Claims</h2>
    <p>Required prose stays.</p>
    <pre class="highlightjs highlight"><code data-lang="cddl">claim-map = { "id": tstr }</code></pre>
    <pre><code>{ "hash": h'00' }</code></pre>
    <img src="_images/diagram.svg" alt="Diagram">
    <p>See <a href="#version_history">history</a>.</p></div>
    <div class="sect1"><h2 id="version_history">Version History</h2><p>Old changes.</p></div>
    </article>`);
  run(root);

  const mirror = fs.readFileSync(path.join(specsDir, 'C2PA_Specification.html.md'), 'utf8');
  const full = fs.readFileSync(path.join(root, 'llms-full.txt'), 'utf8');
  assert.ok(!mirror.includes('claim-map ='));
  assert.ok(!mirror.includes("h'00'"));
  assert.ok(!mirror.includes('Version History'));
  assert.ok(!mirror.includes('!['));
  assert.ok(mirror.includes('Required prose stays.'));
  assert.ok(mirror.includes('[history](C2PA_Specification.html#version_history)'));
  for (const [label, expected] of [
    ['CDDL schema archive', 'specifications/1.0/specs/_attachments/C2PA_Schemas.zip'],
    ['CBOR diagnostic example', 'specifications/1.0/specs/C2PA_Specification.html#claims'],
    ['Diagram', 'specifications/1.0/specs/_images/diagram.svg'],
    ['history', 'specifications/1.0/specs/C2PA_Specification.html#version_history'],
  ]) {
    const target = linkTarget(full, label);
    assert.equal(target, expected);
    assert.ok(resolves(path.join(root, 'llms-full.txt'), target));
  }
});

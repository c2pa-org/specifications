# LLM-Friendly Spec Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a post-build pipeline to this repo (`c2pa-org/specifications`, the Antora playbook repo) that walks the built site under `build/site/`, converts every real content page's rendered HTML into a clean markdown mirror (`Page.html` → `Page.html.md`), and assembles `llms.txt` / `llms-full.txt` index files per the [llms.txt design spec](/Users/lrosenth/C2PA/specs-core/.claude/worktrees/cpp17-compatibility-comparison-c6119b/docs/superpowers/specs/2026-08-16-llm-friendly-spec-export-design.md).

**Architecture:** A standalone Node.js tool under `scripts/llm-export/` with no dependency on Antora internals — it only reads Antora's finished HTML output. It's invoked as a new step in `buildsite.sh`/`buildsite-local.sh`, running in its own throwaway Docker container (`node:20-alpine`) right after the existing Antora container finishes, so no new host prerequisite is introduced. The tool: (1) discovers real content pages by the presence of `<article class="doc">` (this cleanly excludes the 7 redirect/UI stub pages already in the build — verified against the current `build/site/`, where exactly the 7 non-content files lack that node); (2) converts each page's article subtree to markdown via `turndown` + `turndown-plugin-gfm` with custom rules for admonitions, heading-anchor preservation, image alt-text fallback, and internal link rewriting; (3) parses the rendered nav sidebar (already present in every page — Antora put it there after resolving all cross-component xrefs) to get page order, titles, and category groupings, and uses that single source of truth to build `llms.txt` and `llms-full.txt`; (4) runs a link-integrity check and a word-count drift check over its own output.

**Tech Stack:** Node.js (`node:test` built-in test runner, no new test framework), `turndown` 7.x, `turndown-plugin-gfm` 1.x, `@mixmark-io/domino` (transitive, gives turndown a DOM without needing `jsdom`).

---

## Design notes — decisions made while turning the spec into an implementation

The design doc ([2026-08-16-llm-friendly-spec-export-design.md](/Users/lrosenth/C2PA/specs-core/.claude/worktrees/cpp17-compatibility-comparison-c6119b/docs/superpowers/specs/2026-08-16-llm-friendly-spec-export-design.md)) is a cross-repo handoff spec written before anyone had looked at this repo's actual build output. Three places needed a concrete call that the spec left open or got slightly wrong for this specific site:

1. **Mirror suffix scheme (spec's open question 1).** This site publishes with `.html` extensions (confirmed: `build/site/specifications/2.4/specs/C2PA_Specification.html`), not clean URLs. So the mirror is `Page.html` → `Page.html.md`, exactly the example the design doc already used.

2. **`llms.txt` H2 grouping.** The design doc says "H2 sections, one per Antora component (specs-core, conformance, etc.)". That doesn't match this site: `docs/modules/nav.adoc` in this repo defines **one unified nav tree** for the whole site, grouped by category labels ("Technical Specifications", "Informative Documents", "Recommendations") that mix pages from many different component repos (crJSON, attestations, softbinding, explainer, guidance, security, ai-ml, identity all appear under those three categories, not under their own repo names). Grouping by raw component name would put two security docs under a component called "security" and hide the "Technical Specifications" grouping a reader actually cares about. **Decision: group `llms.txt` H2 sections by the rendered nav's top-level category labels, not by Antora component name.** This is truer to the one already-resolved source of truth (the rendered nav) and more useful to a reader. If a version's nav has no category grouping (a flat list), all pages fall under a single `## Pages` section — this keeps the generator correct for older versions without hardcoding today's three category names.

3. **`llms-full.txt` per-version scope (spec's open question 2).** Decision: generate `llms.txt` and `llms-full.txt` at every version root (on disk, `build/site/specifications/<version>/`; the design doc's `/specifications/specifications/2.4/` example is the *published URL*, doubled because the site's own base `url:` in `antora-playbook.yml` already ends in `/specifications` — the filesystem path under `build/site/` has only one `specifications` segment, confirmed against this repo's actual build output), plus copy the *latest* version's copy of both files to the site root (`build/site/llms.txt`, `build/site/llms-full.txt`), mirroring the existing `latest/index.html` redirect-to-latest pattern already in `antora-playbook.yml`. Treating both artifacts the same way keeps the rule simple and answers the spec's open question for `llms-full.txt` consistently with what it already specifies for `llms.txt`.

**Where the pipeline runs:** `buildsite.sh` currently only does `docker run ... antora-playbook.yml` — there's no host-side `npm install` step anywhere in this repo today (package.json's deps are only ever consumed by a currently-commented-out CI path). Rather than make Node a new *host* prerequisite, the plan adds a second, throwaway `node:20-alpine` container run, bind-mounting the same `$PWD`, right after the existing Antora container run. This matches the repo's existing all-Docker workflow and needs no changes to the Antora/kroki image.

---

## File structure

```
scripts/llm-export/
  generate.js                 # CLI entrypoint: node scripts/llm-export/generate.js <site-root>
  lib/
    discover-pages.js         # find content pages under a site root
    parse-nav.js               # extract {order, titles, categories} from one page's rendered nav
    extract-article.js         # pull <article class="doc"> subtree + h1 title out of a page's HTML
    markdown-converter.js      # configured TurndownService + all custom rules
    write-mirrors.js           # discover -> extract -> convert -> write *.html.md
    build-llms-txt.js          # assemble llms.txt content for one version root
    build-llms-full-txt.js     # assemble llms-full.txt content for one version root
    check-links.js             # validate internal links in generated markdown resolve to real files
    word-count-check.js        # drift check: md word count vs html text word count
  test/
    fixtures/
      content-page.html        # trimmed real page fixture (has article.doc + nav)
      redirect-stub.html        # trimmed real redirect-stub fixture (no article.doc)
    discover-pages.test.js
    parse-nav.test.js
    extract-article.test.js
    markdown-converter.test.js
    build-llms-txt.test.js
    build-llms-full-txt.test.js
    check-links.test.js
    word-count-check.test.js
```

Each `lib/*.js` file does one job and is unit-tested in isolation; `generate.js` wires them together and is covered by the end-to-end task at the end of this plan rather than its own unit test (it's pure orchestration).

---

## Task 1: Scaffolding — dependencies and npm scripts

**Files:**
- Modify: `package.json`
- Create: `scripts/llm-export/` (empty dir, populated by later tasks)

- [ ] **Step 1: Add the new dependencies**

```bash
npm install --save turndown@^7.2.4 turndown-plugin-gfm@^1.0.2
```

- [ ] **Step 2: Add npm scripts**

Edit `package.json` to add a `"scripts"` block:

```json
{
  "devDependencies": {
    "antora": "3.1.14"
  },
  "dependencies": {
    "@antora/lunr-extension": "1.0.0-alpha.13",
    "asciidoctor": "^3.0.4",
    "asciidoctor-kroki": "^0.18.1",
    "turndown": "^7.2.4",
    "turndown-plugin-gfm": "^1.0.2"
  },
  "scripts": {
    "llm-export": "node scripts/llm-export/generate.js build/site",
    "test:llm-export": "node --test 'scripts/llm-export/test/*.test.js'"
  }
}
```

Use the quoted glob, not a bare directory path (`node --test scripts/llm-export/test/`) — verified directly: a bare directory throws `Cannot find module` and reports a failing "test" on Node 22/23/24, while the quoted glob works correctly whether or not any `*.test.js` files exist yet (Node's test runner resolves the glob itself; the quotes just stop the shell from expanding or dropping it first).

- [ ] **Step 3: Verify npm scripts are wired (no real work yet)**

Run: `npm run test:llm-export`
Expected: `node --test` reports "0 tests" (no test files exist yet) but exits 0 — confirms the script and test runner invocation itself work before any code exists.

- [ ] **Step 4: Commit**

This repo's `.gitignore` already excludes `package-lock.json`, so `git add package-lock.json` is a no-op (`git status` will show only `package.json` staged) — that's expected, not a mistake.

```bash
git add package.json
git commit -m "chore: add turndown deps and llm-export npm scripts"
```

---

## Task 2: Page discovery

**Files:**
- Create: `scripts/llm-export/lib/discover-pages.js`
- Test: `scripts/llm-export/test/discover-pages.test.js`
- Create fixtures: `scripts/llm-export/test/fixtures/content-page.html`, `scripts/llm-export/test/fixtures/redirect-stub.html`

First, create the two fixtures used by this and later tasks. Take real trimmed excerpts so tests reflect actual Antora output shape.

- [ ] **Step 1: Create the redirect-stub fixture**

```html
<!-- scripts/llm-export/test/fixtures/redirect-stub.html -->
<!DOCTYPE html>
<meta charset="utf-8">
<link rel="canonical" href="https://spec.c2pa.org/specifications/specifications/2.4/index.html">
<script>location="specifications/2.4/index.html"</script>
<meta http-equiv="refresh" content="0; url=specifications/2.4/index.html">
<meta name="robots" content="noindex">
<title>Redirect Notice</title>
<h1>Redirect Notice</h1>
<p>The page you requested has been relocated to <a href="specifications/2.4/index.html">https://spec.c2pa.org/specifications/specifications/2.4/index.html</a>.</p>
```

- [ ] **Step 2: Create the content-page fixture**

This is a trimmed-down but structurally faithful copy of a real page (based on `build/site/specifications/2.4/specs/C2PA_Specification.html`), small enough to reason about but exercising every conversion rule this plan implements: a heading with a pre-existing `id` and decorative permalink anchor, a `NOTE` and an `IMPORTANT` admonition, a table with `<p class="tableblock">`-wrapped cells, a fenced code block with a language hint, an image with alt text and one without, and internal links (same-page anchor, relative cross-page, relative cross-version, and an external non-c2pa `.html` link that must NOT be rewritten). It also carries the full rendered nav sidebar so later nav-parsing tests can reuse it.

```html
<!-- scripts/llm-export/test/fixtures/content-page.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Content Credentials : C2PA Technical Specification :: C2PA Specifications</title>
  </head>
  <body class="article">
<header class="header"><nav class="navbar">navbar chrome, must not appear in output</nav></header>
<div class="body">
<div class="nav-container" data-component="specifications" data-version="2.4">
  <aside class="nav">
    <div class="panels">
<div class="nav-panel-menu is-active" data-panel="menu">
  <nav class="nav-menu">
    <h3 class="title"><a href="../index.html">C2PA Specifications</a></h3>
<ul class="nav-list">
  <li class="nav-item" data-depth="0">
<ul class="nav-list">
  <li class="nav-item" data-depth="1">
    <span class="nav-text">Technical Specifications</span>
<ul class="nav-list">
  <li class="nav-item is-current-page" data-depth="2">
    <a class="nav-link" href="C2PA_Specification.html">Content Credentials</a>
  </li>
  <li class="nav-item" data-depth="2">
    <a class="nav-link" href="../crJSON/crjson-format.html">Content Credentials JSON (crJSON)</a>
  </li>
</ul>
  </li>
  <li class="nav-item" data-depth="1">
    <span class="nav-text">Informative Documents</span>
<ul class="nav-list">
  <li class="nav-item" data-depth="2">
    <a class="nav-link" href="../security/Security_Considerations.html">C2PA Security Considerations</a>
  </li>
</ul>
  </li>
</ul>
  </li>
</ul>
  </nav>
</div>
    </div>
  </aside>
</div>
<main class="article">
<div class="toolbar" role="navigation">toolbar chrome, must not appear in output</div>
<nav class="breadcrumbs" aria-label="breadcrumbs">breadcrumb chrome, must not appear in output</nav>
  <div class="content">
<article class="doc">
<h1 class="page">Content Credentials : C2PA Technical Specification</h1>
<div id="toc" class="toc">
<div id="toctitle">Table of Contents</div>
<ul class="sectlevel1"><li><a href="#_introduction">1. Introduction</a></li></ul>
</div>
<div class="paragraph">
<p>C2PA defines a way to establish provenance for digital content.</p>
</div>
<div class="sect2">
<h3 id="claim-generator-definition"><a class="anchor" href="#claim-generator-definition"></a>2.1.2. Claim generator</h3>
<div class="paragraph">
<p>See the <a href="#_introduction">introduction</a> and <a href="../softbinding/Decoupled.html#SBR-API">Soft Binding API</a> and <a href="../../1.4/attestations/attestation.html">Attestations</a> and <a href="https://www.w3.org/TR/SVG11/metadata.html#MetadataElement">SVG metadata spec</a>.</p>
</div>
<div class="admonitionblock note">
<table><tr><td class="icon"><i class="fa icon-note" title="Note"></i></td>
<td class="content">An organization may also be considered an <a href="#_actor">actor</a>.</td></tr></table>
</div>
<div class="admonitionblock important">
<table><tr><td class="icon"><i class="fa icon-important" title="Important"></i></td>
<td class="content"><div class="paragraph"><p>From the guiding principles.</p></div></td></tr></table>
</div>
<table id="design-goals" class="tableblock frame-all grid-all stretch">
<thead><tr><th class="tableblock halign-left valign-top">Goal</th><th class="tableblock halign-left valign-top">Description</th></tr></thead>
<tbody><tr><td class="tableblock halign-left valign-top"><p class="tableblock">Privacy</p></td><td class="tableblock halign-left valign-top"><p class="tableblock">Some description</p></td></tr></tbody>
</table>
<div class="listingblock"><pre class="highlightjs highlight"><code class="language-abnf hljs" data-lang="abnf">qualified-namespace = "c2pa" / entity</code></pre></div>
<img src="_images/Overview_Diagram.svg" alt="A diagram of how all the parts of C2PA go together" width="697" height="454">
<img src="_images/mystery.svg">
</div>
</article>
</div>
</main>
</div>
<footer class="footer">footer chrome, must not appear in output</footer>
  </body>
</html>
```

- [ ] **Step 3: Write the failing test**

```javascript
// scripts/llm-export/test/discover-pages.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { discoverPages } = require('../lib/discover-pages');

function makeFakeSite() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-export-site-'));
  const contentHtml = fs.readFileSync(path.join(__dirname, 'fixtures/content-page.html'), 'utf8');
  const redirectHtml = fs.readFileSync(path.join(__dirname, 'fixtures/redirect-stub.html'), 'utf8');

  fs.mkdirSync(path.join(root, 'specifications/2.4/specs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'specifications/2.4/specs/C2PA_Specification.html'), contentHtml);
  fs.writeFileSync(path.join(root, 'index.html'), redirectHtml);
  fs.writeFileSync(path.join(root, '404.html'), redirectHtml);
  fs.mkdirSync(path.join(root, '_/css'), { recursive: true });
  fs.writeFileSync(path.join(root, '_/css/site.css'), 'body{}');
  return root;
}

test('discoverPages finds only pages with an article.doc node', () => {
  const root = makeFakeSite();
  const pages = discoverPages(root);
  assert.equal(pages.length, 1);
  assert.equal(
    pages[0],
    path.join(root, 'specifications/2.4/specs/C2PA_Specification.html')
  );
});

test('discoverPages ignores non-html files', () => {
  const root = makeFakeSite();
  const pages = discoverPages(root);
  assert.ok(!pages.some((p) => p.endsWith('.css')));
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `node --test scripts/llm-export/test/discover-pages.test.js`
Expected: FAIL — `Cannot find module '../lib/discover-pages'`

- [ ] **Step 5: Implement**

```javascript
// scripts/llm-export/lib/discover-pages.js
const fs = require('node:fs');
const path = require('node:path');

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * A page is real content, not a redirect stub or UI shell, iff it contains
 * an <article class="doc"> node — verified against the current build/site
 * output, where that's exactly the boundary between the 7 non-content files
 * and every real page.
 */
function discoverPages(siteRoot) {
  const allHtml = walk(siteRoot, []);
  return allHtml.filter((file) => {
    const html = fs.readFileSync(file, 'utf8');
    return /<article\s+class="doc">/.test(html);
  });
}

module.exports = { discoverPages };
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test scripts/llm-export/test/discover-pages.test.js`
Expected: PASS (2 tests)

- [ ] **Step 7: Commit**

```bash
git add scripts/llm-export/lib/discover-pages.js scripts/llm-export/test/discover-pages.test.js scripts/llm-export/test/fixtures/
git commit -m "feat(llm-export): discover content pages by article.doc presence"
```

---

## Task 3: Article extraction

**Files:**
- Create: `scripts/llm-export/lib/extract-article.js`
- Test: `scripts/llm-export/test/extract-article.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/llm-export/test/extract-article.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { extractArticle } = require('../lib/extract-article');

const fixture = fs.readFileSync(path.join(__dirname, 'fixtures/content-page.html'), 'utf8');

test('extractArticle pulls the h1 title', () => {
  const { title } = extractArticle(fixture);
  assert.equal(title, 'Content Credentials : C2PA Technical Specification');
});

test('extractArticle excludes chrome outside article.doc', () => {
  const { contentHtml } = extractArticle(fixture);
  assert.ok(!contentHtml.includes('navbar chrome'));
  assert.ok(!contentHtml.includes('toolbar chrome'));
  assert.ok(!contentHtml.includes('breadcrumb chrome'));
  assert.ok(!contentHtml.includes('footer chrome'));
});

test('extractArticle strips the in-page table of contents', () => {
  const { contentHtml } = extractArticle(fixture);
  assert.ok(!contentHtml.includes('id="toc"'));
  assert.ok(!contentHtml.includes('Table of Contents'));
});

test('extractArticle keeps real body content', () => {
  const { contentHtml } = extractArticle(fixture);
  assert.ok(contentHtml.includes('establish provenance'));
});

test('extractArticle throws on a page with no article.doc', () => {
  const redirectHtml = fs.readFileSync(path.join(__dirname, 'fixtures/redirect-stub.html'), 'utf8');
  assert.throws(() => extractArticle(redirectHtml), /no article\.doc/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/llm-export/test/extract-article.test.js`
Expected: FAIL — `Cannot find module '../lib/extract-article'`

- [ ] **Step 3: Implement**

```javascript
// scripts/llm-export/lib/extract-article.js
const { createDocument } = require('@mixmark-io/domino');

/**
 * Pulls the <article class="doc"> subtree out of a full rendered page,
 * dropping the in-page "Table of Contents" block (id="toc") since it's
 * redundant chrome once the markdown itself carries real headings.
 *
 * Uses @mixmark-io/domino's createDocument(html) directly — this package
 * has no DOMParser; createDocument is the API turndown itself uses
 * internally (confirmed by reading node_modules/turndown/lib/turndown.cjs.js
 * and by running createDocument against a real page fixture).
 */
function extractArticle(html) {
  const doc = createDocument(html);
  const article = doc.querySelector('article.doc');
  if (!article) {
    throw new Error('extractArticle: page has no article.doc node');
  }

  const titleNode = article.querySelector('h1.page');
  const title = titleNode ? titleNode.textContent.trim() : '';

  const toc = article.querySelector('#toc');
  if (toc) toc.parentNode.removeChild(toc);

  if (titleNode) titleNode.parentNode.removeChild(titleNode);

  return { title, contentHtml: article.innerHTML };
}

module.exports = { extractArticle };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/llm-export/test/extract-article.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/llm-export/lib/extract-article.js scripts/llm-export/test/extract-article.test.js
git commit -m "feat(llm-export): extract article.doc content and title from a page"
```

---

## Task 4: Markdown converter (the core conversion rules)

**Files:**
- Create: `scripts/llm-export/lib/markdown-converter.js`
- Test: `scripts/llm-export/test/markdown-converter.test.js`

This is the module with the most rules. Each rule below was smoke-tested against real Antora HTML shapes before writing this plan, so the expected outputs are exact, not guessed.

- [ ] **Step 1: Write the failing tests**

```javascript
// scripts/llm-export/test/markdown-converter.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { htmlToMarkdown } = require('../lib/markdown-converter');

test('preserves heading id via a raw anchor and strips the decorative permalink', () => {
  const html = `<h3 id="claim-generator-definition"><a class="anchor" href="#claim-generator-definition"></a>2.1.2. Claim generator</h3>`;
  const md = htmlToMarkdown(html);
  assert.ok(md.includes('<a id="claim-generator-definition"></a>'));
  assert.ok(md.includes('### 2.1.2. Claim generator'));
  assert.ok(!md.includes(']('));
});

test('converts a NOTE admonition to a labeled blockquote', () => {
  const html = `<div class="admonitionblock note"><table><tr><td class="icon"><i class="fa icon-note" title="Note"></i></td><td class="content">An organization may also be considered an actor.</td></tr></table></div>`;
  const md = htmlToMarkdown(html);
  assert.ok(md.includes('> **NOTE:**'));
  assert.ok(md.includes('> An organization may also be considered an actor.'));
});

test('converts an IMPORTANT admonition preserving its kind', () => {
  const html = `<div class="admonitionblock important"><table><tr><td class="icon"><i class="fa icon-important" title="Important"></i></td><td class="content"><div class="paragraph"><p>From the guiding principles.</p></div></td></tr></table></div>`;
  const md = htmlToMarkdown(html);
  assert.ok(md.includes('> **IMPORTANT:**'));
});

test('converts a tableblock table with a real <thead> to a clean markdown table', () => {
  const html = `<table class="tableblock"><thead><tr><th>Goal</th><th>Description</th></tr></thead><tbody><tr><td><p class="tableblock">Privacy</p></td><td><p class="tableblock">Some description</p></td></tr></tbody></table>`;
  const md = htmlToMarkdown(html);
  assert.equal(
    md.trim(),
    '| Goal | Description |\n| --- | --- |\n| Privacy | Some description |'
  );
});

test('converts a headerless tableblock table (no <thead>, first row is plain <td>s) treating its first row as the header', () => {
  // This is not a hypothetical shape: it's what Asciidoctor emits for any
  // AsciiDoc table that doesn't set options="header" — confirmed against
  // this site's real build output (e.g. "Table 8. List of pre-defined
  // actions" in build/site/specifications/2.4/specs/C2PA_Specification.html
  // has no <thead> at all). turndown-plugin-gfm's own table rule only
  // converts tables with a genuine header row and otherwise dumps the raw
  // <table>...</table> HTML verbatim into the markdown — confirmed by
  // running it directly — which is wrong for 18 of this site's 67 pages
  // (75 tables). Markdown tables have no headerless form anyway, so
  // treating the first row as the header loses nothing real tables had.
  const html = `<table class="tableblock"><tbody><tr><td><p class="tableblock">Action</p></td><td><p class="tableblock">Meaning</p></td></tr><tr><td><p class="tableblock">c2pa.addedText</p></td><td><p class="tableblock">Textual content was inserted.</p></td></tr></tbody></table>`;
  const md = htmlToMarkdown(html);
  assert.equal(
    md.trim(),
    '| Action | Meaning |\n| --- | --- |\n| c2pa.addedText | Textual content was inserted. |'
  );
});

test('renders a numbered table caption as a bold line before the table, for both header shapes', () => {
  const withThead = `<table class="tableblock"><caption class="title">Table 1. C2PA Design Goals</caption><thead><tr><th>Goal</th></tr></thead><tbody><tr><td><p class="tableblock">Privacy</p></td></tr></tbody></table>`;
  assert.equal(htmlToMarkdown(withThead).trim(), '**Table 1. C2PA Design Goals**\n\n| Goal |\n| --- |\n| Privacy |');

  const headerless = `<table class="tableblock"><caption class="title">Table 8. List of pre-defined actions</caption><tbody><tr><td><p class="tableblock">Action</p></td></tr><tr><td><p class="tableblock">c2pa.addedText</p></td></tr></tbody></table>`;
  assert.equal(
    htmlToMarkdown(headerless).trim(),
    '**Table 8. List of pre-defined actions**\n\n| Action |\n| --- |\n| c2pa.addedText |'
  );
});

test('preserves the language hint on a fenced code block', () => {
  const html = `<div class="listingblock"><pre class="highlightjs highlight"><code class="language-abnf hljs" data-lang="abnf">qualified-namespace = "c2pa" / entity</code></pre></div>`;
  const md = htmlToMarkdown(html);
  assert.ok(md.includes('```abnf'));
  assert.ok(md.includes('qualified-namespace = "c2pa" / entity'));
});

test('keeps alt text on a diagram image', () => {
  const html = `<img src="_images/Overview_Diagram.svg" alt="A diagram of how all the parts of C2PA go together">`;
  const md = htmlToMarkdown(html);
  assert.equal(md.trim(), '![A diagram of how all the parts of C2PA go together](_images/Overview_Diagram.svg)');
});

test('falls back to a placeholder for a diagram with no alt text', () => {
  const html = `<img src="_images/mystery.svg">`;
  const md = htmlToMarkdown(html);
  assert.equal(md.trim(), '[Diagram omitted]');
});

test('rewrites a relative same-site internal link to its .md sibling', () => {
  const html = `<a href="../softbinding/Decoupled.html#SBR-API">Soft Binding</a>`;
  const md = htmlToMarkdown(html);
  assert.equal(md.trim(), '[Soft Binding](../softbinding/Decoupled.html.md#SBR-API)');
});

test('rewrites a relative cross-version internal link', () => {
  const html = `<a href="../../1.4/attestations/attestation.html">Attestations</a>`;
  const md = htmlToMarkdown(html);
  assert.equal(md.trim(), '[Attestations](../../1.4/attestations/attestation.html.md)');
});

test('does not rewrite a non-html asset link', () => {
  const html = `<a href="_attachments/C2PA_Specification.pdf">PDF</a>`;
  const md = htmlToMarkdown(html);
  assert.equal(md.trim(), '[PDF](_attachments/C2PA_Specification.pdf)');
});

test('does not rewrite an external .html link to a different site', () => {
  const html = `<a href="https://www.w3.org/TR/SVG11/metadata.html#MetadataElement">SVG spec</a>`;
  const md = htmlToMarkdown(html);
  assert.equal(md.trim(), '[SVG spec](https://www.w3.org/TR/SVG11/metadata.html#MetadataElement)');
});

test('does rewrite an absolute link back into this same site', () => {
  const html = `<a href="https://spec.c2pa.org/specifications/specifications/2.4/specs/C2PA_Specification.html">Spec</a>`;
  const md = htmlToMarkdown(html);
  assert.equal(
    md.trim(),
    '[Spec](https://spec.c2pa.org/specifications/specifications/2.4/specs/C2PA_Specification.html.md)'
  );
});

test('preserves a same-page anchor link unchanged', () => {
  const html = `<a href="#_introduction">introduction</a>`;
  const md = htmlToMarkdown(html);
  assert.equal(md.trim(), '[introduction](#_introduction)');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/llm-export/test/markdown-converter.test.js`
Expected: FAIL — `Cannot find module '../lib/markdown-converter'`

- [ ] **Step 3: Implement**

```javascript
// scripts/llm-export/lib/markdown-converter.js
const TurndownService = require('turndown');
const { strikethrough, taskListItems, highlightedCodeBlock } = require('turndown-plugin-gfm');

const INTERNAL_HTML_LINK = /^(?!\w+:)(?!\/\/)[^"'#]*\.html(#.*)?$/;
const SAME_SITE_ABSOLUTE_HTML_LINK = /^https:\/\/spec\.c2pa\.org\/.*\.html(#.*)?$/;

function createConverter() {
  const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  // Deliberately not using turndown-plugin-gfm's bundled `gfm` (which
  // includes its own `tables` rule) — see the tableblock-table rule below
  // for why. Only its unrelated strikethrough/task-list/code-block rules
  // are used here.
  td.use([strikethrough, taskListItems, highlightedCodeBlock]);

  // Antora already generated stable heading ids (used by #_anchor fragments
  // across pages). CommonMark headings carry no id and a viewer's slugger
  // won't reproduce Antora's ids from heading text, so emit a raw anchor
  // (CommonMark passes inline HTML through) immediately before the heading.
  td.addRule('heading-with-id', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement(content, node) {
      const level = Number(node.nodeName.charAt(1));
      const id = node.getAttribute('id');
      const anchor = id ? `<a id="${id}"></a>\n` : '';
      return `\n\n${anchor}${'#'.repeat(level)} ${content}\n\n`;
    },
  });

  // Antora renders a decorative empty permalink anchor inside every heading
  // with an id (<a class="anchor" href="#x"></a>); drop it before it turns
  // into a stray empty markdown link.
  td.addRule('strip-decorative-permalink', {
    filter: (node) =>
      node.nodeName === 'A' &&
      node.getAttribute('class') === 'anchor' &&
      !node.textContent.trim(),
    replacement: () => '',
  });

  // AsciiDoc admonitions (NOTE/IMPORTANT/WARNING/TIP/CAUTION) render as
  // div.admonitionblock <kind>; turn them into a labeled blockquote so the
  // kind survives in plain markdown.
  td.addRule('admonition', {
    filter: (node) =>
      node.nodeName === 'DIV' && /\badmonitionblock\b/.test(node.getAttribute('class') || ''),
    replacement(content, node) {
      const match = (node.getAttribute('class') || '').match(/admonitionblock\s+(\w+)/);
      const kind = match ? match[1].toUpperCase() : 'NOTE';
      const contentCell = node.querySelector('td.content');
      const inner = td.turndown(contentCell ? contentCell.innerHTML : content).trim();
      const quoted = inner
        .split('\n')
        .map((line) => (line ? `> ${line}` : '>'))
        .join('\n');
      return `\n\n> **${kind}:**\n${quoted}\n\n`;
    },
  });

  // Unwrap <p class="tableblock"> inside cells before the table rule below
  // renders that cell's own converted content, so cells stay on one line
  // instead of getting stray blank lines from the paragraph's default
  // block-level spacing.
  td.addRule('tableblock-cell-paragraph', {
    filter: (node) => node.nodeName === 'P' && node.parentNode && node.parentNode.nodeName === 'TD',
    replacement: (content) => content,
  });

  // Antora tables sometimes have a real <thead>/<th> header row, and
  // sometimes (when the AsciiDoc source table doesn't set
  // options="header") have no <thead> at all — the visual "header" is just
  // a plain <tr> of <td>s that happens to be the first row of <tbody>.
  // turndown-plugin-gfm's own table rule only converts a table when it
  // detects a genuine header row and otherwise dumps the raw <table> HTML
  // verbatim (via its internal `keep()`) — confirmed by running it
  // directly against this site's real output: 18 of 67 pages and 75
  // separate tables (e.g. "Table 8. List of pre-defined actions" in
  // build/site/specifications/2.4/specs/C2PA_Specification.html) have no
  // <thead> and would otherwise land as multi-hundred-line raw HTML blobs
  // in the markdown mirror. So this tool doesn't use turndown-plugin-gfm's
  // table rule at all and instead converts every <table> itself, always
  // treating the first row as the header — markdown tables have no
  // headerless form anyway, so this loses nothing real tables had.
  td.addRule('tableblock-table', {
    filter: (node) => node.nodeName === 'TABLE',
    replacement(content, node) {
      const rows = Array.from(node.querySelectorAll('tr'));
      if (rows.length === 0) return '';

      const cellsOf = (row) => Array.from(row.children).filter((c) => c.nodeName === 'TD' || c.nodeName === 'TH');
      const cellText = (cell) =>
        td
          .turndown(cell.innerHTML)
          .replace(/\|/g, '\\|')
          .replace(/\r?\n+/g, ' ')
          .trim();

      const [headerRow, ...bodyRows] = rows;
      const headerCells = cellsOf(headerRow).map(cellText);
      const lines = [
        `| ${headerCells.join(' | ')} |`,
        `| ${headerCells.map(() => '---').join(' | ')} |`,
        ...bodyRows.map((row) => `| ${cellsOf(row).map(cellText).join(' | ')} |`),
      ];

      // Rebuilding the table from raw <tr> DOM nodes (rather than using the
      // already bottom-up-converted `content`) means a <caption> child
      // never gets a chance to contribute through the normal content flow;
      // render it explicitly instead.
      const caption = node.querySelector('caption');
      const captionMd = caption ? `**${td.turndown(caption.innerHTML).trim()}**\n\n` : '';

      return `\n\n${captionMd}${lines.join('\n')}\n\n`;
    },
  });

  // Diagrams (e.g. Kroki/PlantUML SVGs) degrade to alt text; with no alt
  // text there's nothing text-only consumers can use, so say so explicitly.
  td.addRule('image-alt-or-placeholder', {
    filter: 'img',
    replacement(content, node) {
      const alt = (node.getAttribute('alt') || '').trim();
      return alt ? `![${alt}](${node.getAttribute('src')})` : '[Diagram omitted]';
    },
  });

  // Rewrite links that point at another page on this site so they resolve
  // to that page's markdown mirror instead of its HTML. Same-page anchors,
  // non-html assets (PDFs, images, zips), and links to other sites are left
  // untouched.
  td.addRule('rewrite-internal-html-links', {
    filter: (node) => node.nodeName === 'A' && !!node.getAttribute('href'),
    replacement(content, node) {
      let href = node.getAttribute('href');
      if (INTERNAL_HTML_LINK.test(href) || SAME_SITE_ABSOLUTE_HTML_LINK.test(href)) {
        href = href.replace(/\.html(#|$)/, '.html.md$1');
      }
      return content ? `[${content}](${href})` : '';
    },
  });

  return td;
}

const converter = createConverter();

function htmlToMarkdown(html) {
  return converter.turndown(html);
}

module.exports = { htmlToMarkdown };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/llm-export/test/markdown-converter.test.js`
Expected: PASS (15 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/llm-export/lib/markdown-converter.js scripts/llm-export/test/markdown-converter.test.js
git commit -m "feat(llm-export): HTML-to-markdown conversion with Antora-specific rules"
```

---

## Task 5: Nav parsing (page order, titles, category groupings)

**Files:**
- Create: `scripts/llm-export/lib/parse-nav.js`
- Test: `scripts/llm-export/test/parse-nav.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/llm-export/test/parse-nav.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseNav } = require('../lib/parse-nav');

const fixture = fs.readFileSync(path.join(__dirname, 'fixtures/content-page.html'), 'utf8');

test('parseNav groups pages under their category label', () => {
  const nav = parseNav(fixture);
  assert.deepEqual(
    nav.categories.map((c) => c.label),
    ['Technical Specifications', 'Informative Documents']
  );
});

test('parseNav lists pages in nav order under each category, with titles and hrefs', () => {
  const nav = parseNav(fixture);
  const techSpecs = nav.categories.find((c) => c.label === 'Technical Specifications');
  assert.deepEqual(techSpecs.pages, [
    { title: 'Content Credentials', href: 'C2PA_Specification.html' },
    { title: 'Content Credentials JSON (crJSON)', href: '../crJSON/crjson-format.html' },
  ]);
});

test('parseNav falls back to a single "Pages" category when nav has no grouping', () => {
  const flatHtml = `
    <nav class="nav-menu">
      <ul class="nav-list"><li class="nav-item" data-depth="0">
        <ul class="nav-list"><li class="nav-item" data-depth="1">
          <a class="nav-link" href="a.html">Page A</a>
        </li></ul>
      </li></ul>
    </nav>`;
  const nav = parseNav(flatHtml);
  assert.deepEqual(nav.categories.map((c) => c.label), ['Pages']);
  assert.deepEqual(nav.categories[0].pages, [{ title: 'Page A', href: 'a.html' }]);
});

test('parseNav returns a flat page order across all categories for llms-full.txt', () => {
  const nav = parseNav(fixture);
  assert.deepEqual(nav.pageOrder, [
    'C2PA_Specification.html',
    '../crJSON/crjson-format.html',
    '../security/Security_Considerations.html',
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/llm-export/test/parse-nav.test.js`
Expected: FAIL — `Cannot find module '../lib/parse-nav'`

- [ ] **Step 3: Implement**

```javascript
// scripts/llm-export/lib/parse-nav.js
const { createDocument } = require('@mixmark-io/domino');

/**
 * @mixmark-io/domino has no DOMParser (see extract-article.js) and its Zest
 * selector engine silently returns zero matches for `:scope`-based queries
 * (verified directly: `el.querySelectorAll(':scope > li')` returns an empty
 * list on a real element with matching children, no error thrown) and
 * throws on a leading `>` combinator. So "direct child of this specific
 * element" has to be done by walking `.children` instead of any selector
 * that implies scoping to a context node.
 */
function directChildren(el, tagName) {
  return Array.from(el.children).filter((c) => c.tagName === tagName);
}

function directChild(el, tagName, className) {
  return directChildren(el, tagName).find((c) => {
    if (!className) return true;
    return (c.getAttribute('class') || '').split(/\s+/).includes(className);
  });
}

/**
 * Antora's rendered nav sidebar is the one place the site already carries
 * fully-resolved page order, titles, and grouping for a version — it's the
 * same source nav.adoc compiled after all cross-component xrefs resolved.
 * Rather than re-parsing nav.adoc (unavailable here; we only have HTML
 * output) or hardcoding this site's current category names, walk the
 * rendered tree generically: a depth=1 item with a .nav-text (not a link)
 * is a category heading; everything under it, at any deeper depth, is a
 * page in that category, in document order.
 */
function parseNav(pageHtml) {
  const doc = createDocument(pageHtml);
  const menu = doc.querySelector('nav.nav-menu');
  if (!menu) {
    return { categories: [], pageOrder: [] };
  }

  // Descendant queries with no leading combinator (no `:scope`, no `>`)
  // work fine on domino — only context-relative combinators are broken.
  const depth0 = menu.querySelector('li.nav-item[data-depth="0"]');
  const topUl = depth0 ? directChild(depth0, 'UL') : null;
  const topLevelItems = topUl ? directChildren(topUl, 'LI') : [];

  const categories = [];
  const pageOrder = [];
  let ungrouped = null;

  for (const item of topLevelItems) {
    const label = directChild(item, 'SPAN', 'nav-text');
    const directLink = directChild(item, 'A', 'nav-link');

    if (label) {
      const pages = Array.from(item.querySelectorAll('a.nav-link')).map((a) => ({
        title: a.textContent.trim(),
        href: a.getAttribute('href'),
      }));
      categories.push({ label: label.textContent.trim(), pages });
      pages.forEach((p) => pageOrder.push(p.href));
    } else if (directLink) {
      if (!ungrouped) {
        ungrouped = { label: 'Pages', pages: [] };
        categories.push(ungrouped);
      }
      ungrouped.pages.push({ title: directLink.textContent.trim(), href: directLink.getAttribute('href') });
      pageOrder.push(directLink.getAttribute('href'));
    }
  }

  return { categories, pageOrder };
}

module.exports = { parseNav };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/llm-export/test/parse-nav.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/llm-export/lib/parse-nav.js scripts/llm-export/test/parse-nav.test.js
git commit -m "feat(llm-export): parse rendered nav for page order, titles, categories"
```

---

## Task 6: Write per-page markdown mirrors

**Files:**
- Create: `scripts/llm-export/lib/write-mirrors.js`
- Test: `scripts/llm-export/test/write-mirrors.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/llm-export/test/write-mirrors.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { writeMirrors } = require('../lib/write-mirrors');

test('writeMirrors converts every discovered page and writes a .html.md sibling', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-export-mirrors-'));
  const pageDir = path.join(root, 'specifications/2.4/specs');
  fs.mkdirSync(pageDir, { recursive: true });
  const pagePath = path.join(pageDir, 'C2PA_Specification.html');
  fs.copyFileSync(path.join(__dirname, 'fixtures/content-page.html'), pagePath);

  const results = writeMirrors(root);

  const mirrorPath = `${pagePath}.md`;
  assert.ok(fs.existsSync(mirrorPath));
  const md = fs.readFileSync(mirrorPath, 'utf8');
  assert.ok(md.startsWith('# Content Credentials : C2PA Technical Specification\n'));
  assert.ok(md.includes('establish provenance'));
  assert.ok(!md.includes('Table of Contents'));

  assert.equal(results.length, 1);
  assert.equal(results[0].sourcePath, pagePath);
  assert.equal(results[0].mirrorPath, mirrorPath);
  assert.equal(results[0].title, 'Content Credentials : C2PA Technical Specification');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/llm-export/test/write-mirrors.test.js`
Expected: FAIL — `Cannot find module '../lib/write-mirrors'`

- [ ] **Step 3: Implement**

```javascript
// scripts/llm-export/lib/write-mirrors.js
const fs = require('node:fs');
const { discoverPages } = require('./discover-pages');
const { extractArticle } = require('./extract-article');
const { htmlToMarkdown } = require('./markdown-converter');

/**
 * Converts every content page under siteRoot and writes its markdown
 * mirror as a `.md`-suffixed sibling of the source .html file. Returns
 * per-page metadata so callers (llms.txt/llms-full.txt builders) don't
 * need to re-walk or re-parse anything.
 */
function writeMirrors(siteRoot) {
  const pages = discoverPages(siteRoot);
  return pages.map((sourcePath) => {
    const html = fs.readFileSync(sourcePath, 'utf8');
    const { title, contentHtml } = extractArticle(html);
    const body = htmlToMarkdown(contentHtml).trim();
    const markdown = `# ${title}\n\n${body}\n`;

    const mirrorPath = `${sourcePath}.md`;
    fs.writeFileSync(mirrorPath, markdown);

    return { sourcePath, mirrorPath, title, markdown };
  });
}

module.exports = { writeMirrors };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/llm-export/test/write-mirrors.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/llm-export/lib/write-mirrors.js scripts/llm-export/test/write-mirrors.test.js
git commit -m "feat(llm-export): write per-page markdown mirrors"
```

---

## Task 7: `llms.txt` generation

**Files:**
- Create: `scripts/llm-export/lib/build-llms-txt.js`
- Test: `scripts/llm-export/test/build-llms-txt.test.js`

Per the design doc, `llms.txt` needs: an H1 title, a one-paragraph blockquote summary, H2 sections (here: nav categories per this plan's Design Notes), and under each a bullet list `- [Title](page.html.md): description`. The description is the page's `<meta name="description">` when Antora emitted one (from AsciiDoc's `:description:` attribute), else the first sentence of the page body.

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/llm-export/test/build-llms-txt.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildLlmsTxt } = require('../lib/build-llms-txt');

test('buildLlmsTxt renders title, summary, and one H2 per category with described bullets', () => {
  const nav = {
    categories: [
      {
        label: 'Technical Specifications',
        pages: [{ title: 'Content Credentials', href: 'specs/C2PA_Specification.html' }],
      },
    ],
  };
  const descriptionsByHref = {
    'specs/C2PA_Specification.html': 'C2PA defines a way to establish provenance for digital content.',
  };

  const txt = buildLlmsTxt({
    siteTitle: 'C2PA Technical Specification',
    summary: 'C2PA defines an end-to-end system for certifying the provenance of media content.',
    nav,
    descriptionsByHref,
  });

  assert.equal(
    txt,
    [
      '# C2PA Technical Specification',
      '',
      '> C2PA defines an end-to-end system for certifying the provenance of media content.',
      '',
      '## Technical Specifications',
      '',
      '- [Content Credentials](specs/C2PA_Specification.html.md): C2PA defines a way to establish provenance for digital content.',
      '',
    ].join('\n')
  );
});

test('buildLlmsTxt omits the description suffix when none is available', () => {
  const nav = { categories: [{ label: 'Pages', pages: [{ title: 'A', href: 'a.html' }] }] };
  const txt = buildLlmsTxt({ siteTitle: 'T', summary: 'S', nav, descriptionsByHref: {} });
  assert.ok(txt.includes('- [A](a.html.md)\n'));
  assert.ok(!txt.includes('):'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/llm-export/test/build-llms-txt.test.js`
Expected: FAIL — `Cannot find module '../lib/build-llms-txt'`

- [ ] **Step 3: Implement**

```javascript
// scripts/llm-export/lib/build-llms-txt.js
function toMirrorHref(href) {
  return href.replace(/\.html(#|$)/, '.html.md$1');
}

function buildLlmsTxt({ siteTitle, summary, nav, descriptionsByHref }) {
  const lines = [`# ${siteTitle}`, '', `> ${summary}`, ''];

  for (const category of nav.categories) {
    lines.push(`## ${category.label}`, '');
    for (const page of category.pages) {
      const description = descriptionsByHref[page.href];
      const suffix = description ? `: ${description}` : '';
      lines.push(`- [${page.title}](${toMirrorHref(page.href)})${suffix}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

module.exports = { buildLlmsTxt };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/llm-export/test/build-llms-txt.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/llm-export/lib/build-llms-txt.js scripts/llm-export/test/build-llms-txt.test.js
git commit -m "feat(llm-export): generate llms.txt from parsed nav + descriptions"
```

---

## Task 8: Description extraction (meta description or first sentence)

**Files:**
- Modify: `scripts/llm-export/lib/extract-article.js`
- Modify: `scripts/llm-export/test/extract-article.test.js`

- [ ] **Step 1: Write the failing tests (add to the existing test file)**

```javascript
// append to scripts/llm-export/test/extract-article.test.js

test('extractArticle uses <meta name="description"> when present', () => {
  const html = fixture.replace(
    '<title>Content Credentials : C2PA Technical Specification :: C2PA Specifications</title>',
    '<title>Content Credentials : C2PA Technical Specification :: C2PA Specifications</title>\n<meta name="description" content="A curated one-liner from :description:.">'
  );
  const { description } = extractArticle(html);
  assert.equal(description, 'A curated one-liner from :description:.');
});

test('extractArticle falls back to the first sentence of body text when no meta description exists', () => {
  const { description } = extractArticle(fixture);
  assert.equal(description, 'C2PA defines a way to establish provenance for digital content.');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/llm-export/test/extract-article.test.js`
Expected: FAIL — `description` is `undefined`, assertions fail

- [ ] **Step 3: Implement**

Modify `scripts/llm-export/lib/extract-article.js`:

```javascript
// scripts/llm-export/lib/extract-article.js
const { createDocument } = require('@mixmark-io/domino');

function firstSentence(text) {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  const match = trimmed.match(/^.*?[.!?](?=\s|$)/);
  return match ? match[0] : trimmed;
}

function extractArticle(html) {
  const doc = createDocument(html);
  const article = doc.querySelector('article.doc');
  if (!article) {
    throw new Error('extractArticle: page has no article.doc node');
  }

  const titleNode = article.querySelector('h1.page');
  const title = titleNode ? titleNode.textContent.trim() : '';

  const toc = article.querySelector('#toc');
  if (toc) toc.parentNode.removeChild(toc);

  if (titleNode) titleNode.parentNode.removeChild(titleNode);

  const metaDescription = doc.querySelector('meta[name="description"]');
  let description;
  if (metaDescription) {
    description = metaDescription.getAttribute('content').trim();
  } else {
    const firstParagraph = article.querySelector('p');
    description = firstParagraph ? firstSentence(firstParagraph.textContent) : '';
  }

  return { title, contentHtml: article.innerHTML, description };
}

module.exports = { extractArticle };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/llm-export/test/extract-article.test.js`
Expected: PASS (7 tests)

- [ ] **Step 5: Update `write-mirrors.js` to surface `description` in its results**

Modify `scripts/llm-export/lib/write-mirrors.js`: destructure `description` alongside `title, contentHtml` from `extractArticle(html)`, and add `description` to the returned object (`return { sourcePath, mirrorPath, title, description, markdown };`).

Add to `scripts/llm-export/test/write-mirrors.test.js`:

```javascript
// append
test('writeMirrors surfaces each page\'s description', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-export-mirrors-desc-'));
  const pageDir = path.join(root, 'specifications/2.4/specs');
  fs.mkdirSync(pageDir, { recursive: true });
  fs.copyFileSync(
    path.join(__dirname, 'fixtures/content-page.html'),
    path.join(pageDir, 'C2PA_Specification.html')
  );
  const [result] = writeMirrors(root);
  assert.equal(result.description, 'C2PA defines a way to establish provenance for digital content.');
});
```

- [ ] **Step 6: Run the full test suite**

Run: `npm run test:llm-export`
Expected: PASS (all tests across all files)

- [ ] **Step 7: Commit**

```bash
git add scripts/llm-export/lib/extract-article.js scripts/llm-export/lib/write-mirrors.js scripts/llm-export/test/extract-article.test.js scripts/llm-export/test/write-mirrors.test.js
git commit -m "feat(llm-export): derive page descriptions from meta description or first sentence"
```

---

## Task 9: `llms-full.txt` generation

**Files:**
- Create: `scripts/llm-export/lib/build-llms-full-txt.js`
- Test: `scripts/llm-export/test/build-llms-full-txt.test.js`

Concatenates every page's markdown in nav order, with a horizontal rule and title marker between pages. Pages that exist on disk but aren't reachable from nav (orphans) are appended at the end, sorted by their href, so the export never silently drops a published page.

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/llm-export/test/build-llms-full-txt.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildLlmsFullTxt } = require('../lib/build-llms-full-txt');

test('buildLlmsFullTxt concatenates pages in nav order with a rule and title marker between them', () => {
  const pageOrder = ['b.html', 'a.html'];
  const pagesByHref = {
    'a.html': { title: 'Page A', markdown: '# Page A\n\nContent A.' },
    'b.html': { title: 'Page B', markdown: '# Page B\n\nContent B.' },
  };

  const txt = buildLlmsFullTxt({ pageOrder, pagesByHref });

  assert.equal(
    txt,
    ['# Page B', '', 'Content B.', '', '---', '', '# Page A', '', 'Content A.', ''].join('\n')
  );
});

test('buildLlmsFullTxt appends orphan pages (not in nav) at the end, sorted by href', () => {
  const pageOrder = ['a.html'];
  const pagesByHref = {
    'a.html': { title: 'Page A', markdown: '# Page A\n\nContent A.' },
    'z-orphan.html': { title: 'Orphan Z', markdown: '# Orphan Z\n\nOrphan content.' },
  };

  const txt = buildLlmsFullTxt({ pageOrder, pagesByHref });

  assert.equal(
    txt,
    [
      '# Page A', '', 'Content A.', '',
      '---', '',
      '# Orphan Z', '', 'Orphan content.', '',
    ].join('\n')
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/llm-export/test/build-llms-full-txt.test.js`
Expected: FAIL — `Cannot find module '../lib/build-llms-full-txt'`

- [ ] **Step 3: Implement**

```javascript
// scripts/llm-export/lib/build-llms-full-txt.js
function buildLlmsFullTxt({ pageOrder, pagesByHref }) {
  const orphanHrefs = Object.keys(pagesByHref)
    .filter((href) => !pageOrder.includes(href))
    .sort();
  const orderedHrefs = [...pageOrder, ...orphanHrefs];

  const sections = orderedHrefs
    .filter((href) => pagesByHref[href])
    .map((href) => pagesByHref[href].markdown.trim());

  return sections.join('\n\n---\n\n') + '\n';
}

module.exports = { buildLlmsFullTxt };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/llm-export/test/build-llms-full-txt.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/llm-export/lib/build-llms-full-txt.js scripts/llm-export/test/build-llms-full-txt.test.js
git commit -m "feat(llm-export): generate llms-full.txt in nav order with orphan fallback"
```

---

## Task 10: Link-integrity check

**Files:**
- Create: `scripts/llm-export/lib/check-links.js`
- Test: `scripts/llm-export/test/check-links.test.js`

The existing `runLinkChecker.sh` (docker `timaschew/link-checker`) only follows `<a href>` in HTML; it won't parse markdown link syntax inside `.md` files. This is a small dedicated check: for every generated `.md` file, find markdown links pointing at another local `.md`/`.html.md` file and confirm the target exists on disk. External links and same-page anchors are out of scope here (the design doc's validation section covers full link-checking as a CI concern for the playbook build as a whole, not specific to this tool).

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/llm-export/test/check-links.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { checkLinks } = require('../lib/check-links');

test('checkLinks reports no broken links when every target exists', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-export-links-'));
  fs.writeFileSync(path.join(root, 'a.html.md'), '[Go to B](b.html.md)\n[Anchor](#_x)\n[External](https://example.com)\n');
  fs.writeFileSync(path.join(root, 'b.html.md'), '# B\n');

  const result = checkLinks([path.join(root, 'a.html.md'), path.join(root, 'b.html.md')]);
  assert.deepEqual(result.broken, []);
});

test('checkLinks reports a broken link to a missing local file', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-export-links-broken-'));
  fs.writeFileSync(path.join(root, 'a.html.md'), '[Missing](missing.html.md)\n');

  const result = checkLinks([path.join(root, 'a.html.md')]);
  assert.equal(result.broken.length, 1);
  assert.equal(result.broken[0].file, path.join(root, 'a.html.md'));
  assert.equal(result.broken[0].target, 'missing.html.md');
});

test('checkLinks ignores bracket/paren sequences inside fenced code blocks', () => {
  // Real content hits this: CDDL/JSON pattern strings like
  // (?:[A-Za-z0-9-]*[A-Za-z0-9]) inside a fenced code block would otherwise
  // be misread as a markdown link with target "?:[A-Za-z0-9-]*[A-Za-z0-9]".
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-export-links-code-'));
  fs.writeFileSync(
    path.join(root, 'a.html.md'),
    '```abnf\nlabel = 1*(ALPHA / DIGIT) (?:[A-Za-z0-9-]*[A-Za-z0-9])\n```\n'
  );

  const result = checkLinks([path.join(root, 'a.html.md')]);
  assert.deepEqual(result.broken, []);
});

test('checkLinks does not try to resolve a root-relative absolute path', () => {
  // e.g. 404.html's real content links to "/specifications/specifications/2.4/index.html.md"
  // (root-relative to the published site, not to this file's directory) —
  // resolving that correctly would require knowing the site's base path
  // (antora-playbook.yml's site.url), which this lightweight checker
  // deliberately doesn't model; skip these rather than false-flag them.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-export-links-absolute-'));
  fs.writeFileSync(path.join(root, 'a.html.md'), '[Home](/specifications/specifications/2.4/index.html.md)\n');

  const result = checkLinks([path.join(root, 'a.html.md')]);
  assert.deepEqual(result.broken, []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/llm-export/test/check-links.test.js`
Expected: FAIL — `Cannot find module '../lib/check-links'`

- [ ] **Step 3: Implement**

```javascript
// scripts/llm-export/lib/check-links.js
const fs = require('node:fs');
const path = require('node:path');

const MARKDOWN_LINK = /\[[^\]]*\]\(([^)]+)\)/g;
const FENCED_CODE_BLOCK = /```[\s\S]*?```/g;

function isLocalFileLink(target) {
  // Absolute (root-relative) paths like "/specifications/specifications/2.4/x.html.md"
  // point at the published site's URL space, not this file's directory —
  // correctly resolving them would require knowing the site's base path
  // (antora-playbook.yml's site.url); skip rather than false-flag them.
  return !/^\w+:/.test(target) && !target.startsWith('#') && !target.startsWith('/');
}

function checkLinks(mirrorPaths) {
  const broken = [];
  for (const file of mirrorPaths) {
    const raw = fs.readFileSync(file, 'utf8');
    // Blank out fenced code blocks before scanning: a CDDL/JSON/ABNF sample
    // (real example: a JSON schema "pattern" string containing
    // `(?:[A-Za-z0-9-]*[A-Za-z0-9])`) can contain bracket/paren sequences
    // that coincidentally match MARKDOWN_LINK and would otherwise be
    // reported as a broken link to a nonsense target.
    const content = raw.replace(FENCED_CODE_BLOCK, (block) => block.replace(/[^\n]/g, ' '));
    for (const match of content.matchAll(MARKDOWN_LINK)) {
      const [, rawTarget] = match;
      const target = rawTarget.split('#')[0];
      if (!target || !isLocalFileLink(rawTarget)) continue;
      const resolved = path.resolve(path.dirname(file), target);
      if (!fs.existsSync(resolved)) {
        broken.push({ file, target: rawTarget });
      }
    }
  }
  return { broken };
}

module.exports = { checkLinks };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/llm-export/test/check-links.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/llm-export/lib/check-links.js scripts/llm-export/test/check-links.test.js
git commit -m "feat(llm-export): validate internal markdown links resolve to real files"
```

---

## Task 11: Word-count drift check

**Files:**
- Create: `scripts/llm-export/lib/word-count-check.js`
- Test: `scripts/llm-export/test/word-count-check.test.js`

Per the design doc: catch silent truncation from a conversion rule that fails to match some page's structure, via a tolerance-based drift check, not exact match (markdown conversion legitimately drops some HTML-only chrome).

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/llm-export/test/word-count-check.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { checkWordCountDrift } = require('../lib/word-count-check');

test('checkWordCountDrift passes when markdown word count is close to source html text', () => {
  const pages = [
    { sourceText: 'one two three four five six seven eight nine ten', markdown: 'one two three four five six seven eight nine' },
  ];
  const result = checkWordCountDrift(pages, 0.9);
  assert.equal(result.ok, true);
  assert.equal(result.htmlWords, 10);
  assert.equal(result.mdWords, 9);
});

test('checkWordCountDrift fails when markdown lost too much content', () => {
  const pages = [
    { sourceText: 'one two three four five six seven eight nine ten', markdown: 'one two three' },
  ];
  const result = checkWordCountDrift(pages, 0.9);
  assert.equal(result.ok, false);
  assert.ok(result.ratio < 0.9);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/llm-export/test/word-count-check.test.js`
Expected: FAIL — `Cannot find module '../lib/word-count-check'`

- [ ] **Step 3: Implement**

```javascript
// scripts/llm-export/lib/word-count-check.js
function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function checkWordCountDrift(pages, thresholdRatio = 0.85) {
  let htmlWords = 0;
  let mdWords = 0;
  for (const page of pages) {
    htmlWords += countWords(page.sourceText);
    mdWords += countWords(page.markdown);
  }
  const ratio = htmlWords === 0 ? 1 : mdWords / htmlWords;
  return { ok: ratio >= thresholdRatio, ratio, htmlWords, mdWords };
}

module.exports = { checkWordCountDrift };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/llm-export/test/word-count-check.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/llm-export/lib/word-count-check.js scripts/llm-export/test/word-count-check.test.js
git commit -m "feat(llm-export): word-count drift check between source HTML and generated markdown"
```

---

## Task 12: Orchestrator (`generate.js`)

**Files:**
- Create: `scripts/llm-export/generate.js`

This wires every module above into the full pipeline described in the design doc's "Generation pipeline" section, run once per invocation over the whole built site (all versions at once, since Antora rebuilds all versions together). No new unit test here — it's pure orchestration over already-tested modules; Task 13 verifies it end-to-end against this repo's real `build/site/`.

- [ ] **Step 1: Implement**

```javascript
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
```

Note on the `0.5` drift threshold: source HTML text (via `stripTags`) still includes nav-sidebar and header/footer chrome text that the markdown mirror correctly excludes, so raw HTML word count is not directly comparable to the article-only markdown — the threshold is loose by design to catch gross truncation (e.g. a rule silently dropping a whole section) rather than expected, intentional shrinkage from chrome removal. Tightening this later by comparing against the *stripped-chrome* article HTML's word count (which `extractArticle` already isolates) rather than the whole page is a reasonable follow-up once real numbers from a full build are in hand — flagged in Task 13.

- [ ] **Step 2: Commit**

```bash
git add scripts/llm-export/generate.js
git commit -m "feat(llm-export): orchestrate mirror generation, llms.txt/llms-full.txt, and validation"
```

---

## Task 12b: Fix relative links breaking when content is relocated into `llms.txt`/`llms-full.txt`

**Discovered during Task 12's code review, not anticipated when this plan was originally written.** Every markdown link `markdown-converter.js` writes is relative to the page's *own* directory (e.g. a page in `specifications/2.4/security/` links to `../specs/C2PA_Specification.html.md`, correct relative to `security/`). That's fine for the per-page `.html.md` mirrors, which stay in their original directory. But two things in Task 12 *move* that same markdown to a different directory without adjusting its links:

1. **`llms-full.txt`** concatenates every page's markdown, unmodified, into one file at the *version root* (`specifications/2.4/llms-full.txt`) — not each page's own subdirectory. A link written relative to `security/` is now wrong once the containing document actually lives at `specifications/2.4/`.
2. **The site-root copy** of `llms.txt`/`llms-full.txt` (Task 12's "latest version" branch) copies content verbatim from `specifications/2.4/` up to the site root — two directory levels up — without adjusting its links either.

Measured impact against this repo's real `build/site/`, before this fix: **1862 of 2026 links (92%) across all `llms.txt`/`llms-full.txt` files were broken.** Every per-page `.html.md` mirror was fine in isolation (that's what Task 10's `checkLinks` already validates); the aggregated files were not, and nothing in the pipeline was checking them.

**Files:**
- Create: `scripts/llm-export/lib/rewrite-relative-links.js`
- Test: `scripts/llm-export/test/rewrite-relative-links.test.js`
- Modify: `scripts/llm-export/generate.js`

- [ ] **Step 1: Write the failing tests**

```javascript
// scripts/llm-export/test/rewrite-relative-links.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { rewriteRelativeLinks } = require('../lib/rewrite-relative-links');

test('rewrites a same-directory-relative link when content moves to a parent directory', () => {
  const md = 'See [spec](../specs/C2PA_Specification.html.md).';
  const out = rewriteRelativeLinks(md, {
    fromDir: '/site/specifications/2.4/security',
    toDir: '/site/specifications/2.4',
  });
  assert.equal(out, 'See [spec](specs/C2PA_Specification.html.md).');
});

test('rewrites a cross-version ../-prefixed link correctly', () => {
  const md = '[Harms](../../1.0/security/Harms_Modelling.html.md)';
  const out = rewriteRelativeLinks(md, {
    fromDir: '/site/specifications/2.4/security',
    toDir: '/site/specifications/2.4',
  });
  assert.equal(out, '[Harms](../1.0/security/Harms_Modelling.html.md)');
});

test('rewrites links when relocating a whole version file up to the site root', () => {
  const md = '[Content Credentials](specs/C2PA_Specification.html.md)';
  const out = rewriteRelativeLinks(md, {
    fromDir: '/site/specifications/2.4',
    toDir: '/site',
  });
  assert.equal(out, '[Content Credentials](specifications/2.4/specs/C2PA_Specification.html.md)');
});

test('leaves an external link untouched', () => {
  const md = '[SVG spec](https://www.w3.org/TR/SVG11/metadata.html#MetadataElement)';
  const out = rewriteRelativeLinks(md, { fromDir: '/site/specifications/2.4/security', toDir: '/site/specifications/2.4' });
  assert.equal(out, md);
});

test('leaves a same-page anchor untouched', () => {
  const md = '[intro](#_introduction)';
  const out = rewriteRelativeLinks(md, { fromDir: '/site/specifications/2.4/security', toDir: '/site/specifications/2.4' });
  assert.equal(out, md);
});

test('leaves a root-relative absolute link untouched', () => {
  const md = '[Home](/specifications/specifications/2.4/index.html.md)';
  const out = rewriteRelativeLinks(md, { fromDir: '/site/specifications/2.4/security', toDir: '/site/specifications/2.4' });
  assert.equal(out, md);
});

test('preserves a #fragment through relocation', () => {
  const md = '[Soft Binding](../softbinding/Decoupled.html.md#SBR-API)';
  const out = rewriteRelativeLinks(md, {
    fromDir: '/site/specifications/2.4/security',
    toDir: '/site/specifications/2.4',
  });
  assert.equal(out, '[Soft Binding](softbinding/Decoupled.html.md#SBR-API)');
});

test('does not corrupt bracket/paren sequences inside a fenced code block', () => {
  // Same real trigger as Task 10's check-links.js regression test: a JSON
  // schema pattern string containing "[A-Za-z0-9](?:" would otherwise be
  // misread as a markdown link and get its "target" mangled by rewriting.
  const md = '```json\n"pattern": "^[A-Za-z]{2,63}(?:\\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+\\.?$"\n```\n';
  const out = rewriteRelativeLinks(md, { fromDir: '/site/specifications/2.4/security', toDir: '/site/specifications/2.4' });
  assert.equal(out, md);
});

test('rewrites an image link the same way as a regular link', () => {
  const md = '![diagram](_images/Overview_Diagram.svg)';
  const out = rewriteRelativeLinks(md, {
    fromDir: '/site/specifications/2.4/specs',
    toDir: '/site/specifications/2.4',
  });
  assert.equal(out, '![diagram](specs/_images/Overview_Diagram.svg)');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/llm-export/test/rewrite-relative-links.test.js`
Expected: FAIL — `Cannot find module '../lib/rewrite-relative-links'`

- [ ] **Step 3: Implement**

```javascript
// scripts/llm-export/lib/rewrite-relative-links.js
const path = require('node:path');

const MARKDOWN_LINK = /(!?\[[^\]]*\]\()([^)]+)(\))/g;
const FENCED_CODE_BLOCK = /```[\s\S]*?```/;

function isRelativeLocalLink(target) {
  return !/^\w+:/.test(target) && !target.startsWith('//') && !target.startsWith('#') && !target.startsWith('/');
}

function rewriteLinksInProse(text, fromDir, toDir) {
  return text.replace(MARKDOWN_LINK, (whole, prefix, rawTarget, suffix) => {
    const hashIndex = rawTarget.indexOf('#');
    const targetPath = hashIndex === -1 ? rawTarget : rawTarget.slice(0, hashIndex);
    const fragment = hashIndex === -1 ? '' : rawTarget.slice(hashIndex);
    if (!targetPath || !isRelativeLocalLink(rawTarget)) return whole;

    const absolute = path.resolve(fromDir, targetPath);
    const relative = path.relative(toDir, absolute).split(path.sep).join('/');
    return `${prefix}${relative}${fragment}${suffix}`;
  });
}

/**
 * Rewrites relative local links in `markdown` so they resolve correctly
 * after the content moves from `fromDir` (the directory its links were
 * originally written relative to) to `toDir` (the directory it will now
 * actually be written to). Content inside fenced code blocks is left
 * untouched, since a code sample can coincidentally contain bracket/paren
 * sequences that look like markdown links (confirmed against real content:
 * JSON schema pattern strings — same issue check-links.js guards against).
 */
function rewriteRelativeLinks(markdown, { fromDir, toDir }) {
  const parts = markdown.split(new RegExp(`(${FENCED_CODE_BLOCK.source})`, 'g'));
  return parts.map((part, i) => (i % 2 === 1 ? part : rewriteLinksInProse(part, fromDir, toDir))).join('');
}

module.exports = { rewriteRelativeLinks };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/llm-export/test/rewrite-relative-links.test.js`
Expected: PASS (9 tests)

- [ ] **Step 5: Wire it into `generate.js`**

Add the import:

```javascript
const { rewriteRelativeLinks } = require('./lib/rewrite-relative-links');
```

Replace the `llmsFullTxt` construction and the "latest version" root-copy block with:

```javascript
    const llmsTxt = buildLlmsTxt({ siteTitle: SITE_TITLE, summary: SITE_SUMMARY, nav, descriptionsByHref });
    fs.writeFileSync(path.join(versionDir, 'llms.txt'), llmsTxt);

    // Each page's own markdown carries links relative to that page's own
    // directory (e.g. specifications/2.4/security/), but llms-full.txt is a
    // single flat file living at versionDir — relocate each page's links
    // before concatenating, or nearly every link in the assembled file
    // resolves to the wrong place.
    const relocatedPagesByHref = {};
    for (const [href, result] of Object.entries(pagesByHref)) {
      relocatedPagesByHref[href] = {
        ...result,
        markdown: rewriteRelativeLinks(result.markdown, {
          fromDir: path.dirname(result.sourcePath),
          toDir: versionDir,
        }),
      };
    }
    const llmsFullTxt = buildLlmsFullTxt({ pageOrder: nav.pageOrder, pagesByHref: relocatedPagesByHref });
    fs.writeFileSync(path.join(versionDir, 'llms-full.txt'), llmsFullTxt);

    if (path.basename(versionDir) === latest) {
      // llmsTxt/llmsFullTxt above are correct relative to versionDir; moving
      // them up to siteRoot needs the same relocation treatment.
      fs.writeFileSync(
        path.join(siteRoot, 'llms.txt'),
        rewriteRelativeLinks(llmsTxt, { fromDir: versionDir, toDir: siteRoot })
      );
      fs.writeFileSync(
        path.join(siteRoot, 'llms-full.txt'),
        rewriteRelativeLinks(llmsFullTxt, { fromDir: versionDir, toDir: siteRoot })
      );
    }
```

(`buildLlmsTxt`'s own links are already correct without rewriting — its hrefs come straight from nav, already relative to `versionDir`, which is where its `llms.txt` output lives; only the site-root copy of it needs relocation, handled above.)

- [ ] **Step 6: Verify against this repo's real build output**

This is the fix for a bug found by measuring real output, so verify the same way:

```bash
cp -R build/site /tmp/llm-export-relink-check
node scripts/llm-export/generate.js /tmp/llm-export-relink-check
```

Then write a small throwaway verification script (not part of the committed test suite — this is a one-off sanity check, not a regression test) that scans every `llms.txt`/`llms-full.txt` under `/tmp/llm-export-relink-check` for markdown links and confirms each local-relative target resolves to a real file, tallying totals. Confirm the broken-link count drops from the pre-fix baseline (1862 of 2026 links, 92%) to a small residual — every remaining failure should trace back to the same two already-known pre-existing content defects (the `<attestation.adoc>` unresolved xref and the malformed softbinding-algorithms-list markdown-in-prose link), not a new class of failure. If you see broken links that *aren't* one of those two known patterns, stop and report — that would mean the fix has a gap.

```bash
rm -rf /tmp/llm-export-relink-check
```

- [ ] **Step 7: Run the full test suite**

Run: `npm run test:llm-export`
Expected: PASS (all tests across all files, including the 9 new ones)

- [ ] **Step 8: Commit**

```bash
git add scripts/llm-export/lib/rewrite-relative-links.js scripts/llm-export/test/rewrite-relative-links.test.js scripts/llm-export/generate.js
git commit -m "fix(llm-export): relocate relative links when assembling llms-full.txt and copying to site root"
```

---

## Task 13: End-to-end verification against this repo's real build output

**Files:** none (verification only)

- [ ] **Step 1: Run the full unit test suite**

Run: `npm run test:llm-export`
Expected: PASS, all files

- [ ] **Step 2: Run the generator against the actual committed `build/site`**

```bash
cp -R build/site /tmp/llm-export-dry-run
node scripts/llm-export/generate.js /tmp/llm-export-dry-run
```

Expected: prints `llm-export: converted 67 pages, word-count ratio 1.02 (...)`. This exact command (full pipeline, all modules from Tasks 1–12) was run against this repo's actual `build/site` while writing this plan, so these are real, not projected, numbers — re-count with `grep -rl '<article class="doc">' build/site --include='*.html' | wc -l` if the page count has drifted since.

This run also reported 5 broken internal links — **all 5 are real, pre-existing defects in the spec content itself, not pipeline bugs**, confirmed by reading the source HTML directly:
- 4 of them (`ai-ml/ai_ml.html.md` in versions 1.3, 1.4, 2.2, 2.4) point at `<attestation.adoc>` — the *live* rendered HTML already has `href="&lt;attestation.adoc&gt;"` (an unresolved AsciiDoc xref that Antora itself never fixed up), so the markdown mirror is correctly reproducing an already-broken link.
- 1 of them (`1.4/guidance/Guidance.html.md`) points at a garbled `[https://github.com/c2pa-org/softbinding-algorithms-list](https://...` target — the live HTML has literal markdown-link syntax typed directly into the AsciiDoc prose (`[text](url)` inside a `<p>`, not a real AsciiDoc xref/link macro), which Asciidoctor only partially interpreted (autolinking the bare URL) rather than producing a clean link. The mirror faithfully reproduces that same malformed source text.

Neither is something to "fix" in this tool — the link checker doing its job (Task 10's whole purpose) is exactly what surfaced them. Worth flagging to whoever maintains the source content in `specs-core`/`ai-ml`, separately from this plan.

Note: this step only covers `checkLinks`' own per-page-mirror validation (5 known findings, as above). The separate question of whether links *inside* the generated `llms.txt`/`llms-full.txt` files themselves resolve correctly (a distinct bug — links breaking when content is concatenated/relocated to a different directory) was already found, fixed, and independently re-verified three times over in Task 12b, including a from-scratch reproduction of the before/after broken-link counts (1862/2026 → 11/2026). No need to redo that measurement here.

- [ ] **Step 3: Manually inspect a representative sample**

```bash
cat /tmp/llm-export-dry-run/specifications/2.4/llms.txt
head -20 "/tmp/llm-export-dry-run/specifications/2.4/specs/C2PA_Specification.html.md"
grep -c '^> \*\*NOTE:\*\*\|^> \*\*IMPORTANT:\*\*' "/tmp/llm-export-dry-run/specifications/2.4/specs/C2PA_Specification.html.md"
```

Confirm: `llms.txt` has three H2 sections (`Technical Specifications`, `Informative Documents`, `Recommendations` — matching this version's `docs/modules/nav.adoc`) each with a bulleted, described page list; the `C2PA_Specification.html.md` mirror starts with a clean `# Content Credentials : C2PA Technical Specification` heading followed by real body content, and contains `> **NOTE:**` / `> **IMPORTANT:**` blocks.

One real thing you'll notice: right now every page's `llms.txt` description reads "This work is licensed under a Creative Commons Attribution 4.0 International License." — that's not a bug, it's the first-sentence fallback (Task 8) correctly picking up each page's actual first `<p>`, which today happens to be a boilerplate license paragraph, because no page in this repo currently sets AsciiDoc's `:description:` attribute (confirmed: `grep -rl ':description:' docs` returns nothing). This is exactly the fallback behavior the design doc specifies and will self-improve as page authors start adding `:description:` — nothing to fix here either.

- [ ] **Step 4: Revisit the drift threshold with real numbers**

The 1.02 ratio measured above (raw HTML page word count including nav/header/footer chrome vs. markdown word count) is already close enough to 1 that gross truncation isn't a concern for this build. If a future run shows a ratio far below 1 (e.g. under 0.5, the current threshold), that's worth investigating — but no threshold change is needed based on this run.

```bash
rm -rf /tmp/llm-export-dry-run
```

- [ ] **Step 5: Commit** — nothing to commit for this task; it's verification-only.

---

## Task 14: Wire into `buildsite.sh` and `buildsite-local.sh`

**Files:**
- Modify: `buildsite.sh`
- Modify: `buildsite-local.sh`

Runs the export tool in its own throwaway Node container right after the existing Antora container finishes, so Node never becomes a host prerequisite (matching this repo's current all-Docker workflow — see Design Notes above).

- [ ] **Step 1: Modify `buildsite.sh`**

```bash
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
```

- [ ] **Step 2: Modify `buildsite-local.sh`** with the same second `docker run` block appended (this script otherwise stays identical, using `antora-playbook-local.yml` for the first run as it already does).

- [ ] **Step 3: Run the full local build to verify the wiring**

Run: `./buildsite-local.sh`
Expected: Antora build completes as before, then the Node container installs deps and prints `llm-export: converted N pages, word-count ratio ...` with no errors; `build/site/specifications/2.4/llms.txt`, `.../llms-full.txt`, and `.html.md` mirrors now exist alongside the `.html` files; `build/site/llms.txt` and `build/site/llms-full.txt` exist at the site root too.

- [ ] **Step 4: Commit**

```bash
git add buildsite.sh buildsite-local.sh
git commit -m "feat(llm-export): run export pipeline as post-build step in buildsite scripts"
```

---

## Task 15: Commit the newly-generated build output

**Files:**
- Modify: `build/` (new `.md`, `llms.txt`, `llms-full.txt` files — `build/` is already tracked in this repo, per its existing manual-build-then-commit workflow)

- [ ] **Step 1: Confirm `build/site` is up to date from Task 14's real run** (not the `/tmp` dry run)

```bash
git status build/
```

Expected: many new untracked `*.html.md` files, plus new `llms.txt` / `llms-full.txt` files, under `build/site/`.

- [ ] **Step 2: Commit — excluding any unmerged path**

**Do not run a bare `git add build/`** if `git status` shows any unmerged (`UU`) paths anywhere under `build/` — verified directly: `git add build/` stages an unmerged file's *current working-tree content* as its conflict resolution, silently overwriting whatever conflict state existed there with no confirmation. If this repo has any unrelated in-progress merge conflict under `build/` when you run this step (check `git status --porcelain build/ | grep '^UU'` first), scope both the add *and* the commit to exclude it — a plain `git commit` (no pathspec) refuses unconditionally as soon as *any* path anywhere in the whole index is unmerged, even if you only staged unrelated files; only a pathspec-scoped `git commit -- <paths>` will actually go through:

```bash
git status --porcelain build/ | awk '$1=="??"{print $2}' > /tmp/llm-export-new-files.txt
git add -- $(cat /tmp/llm-export-new-files.txt)
cat /tmp/llm-export-new-files.txt | xargs git commit -m "build: add llms.txt/llms-full.txt and per-page markdown mirrors to published site" --
rm -f /tmp/llm-export-new-files.txt
```

(`git status --porcelain`'s `??` marker means untracked — i.e. only the new files this task actually generated, never touching any pre-existing tracked or unmerged path. Piping the file list through `xargs` rather than a shell variable/array avoids word-splitting pitfalls that differ between bash and zsh with a large, multi-line file list — confirmed directly: a naive `-- $VAR` with an unquoted multi-line variable was misinterpreted as a single pathspec argument and failed with `error: pathspec '...' did not match any files`.) Verify immediately after both the `git add` and the `git commit` that `git status --porcelain build/ | grep '^UU'` still shows exactly the same unmerged files as before, unchanged. If `git status --porcelain build/` shows no `UU` lines at all, a plain `git add build/ && git commit -m "..."` is fine.

---

## Follow-ups (explicitly out of scope for this plan)

- **Reactivating CI publishing.** `.github/workflows/publish.yml`'s actual Antora build step is currently commented out ("automated publishing takes too long"); this plan's `npm run llm-export` step only runs where `buildsite.sh`/`buildsite-local.sh` already run (a maintainer's machine, today). Wiring `llm-export` into CI is contingent on that unrelated, pre-existing gap being closed first — not something to bundle into this change.
- **Word-count drift threshold tuning.** Task 13 Step 4 covers an initial pass with real data; if the export pipeline's page mix changes significantly later (e.g. a component with unusually chrome-heavy pages), revisit the threshold or switch to comparing against `extractArticle`'s stripped text as the baseline.
- **`softbinding-alg-list` and other non-Antora-page content** (e.g. `crjson`/`core`/`latest` redirect stubs) are intentionally excluded from the export by the `article.doc` discovery rule — they have no meaningful prose to export as markdown.

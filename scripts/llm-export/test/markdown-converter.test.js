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

test('does not let a nested table (e.g. an admonition inside a cell) leak rows into the outer table', () => {
  // node.querySelectorAll('tr') would previously pull in every descendant
  // <tr>, including the inner table's own row, corrupting the outer
  // table's column count. The outer table here has exactly one row with
  // two cells (one of which contains a whole nested table); that nested
  // row must never become a second row of the outer table.
  const html = `<table><tr><td><table><tr><td>inner</td></tr></table></td><td>outer2</td></tr></table>`;
  const md = htmlToMarkdown(html).trim();
  const lines = md.split('\n');
  // Outer table: a header row and a separator row only — no extra body
  // row contributed by the inner table's <tr>.
  assert.equal(lines.length, 2);
  // The separator row is the unambiguous signal for column count (the
  // header row's own cell text may itself contain escaped "|" characters
  // from the nested table's markdown, e.g. "\| inner \|"). It must reflect
  // the outer table's own two columns, not some mismatched count from the
  // inner table's single-column row leaking in.
  assert.equal(lines[1], '| --- | --- |');
  assert.ok(lines[0].includes('outer2'));
  assert.ok(lines[0].includes('inner'));
});

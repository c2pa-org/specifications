const { test } = require('node:test');
const assert = require('node:assert/strict');
const { compactArticle } = require('../lib/compact-article');
const { htmlToMarkdown } = require('../lib/markdown-converter');

function convert(html) {
  return htmlToMarkdown(compactArticle(html, {
    sourceName: 'C2PA_Specification.html',
    schemaArchive: '_attachments/C2PA_Schemas.zip',
  }));
}

test('links CDDL listings to the existing schema archive, retaining captions and anchors', () => {
  const md = convert(`<div class="sect1"><h2 id="claims">Claims</h2>
    <div class="listingblock" id="claim-schema"><div class="title">Claim CDDL</div>
    <div class="content"><pre><code data-lang="cddl">claim-map = { "id": tstr }</code></pre></div></div></div>`);
  assert.ok(md.includes('[CDDL schema archive](_attachments/C2PA_Schemas.zip)'));
  assert.ok(md.includes('Claim CDDL'));
  assert.ok(md.includes('<a id="claim-schema"></a>'));
  assert.ok(!md.includes('claim-map ='));
  assert.ok(!md.includes('```'));
});

test('links unlabelled CBOR diagnostic examples, including leading comments, to the source HTML', () => {
  const md = convert(`<div class="sect2"><h3 id="examples">Examples</h3>
    <pre><code>// example\n{ "hash": h'00' }</code></pre>
    <pre><code data-lang="cbordiag">[1, 2]</code></pre>
    <pre><code class="language-cbor-diag">32("https://example.com")</code></pre></div>`);
  assert.equal((md.match(/\[CBOR diagnostic example\]\(C2PA_Specification.html#examples\)/g) || []).length, 3);
  assert.ok(!md.includes('```'));
  assert.ok(!md.includes("h'00'"));
});

test('links historically JSON-labelled CBOR examples, including a follow-on example', () => {
  const md = convert(`<div class="sect2"><h3 id="examples">Examples</h3>
    <p>A basic example in CBOR Diagnostic Format (.cbordiag):</p>
    <div class="listingblock"><div class="content"><pre><code data-lang="json">{ "name": "Example" }</code></pre></div></div>
    <p>This extended example demonstrates optional fields as well:</p>
    <div class="listingblock"><div class="content"><pre><code data-lang="json">{ "name": "Extended example" }</code></pre></div></div>
    </div>`);
  assert.equal((md.match(/\[CBOR diagnostic example\]/g) || []).length, 2);
  assert.ok(!md.includes('```'));
});

test('preserves pseudocode, ABNF, labelled JSON, and unlabelled JSON Schema and JSON examples', () => {
  const md = convert(`<div class="sect2"><h3 id="hashing">Hashing</h3>
    <pre><code>offset = 0\nWhile (offset &lt; length) hash(offset)</code></pre>
    <pre class="highlightjs highlight"><code class="language-abnf hljs" data-lang="abnf">label = "c2pa"</code></pre>
    <pre class="highlightjs highlight"><code class="language-json hljs" data-lang="json">{ "name": "JSON example" }</code></pre>
    <p>The JSON schema is shown below:</p>
    <pre><code>{ "$schema": "https://json-schema.org/draft/2020-12/schema" }</code></pre>
    <p>A JSON example is shown below:</p><pre><code>[{ "identifier": 1 }]</code></pre></div>`);
  assert.ok(md.includes('While (offset < length)'));
  assert.ok(md.includes('```abnf'));
  assert.ok(md.includes('```json'));
  assert.ok(md.includes('"$schema"'));
  assert.ok(md.includes('"identifier"'));
});

test('removes reading guides and history by stable anchor, preserving adjacent technical sections', () => {
  const md = convert(`<div class="sect1"><h2 id="_introduction">Introduction</h2>
    <p>Keep this overview.</p>
    <div class="sect2"><h3 id="_how_to_read_this_specification">How to Read This Specification</h3><p>Reading advice.</p></div>
    <div class="sect2"><h3 id="_claim_generators">Claim Generators</h3><h4 id="read-first">Read first</h4><p>Reading list.</p></div>
    <div class="sect2"><h3 id="_validators">Validators</h3><p>Validator reading list.</p></div>
    <div class="sect2"><h3 id="_security_reviewers">Security Reviewers</h3><p>Security reading list.</p></div>
    </div>
    <div class="sect1"><h2 id="_claims">Claims</h2><p>Technical requirements remain.</p>
    <p>See <a href="#read-first">reading advice</a> and <a href="#_claims">claims</a>.</p></div>
    <div class="sect1"><h2 id="version_history">Version History</h2><h3 id="v25">2.5</h3><p>Old changes.</p></div>
    <div class="sect1"><h2 id="_versioning">Versioning</h2><p>Keep compatibility rules.</p>
    <div class="sect2"><h3 id="_version_history">Version History</h3><p>History pointer.</p></div></div>`);
  assert.ok(!md.includes('Reading list.'));
  assert.ok(!md.includes('Reading advice.'));
  assert.ok(!md.includes('Version History'));
  assert.ok(!md.includes('Old changes.'));
  assert.ok(md.includes('Technical requirements remain.'));
  assert.ok(md.includes('Keep compatibility rules.'));
  assert.ok(md.includes('[reading advice](C2PA_Specification.html#read-first)'));
  assert.ok(md.includes('[claims](#_claims)'));
  assert.ok(!md.includes('<a id="read-first"></a>'));
});

test('links CDDL to original HTML when an older version has no schema archive', () => {
  const md = htmlToMarkdown(compactArticle('<div class="sect1"><h2 id="schema">Schema</h2><pre><code data-lang="cddl">x = tstr</code></pre></div>', {
    sourceName: 'C2PA_Specification.html',
  }));
  assert.ok(md.includes('[CDDL schema](C2PA_Specification.html#schema)'));
  assert.ok(!md.includes('x = tstr'));
});

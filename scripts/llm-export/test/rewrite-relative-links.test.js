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

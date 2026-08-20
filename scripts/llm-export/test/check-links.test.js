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
  // Real content hits this: a JSON schema "pattern" string like
  // "^[A-Za-z]{2,63}(?:\\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+\\.?$"
  // contains "[A-Za-z0-9](?:" — a "]" immediately followed by "(" — which
  // MARKDOWN_LINK's regex would otherwise misread as a link with target
  // "?:[A-Za-z0-9-]*[A-Za-z0-9]" if not inside a fenced code block.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-export-links-code-'));
  fs.writeFileSync(
    path.join(root, 'a.html.md'),
    '```json\n"pattern": "^[A-Za-z]{2,63}(?:\\\\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+\\\\.?$"\n```\n'
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

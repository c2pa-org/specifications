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

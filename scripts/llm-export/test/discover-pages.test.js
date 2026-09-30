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

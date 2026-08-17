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

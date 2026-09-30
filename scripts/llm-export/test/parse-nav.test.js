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

test('parseNav collects nested child pages under an ungrouped top-level link', () => {
  // nav.adoc allows a top-level entry to be both a page link and the parent
  // of a nested list of child pages, e.g.:
  //   * xref:parent.adoc[Parent]
  //   ** xref:child.adoc[Child]
  // With no .nav-text category label present, this should still land in the
  // fallback "Pages" category, and the child link must not be dropped.
  const flatHtmlWithChild = `
    <nav class="nav-menu">
      <ul class="nav-list"><li class="nav-item" data-depth="0">
        <ul class="nav-list"><li class="nav-item" data-depth="1">
          <a class="nav-link" href="parent.html">Parent</a>
          <ul class="nav-list"><li class="nav-item" data-depth="2">
            <a class="nav-link" href="child.html">Child</a>
          </li></ul>
        </li></ul>
      </li></ul>
    </nav>`;
  const nav = parseNav(flatHtmlWithChild);
  assert.deepEqual(nav.categories.map((c) => c.label), ['Pages']);
  assert.deepEqual(nav.categories[0].pages, [
    { title: 'Parent', href: 'parent.html' },
    { title: 'Child', href: 'child.html' },
  ]);
  assert.deepEqual(nav.pageOrder, ['parent.html', 'child.html']);
});

test('parseNav throws when the page has no nav.nav-menu node', () => {
  assert.throws(() => parseNav('<html><body>no nav here</body></html>'), {
    message: 'parseNav: page has no nav.nav-menu node',
  });
});

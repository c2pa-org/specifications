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

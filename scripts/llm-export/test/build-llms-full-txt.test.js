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

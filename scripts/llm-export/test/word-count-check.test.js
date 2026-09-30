const { test } = require('node:test');
const assert = require('node:assert/strict');
const { checkWordCountDrift } = require('../lib/word-count-check');

test('checkWordCountDrift passes when markdown word count is close to source html text', () => {
  const pages = [
    { sourceText: 'one two three four five six seven eight nine ten', markdown: 'one two three four five six seven eight nine' },
  ];
  const result = checkWordCountDrift(pages, 0.9);
  assert.equal(result.ok, true);
  assert.equal(result.htmlWords, 10);
  assert.equal(result.mdWords, 9);
});

test('checkWordCountDrift fails when markdown lost too much content', () => {
  const pages = [
    { sourceText: 'one two three four five six seven eight nine ten', markdown: 'one two three' },
  ];
  const result = checkWordCountDrift(pages, 0.9);
  assert.equal(result.ok, false);
  assert.ok(result.ratio < 0.9);
});

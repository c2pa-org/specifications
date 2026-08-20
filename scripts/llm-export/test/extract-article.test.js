// scripts/llm-export/test/extract-article.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { extractArticle, firstSentence } = require('../lib/extract-article');

const fixture = fs.readFileSync(path.join(__dirname, 'fixtures/content-page.html'), 'utf8');

test('extractArticle pulls the h1 title', () => {
  const { title } = extractArticle(fixture);
  assert.equal(title, 'Content Credentials : C2PA Technical Specification');
});

test('extractArticle excludes chrome outside article.doc', () => {
  const { contentHtml } = extractArticle(fixture);
  assert.ok(!contentHtml.includes('navbar chrome'));
  assert.ok(!contentHtml.includes('toolbar chrome'));
  assert.ok(!contentHtml.includes('breadcrumb chrome'));
  assert.ok(!contentHtml.includes('footer chrome'));
});

test('extractArticle strips the in-page table of contents', () => {
  const { contentHtml } = extractArticle(fixture);
  assert.ok(!contentHtml.includes('id="toc"'));
  assert.ok(!contentHtml.includes('Table of Contents'));
});

test('extractArticle keeps real body content', () => {
  const { contentHtml } = extractArticle(fixture);
  assert.ok(contentHtml.includes('establish provenance'));
});

test('extractArticle throws on a page with no article.doc', () => {
  const redirectHtml = fs.readFileSync(path.join(__dirname, 'fixtures/redirect-stub.html'), 'utf8');
  assert.throws(() => extractArticle(redirectHtml), /no article\.doc/i);
});

test('extractArticle uses <meta name="description"> when present', () => {
  const html = fixture.replace(
    '<title>Content Credentials : C2PA Technical Specification :: C2PA Specifications</title>',
    '<title>Content Credentials : C2PA Technical Specification :: C2PA Specifications</title>\n<meta name="description" content="A curated one-liner from :description:.">'
  );
  const { description } = extractArticle(html);
  assert.equal(description, 'A curated one-liner from :description:.');
});

test('extractArticle falls back to the first sentence of body text when no meta description exists', () => {
  const { description } = extractArticle(fixture);
  assert.equal(description, 'C2PA defines a way to establish provenance for digital content.');
});

test('firstSentence does not truncate on a mid-sentence "e.g." abbreviation', () => {
  const result = firstSentence('This uses e.g. an abbreviation before continuing the sentence.');
  assert.equal(result, 'This uses e.g. an abbreviation before continuing the sentence.');
});

test('firstSentence does not truncate on a mid-sentence "U.S." abbreviation, and still stops at the real sentence boundary', () => {
  const result = firstSentence('The U.S. government issued guidance. This is the second sentence.');
  assert.equal(result, 'The U.S. government issued guidance.');
});

test('firstSentence still returns the whole text for the existing single-sentence, no-abbreviation case', () => {
  const result = firstSentence('C2PA defines a way to establish provenance for digital content.');
  assert.equal(result, 'C2PA defines a way to establish provenance for digital content.');
});

test('extractArticle falls back to the full first sentence (not truncated at an abbreviation) when the body\'s first paragraph contains one', () => {
  const html = fixture.replace(
    '<p>C2PA defines a way to establish provenance for digital content.</p>',
    '<p>This uses e.g. an abbreviation before continuing the sentence. This is the second sentence.</p>'
  );
  const { description } = extractArticle(html);
  assert.equal(description, 'This uses e.g. an abbreviation before continuing the sentence.');
});

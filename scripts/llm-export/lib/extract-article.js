// scripts/llm-export/lib/extract-article.js
const { createDocument } = require('@mixmark-io/domino');

/**
 * Pulls the <article class="doc"> subtree out of a full rendered page,
 * dropping the in-page "Table of Contents" block (id="toc") since it's
 * redundant chrome once the markdown itself carries real headings.
 *
 * Uses @mixmark-io/domino's createDocument(html) directly — this package
 * has no DOMParser; createDocument is the API turndown itself uses
 * internally (confirmed by reading node_modules/turndown/lib/turndown.cjs.js
 * and by running createDocument against a real page fixture).
 */
function extractArticle(html) {
  const doc = createDocument(html);
  const article = doc.querySelector('article.doc');
  if (!article) {
    throw new Error('extractArticle: page has no article.doc node');
  }

  const titleNode = article.querySelector('h1.page');
  const title = titleNode ? titleNode.textContent.trim() : '';

  const toc = article.querySelector('#toc');
  if (toc) toc.parentNode.removeChild(toc);

  if (titleNode) titleNode.parentNode.removeChild(titleNode);

  return { title, contentHtml: article.innerHTML };
}

module.exports = { extractArticle };

// scripts/llm-export/lib/extract-article.js
const { createDocument } = require('@mixmark-io/domino');

function firstSentence(text) {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  const match = trimmed.match(/^.*?[.!?](?=\s|$)/);
  return match ? match[0] : trimmed;
}

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

  const metaDescription = doc.querySelector('meta[name="description"]');
  let description;
  if (metaDescription) {
    description = metaDescription.getAttribute('content').trim();
  } else {
    const firstParagraph = article.querySelector('p');
    description = firstParagraph ? firstSentence(firstParagraph.textContent) : '';
  }

  return { title, contentHtml: article.innerHTML, description };
}

module.exports = { extractArticle };

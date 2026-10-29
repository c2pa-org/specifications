const { createDocument } = require('@mixmark-io/domino');

const READING_GUIDE_IDS = new Set([
  '_how_to_read_this_specification',
  '_claim_generators',
  '_validators',
  '_security_reviewers',
]);

function sourceLink(doc, href, label) {
  const link = doc.createElement('a');
  link.setAttribute('href', href);
  link.setAttribute('data-llm-source-link', 'true');
  link.textContent = label;
  return link;
}

function sectionAnchor(node) {
  for (let parent = node.parentNode; parent; parent = parent.parentNode) {
    if (parent.id) return parent.id;
    const heading = Array.from(parent.children || []).find((child) => /^H[1-6]$/.test(child.nodeName));
    if (heading && heading.id) return heading.id;
  }
  return '';
}

function isCborExample(code, lang) {
  if (['cbordiag', 'cbor-diag', 'cbor'].includes(lang)) return true;
  if (lang && !['none', 'json'].includes(lang)) return false;

  const text = code.textContent.replace(/^\s*\/\/[^\n]*(?:\n|$)/gm, '').trim();
  if (!/^[{\[]/.test(text) || /"\$schema"\s*:/.test(text)) return false;

  let block = code.parentNode;
  while (block.parentNode && !/\blistingblock\b/.test(block.getAttribute('class') || '') &&
    !/\bsect\d\b/.test(block.parentNode.getAttribute?.('class') || '')) {
    block = block.parentNode;
  }
  const context = block.previousElementSibling?.textContent || '';
  if (/\bJSON (?:example|schema)\b/i.test(context)) return false;
  if (lang === 'json') {
    // Older releases mark diagnostic examples as JSON; their surrounding prose identifies them.
    for (let previous = block.previousElementSibling; previous; previous = previous.previousElementSibling) {
      if (/^H[1-6]$/.test(previous.nodeName)) break;
      if (previous.nodeName === 'PRE' || previous.querySelector('pre')) continue;
      if (/\bCBOR(?:[- ]Diag|\s+diagnostic)/i.test(previous.textContent)) return true;
    }
    return false;
  }
  return true;
}

function compactArticle(contentHtml, { sourceName, schemaArchive }) {
  const doc = createDocument(`<html><body>${contentHtml}</body></html>`);
  const body = doc.body;
  const removedIds = new Set();

  for (const heading of Array.from(body.querySelectorAll('h2, h3, h4, h5, h6'))) {
    if (!READING_GUIDE_IDS.has(heading.id) && !/^_?version_history(?:_\d+)?$/.test(heading.id)) continue;
    const section = heading.parentNode;
    if (!section || !/\bsect\d\b/.test(section.getAttribute('class') || '')) {
      throw new Error(`compactArticle: cannot locate section containing ${heading.id}`);
    }
    for (const node of Array.from(section.querySelectorAll('[id]'))) removedIds.add(node.id);
    if (section.id) removedIds.add(section.id);
    section.parentNode.removeChild(section);
  }

  for (const link of Array.from(body.querySelectorAll('a[href]'))) {
    const href = link.getAttribute('href');
    if (href.startsWith('#') && removedIds.has(href.slice(1))) {
      link.setAttribute('href', `${sourceName}${href}`);
      link.setAttribute('data-llm-source-link', 'true');
    }
  }

  for (const code of Array.from(body.querySelectorAll('pre code'))) {
    const lang = code.getAttribute('data-lang') ||
      (code.getAttribute('class') || '').match(/\blanguage-([\w-]+)/)?.[1];
    let link;
    if (lang === 'cddl') {
      const anchor = sectionAnchor(code);
      link = schemaArchive
        ? sourceLink(doc, schemaArchive, 'CDDL schema archive')
        : sourceLink(doc, `${sourceName}${anchor ? `#${anchor}` : ''}`, 'CDDL schema');
    } else if (isCborExample(code, lang)) {
      const anchor = sectionAnchor(code);
      link = sourceLink(doc, `${sourceName}${anchor ? `#${anchor}` : ''}`, 'CBOR diagnostic example');
    } else {
      continue;
    }
    const pre = code.parentNode;
    const paragraph = doc.createElement('p');
    if (pre.id || code.id) paragraph.id = pre.id || code.id;
    paragraph.appendChild(link);
    pre.parentNode.replaceChild(paragraph, pre);
  }

  // Markdown has no general element IDs; retain non-heading targets for existing cross-references.
  for (const node of Array.from(body.querySelectorAll('[id]'))) {
    if (/^(H[1-6]|A)$/.test(node.nodeName)) continue;
    const anchor = doc.createElement('a');
    anchor.id = node.id;
    node.parentNode.insertBefore(anchor, node);
    node.removeAttribute('id');
  }
  return body.innerHTML;
}

module.exports = { compactArticle };

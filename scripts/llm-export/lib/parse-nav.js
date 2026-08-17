// scripts/llm-export/lib/parse-nav.js
const { createDocument } = require('@mixmark-io/domino');

/**
 * @mixmark-io/domino has no DOMParser (see extract-article.js) and its Zest
 * selector engine silently returns zero matches for `:scope`-based queries
 * (verified directly: `el.querySelectorAll(':scope > li')` returns an empty
 * list on a real element with matching children, no error thrown) and
 * throws on a leading `>` combinator. So "direct child of this specific
 * element" has to be done by walking `.children` instead of any selector
 * that implies scoping to a context node.
 */
function directChildren(el, tagName) {
  return Array.from(el.children).filter((c) => c.tagName === tagName);
}

function directChild(el, tagName, className) {
  return directChildren(el, tagName).find((c) => {
    if (!className) return true;
    return (c.getAttribute('class') || '').split(/\s+/).includes(className);
  });
}

/**
 * Antora's rendered nav sidebar is the one place the site already carries
 * fully-resolved page order, titles, and grouping for a version — it's the
 * same source nav.adoc compiled after all cross-component xrefs resolved.
 * Rather than re-parsing nav.adoc (unavailable here; we only have HTML
 * output) or hardcoding this site's current category names, walk the
 * rendered tree generically: a depth=1 item with a .nav-text (not a link)
 * is a category heading; everything under it, at any deeper depth, is a
 * page in that category, in document order.
 */
function parseNav(pageHtml) {
  const doc = createDocument(pageHtml);
  const menu = doc.querySelector('nav.nav-menu');
  if (!menu) {
    return { categories: [], pageOrder: [] };
  }

  // Descendant queries with no leading combinator (no `:scope`, no `>`)
  // work fine on domino — only context-relative combinators are broken.
  const depth0 = menu.querySelector('li.nav-item[data-depth="0"]');
  const topUl = depth0 ? directChild(depth0, 'UL') : null;
  const topLevelItems = topUl ? directChildren(topUl, 'LI') : [];

  const categories = [];
  const pageOrder = [];
  let ungrouped = null;

  for (const item of topLevelItems) {
    const label = directChild(item, 'SPAN', 'nav-text');
    const directLink = directChild(item, 'A', 'nav-link');

    if (label) {
      const pages = Array.from(item.querySelectorAll('a.nav-link')).map((a) => ({
        title: a.textContent.trim(),
        href: a.getAttribute('href'),
      }));
      categories.push({ label: label.textContent.trim(), pages });
      pages.forEach((p) => pageOrder.push(p.href));
    } else if (directLink) {
      if (!ungrouped) {
        ungrouped = { label: 'Pages', pages: [] };
        categories.push(ungrouped);
      }
      ungrouped.pages.push({ title: directLink.textContent.trim(), href: directLink.getAttribute('href') });
      pageOrder.push(directLink.getAttribute('href'));
    }
  }

  return { categories, pageOrder };
}

module.exports = { parseNav };

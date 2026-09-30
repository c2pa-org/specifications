// Mirrors the `.html` -> `.html.md` rewrite in markdown-converter.js's
// `rewrite-internal-html-links` rule, but applies unconditionally (no guard)
// because nav sidebar hrefs are always internal `.html` pages by construction.
// If that invariant ever changes, this will need the same guard logic
// (INTERNAL_HTML_LINK / SAME_SITE_ABSOLUTE_HTML_LINK checks) as that rule.
function toMirrorHref(href) {
  return href.replace(/\.html(#|$)/, '.html.md$1');
}

function buildLlmsTxt({ siteTitle, summary, nav, descriptionsByHref }) {
  const lines = [`# ${siteTitle}`, '', `> ${summary}`, ''];

  for (const category of nav.categories) {
    lines.push(`## ${category.label}`, '');
    for (const page of category.pages) {
      const description = descriptionsByHref[page.href];
      const suffix = description ? `: ${description}` : '';
      lines.push(`- [${page.title}](${toMirrorHref(page.href)})${suffix}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

module.exports = { buildLlmsTxt };

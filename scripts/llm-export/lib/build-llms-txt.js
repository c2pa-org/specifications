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

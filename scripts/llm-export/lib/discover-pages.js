const fs = require('node:fs');
const path = require('node:path');

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * A page is real content, not a redirect stub or UI shell, iff it contains
 * an <article class="doc"> node — verified against the current build/site
 * output, where that's exactly the boundary between the 7 non-content files
 * and every real page.
 */
function discoverPages(siteRoot) {
  const allHtml = walk(siteRoot, []);
  return allHtml.filter((file) => {
    const html = fs.readFileSync(file, 'utf8');
    return /<article\s+class="doc">/.test(html);
  });
}

module.exports = { discoverPages };

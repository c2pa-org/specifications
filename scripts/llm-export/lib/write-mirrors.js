const fs = require('node:fs');
const { discoverPages } = require('./discover-pages');
const { extractArticle } = require('./extract-article');
const { htmlToMarkdown } = require('./markdown-converter');

/**
 * Converts every content page under siteRoot and writes its markdown
 * mirror as a `.md`-suffixed sibling of the source .html file. Returns
 * per-page metadata so callers (llms.txt/llms-full.txt builders) don't
 * need to re-walk or re-parse anything.
 */
function writeMirrors(siteRoot) {
  const pages = discoverPages(siteRoot);
  return pages.map((sourcePath) => {
    const html = fs.readFileSync(sourcePath, 'utf8');
    const { title, contentHtml, description } = extractArticle(html);
    const body = htmlToMarkdown(contentHtml).trim();
    const markdown = `# ${title}\n\n${body}\n`;

    const mirrorPath = `${sourcePath}.md`;
    fs.writeFileSync(mirrorPath, markdown);

    return { sourcePath, mirrorPath, title, description, markdown };
  });
}

module.exports = { writeMirrors };

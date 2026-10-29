const fs = require('node:fs');
const path = require('node:path');
const { createDocument } = require('@mixmark-io/domino');
const { discoverPages } = require('./discover-pages');
const { extractArticle } = require('./extract-article');
const { htmlToMarkdown } = require('./markdown-converter');
const { compactArticle } = require('./compact-article');

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
    const { title, contentHtml: extractedHtml, description } = extractArticle(html);
    let contentHtml = extractedHtml;
    if (path.basename(sourcePath) === 'C2PA_Specification.html') {
      const archive = '_attachments/C2PA_Schemas.zip';
      const hasArchive = fs.existsSync(path.join(path.dirname(sourcePath), archive));
      if (!hasArchive && /\blanguage-cddl\b|\bdata-lang=["']cddl["']/.test(contentHtml)) {
        console.warn(`llm-export: no schema archive for ${sourcePath}; linking CDDL to original HTML sections`);
      }
      contentHtml = compactArticle(contentHtml, {
        sourceName: path.basename(sourcePath),
        schemaArchive: hasArchive ? archive : undefined,
      });
    }
    const body = htmlToMarkdown(contentHtml).trim();
    const markdown = `# ${title}\n\n${body}\n`;

    const mirrorPath = `${sourcePath}.md`;
    fs.writeFileSync(mirrorPath, markdown);

    const sourceText = createDocument(contentHtml).body.textContent;
    return { sourcePath, mirrorPath, title, description, markdown, sourceText };
  });
}

module.exports = { writeMirrors };

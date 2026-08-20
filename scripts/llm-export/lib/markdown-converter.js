// scripts/llm-export/lib/markdown-converter.js
const TurndownService = require('turndown');
const { strikethrough, taskListItems, highlightedCodeBlock } = require('turndown-plugin-gfm');

const INTERNAL_HTML_LINK = /^(?!\w+:)(?!\/\/)[^"'#]*\.html(#.*)?$/;
const SAME_SITE_ABSOLUTE_HTML_LINK = /^https:\/\/spec\.c2pa\.org\/.*\.html(#.*)?$/;

// `node.querySelectorAll('tr')` returns every descendant <tr>, including
// rows belonging to a nested <table> (e.g. an admonition — which also
// renders as a <table> — sitting inside a cell). That mixes an inner
// table's rows into the outer table's row list, corrupting the outer
// table's column count silently. Walk only this table's own thead/tbody/
// tfoot/tr children instead, so a nested table's rows are never included.
function directRows(table) {
  const rows = [];
  for (const child of Array.from(table.children)) {
    if (child.nodeName === 'TR') {
      rows.push(child);
    } else if (['THEAD', 'TBODY', 'TFOOT'].includes(child.nodeName)) {
      rows.push(...Array.from(child.children).filter((c) => c.nodeName === 'TR'));
    }
  }
  return rows;
}

function createConverter() {
  const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  // Deliberately not using turndown-plugin-gfm's bundled `gfm` (which
  // includes its own `tables` rule) — see the tableblock-table rule below
  // for why. Only its unrelated strikethrough/task-list/code-block rules
  // are used here.
  td.use([strikethrough, taskListItems, highlightedCodeBlock]);

  // Antora already generated stable heading ids (used by #_anchor fragments
  // across pages). CommonMark headings carry no id and a viewer's slugger
  // won't reproduce Antora's ids from heading text, so emit a raw anchor
  // (CommonMark passes inline HTML through) immediately before the heading.
  td.addRule('heading-with-id', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement(content, node) {
      const level = Number(node.nodeName.charAt(1));
      const id = node.getAttribute('id');
      const anchor = id ? `<a id="${id}"></a>\n` : '';
      return `\n\n${anchor}${'#'.repeat(level)} ${content}\n\n`;
    },
  });

  // AsciiDoc admonitions (NOTE/IMPORTANT/WARNING/TIP/CAUTION) render as
  // div.admonitionblock <kind>; turn them into a labeled blockquote so the
  // kind survives in plain markdown.
  td.addRule('admonition', {
    filter: (node) =>
      node.nodeName === 'DIV' && /\badmonitionblock\b/.test(node.getAttribute('class') || ''),
    replacement(content, node) {
      const match = (node.getAttribute('class') || '').match(/admonitionblock\s+(\w+)/);
      const kind = match ? match[1].toUpperCase() : 'NOTE';
      const contentCell = node.querySelector('td.content');
      const inner = td.turndown(contentCell ? contentCell.innerHTML : content).trim();
      const quoted = inner
        .split('\n')
        .map((line) => (line ? `> ${line}` : '>'))
        .join('\n');
      return `\n\n> **${kind}:**\n${quoted}\n\n`;
    },
  });

  // Unwrap <p class="tableblock"> inside cells before the table rule below
  // renders that cell's own converted content, so cells stay on one line
  // instead of getting stray blank lines from the paragraph's default
  // block-level spacing.
  td.addRule('tableblock-cell-paragraph', {
    filter: (node) => node.nodeName === 'P' && node.parentNode && node.parentNode.nodeName === 'TD',
    replacement: (content) => content,
  });

  // Antora tables sometimes have a real <thead>/<th> header row, and
  // sometimes (when the AsciiDoc source table doesn't set
  // options="header") have no <thead> at all — the visual "header" is just
  // a plain <tr> of <td>s that happens to be the first row of <tbody>.
  // turndown-plugin-gfm's own table rule only converts a table when it
  // detects a genuine header row and otherwise dumps the raw <table> HTML
  // verbatim (via its internal `keep()`) — confirmed by running it
  // directly against this site's real output: 18 of 67 pages and 75
  // separate tables (e.g. "Table 8. List of pre-defined actions" in
  // build/site/specifications/2.4/specs/C2PA_Specification.html) have no
  // <thead> and would otherwise land as multi-hundred-line raw HTML blobs
  // in the markdown mirror. So this tool doesn't use turndown-plugin-gfm's
  // table rule at all and instead converts every <table> itself, always
  // treating the first row as the header — markdown tables have no
  // headerless form anyway, so this loses nothing real tables had.
  td.addRule('tableblock-table', {
    filter: (node) => node.nodeName === 'TABLE',
    replacement(content, node) {
      const rows = directRows(node);
      if (rows.length === 0) return '';

      const cellsOf = (row) => Array.from(row.children).filter((c) => c.nodeName === 'TD' || c.nodeName === 'TH');
      const cellText = (cell) =>
        td
          .turndown(cell.innerHTML)
          .replace(/\|/g, '\\|')
          .replace(/\r?\n+/g, ' ')
          .trim();

      const [headerRow, ...bodyRows] = rows;
      const headerCells = cellsOf(headerRow).map(cellText);
      const lines = [
        `| ${headerCells.join(' | ')} |`,
        `| ${headerCells.map(() => '---').join(' | ')} |`,
        ...bodyRows.map((row) => `| ${cellsOf(row).map(cellText).join(' | ')} |`),
      ];

      // Rebuilding the table from raw <tr> DOM nodes (rather than using the
      // already bottom-up-converted `content`) means a <caption> child
      // never gets a chance to contribute through the normal content flow;
      // render it explicitly instead.
      const caption = node.querySelector('caption');
      const captionMd = caption ? `**${td.turndown(caption.innerHTML).trim()}**\n\n` : '';

      return `\n\n${captionMd}${lines.join('\n')}\n\n`;
    },
  });

  // Diagrams (e.g. Kroki/PlantUML SVGs) degrade to alt text; with no alt
  // text there's nothing text-only consumers can use, so say so explicitly.
  td.addRule('image-alt-or-placeholder', {
    filter: 'img',
    replacement(content, node) {
      const alt = (node.getAttribute('alt') || '').trim();
      return alt ? `![${alt}](${node.getAttribute('src')})` : '[Diagram omitted]';
    },
  });

  // Rewrite links that point at another page on this site so they resolve
  // to that page's markdown mirror instead of its HTML. Same-page anchors,
  // non-html assets (PDFs, images, zips), and links to other sites are left
  // untouched.
  td.addRule('rewrite-internal-html-links', {
    filter: (node) => node.nodeName === 'A' && !!node.getAttribute('href'),
    replacement(content, node) {
      let href = node.getAttribute('href');
      if (INTERNAL_HTML_LINK.test(href) || SAME_SITE_ABSOLUTE_HTML_LINK.test(href)) {
        href = href.replace(/\.html(#|$)/, '.html.md$1');
      }
      return content ? `[${content}](${href})` : '';
    },
  });

  // Antora renders a decorative empty permalink anchor inside every heading
  // with an id (<a class="anchor" href="#x"></a>); drop it before it turns
  // into a stray empty markdown link. Registered last (turndown checks the
  // most-recently-added matching rule first) so it wins over
  // rewrite-internal-html-links, whose filter (any <a> with an href) is a
  // strict superset of this one's and would otherwise always fire first.
  td.addRule('strip-decorative-permalink', {
    filter: (node) =>
      node.nodeName === 'A' &&
      node.getAttribute('class') === 'anchor' &&
      !node.textContent.trim(),
    replacement: () => '',
  });

  return td;
}

const converter = createConverter();

function htmlToMarkdown(html) {
  return converter.turndown(html);
}

module.exports = { htmlToMarkdown };

// scripts/llm-export/lib/rewrite-relative-links.js
const path = require('node:path');

const MARKDOWN_LINK = /(!?\[[^\]]*\]\()([^)]+)(\))/g;
const FENCED_CODE_BLOCK = /```[\s\S]*?```/;

function isRelativeLocalLink(target) {
  return !/^\w+:/.test(target) && !target.startsWith('#') && !target.startsWith('/');
}

function rewriteLinksInProse(text, fromDir, toDir) {
  return text.replace(MARKDOWN_LINK, (whole, prefix, rawTarget, suffix) => {
    const hashIndex = rawTarget.indexOf('#');
    const targetPath = hashIndex === -1 ? rawTarget : rawTarget.slice(0, hashIndex);
    const fragment = hashIndex === -1 ? '' : rawTarget.slice(hashIndex);
    if (!targetPath || !isRelativeLocalLink(rawTarget)) return whole;

    const absolute = path.resolve(fromDir, targetPath);
    const relative = path.relative(toDir, absolute).split(path.sep).join('/');
    return `${prefix}${relative}${fragment}${suffix}`;
  });
}

/**
 * Rewrites relative local links in `markdown` so they resolve correctly
 * after the content moves from `fromDir` (the directory its links were
 * originally written relative to) to `toDir` (the directory it will now
 * actually be written to). Content inside fenced code blocks is left
 * untouched, since a code sample can coincidentally contain bracket/paren
 * sequences that look like markdown links (confirmed against real content:
 * JSON schema pattern strings — same issue check-links.js guards against).
 */
function rewriteRelativeLinks(markdown, { fromDir, toDir }) {
  const parts = markdown.split(new RegExp(`(${FENCED_CODE_BLOCK.source})`, 'g'));
  return parts.map((part, i) => (i % 2 === 1 ? part : rewriteLinksInProse(part, fromDir, toDir))).join('');
}

module.exports = { rewriteRelativeLinks };

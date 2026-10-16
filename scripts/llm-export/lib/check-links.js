const fs = require('node:fs');
const path = require('node:path');

const MARKDOWN_LINK = /\[[^\]]*\]\(([^)]+)\)/g;
const FENCED_CODE_BLOCK = /```[\s\S]*?```/g;

function isLocalFileLink(target) {
  // Absolute (root-relative) paths like "/specifications/specifications/2.4/x.html.md"
  // point at the published site's URL space, not this file's directory —
  // correctly resolving them would require knowing the site's base path
  // (antora-playbook.yml's site.url); skip rather than false-flag them.
  return !/^\w+:/.test(target) && !target.startsWith('#') && !target.startsWith('/');
}

function checkLinks(mirrorPaths) {
  const broken = [];
  for (const file of mirrorPaths) {
    const raw = fs.readFileSync(file, 'utf8');
    // Blank out fenced code blocks before scanning: a CDDL/JSON/ABNF sample
    // (real example: a JSON schema "pattern" string containing
    // `(?:[A-Za-z0-9-]*[A-Za-z0-9])`) can contain bracket/paren sequences
    // that coincidentally match MARKDOWN_LINK and would otherwise be
    // reported as a broken link to a nonsense target.
    const content = raw.replace(FENCED_CODE_BLOCK, (block) => block.replace(/[^\n]/g, ' '));
    for (const match of content.matchAll(MARKDOWN_LINK)) {
      const [, rawTarget] = match;
      const target = rawTarget.split('#')[0];
      if (!target || !isLocalFileLink(rawTarget)) continue;
      const resolved = path.resolve(path.dirname(file), target);
      if (!fs.existsSync(resolved)) {
        broken.push({ file, target: rawTarget });
      }
    }
  }
  return { broken };
}

module.exports = { checkLinks };

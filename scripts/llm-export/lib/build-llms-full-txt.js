// scripts/llm-export/lib/build-llms-full-txt.js
function buildLlmsFullTxt({ pageOrder, pagesByHref }) {
  const orphanHrefs = Object.keys(pagesByHref)
    .filter((href) => !pageOrder.includes(href))
    .sort();
  const orderedHrefs = [...pageOrder, ...orphanHrefs];

  const sections = orderedHrefs
    .filter((href) => pagesByHref[href])
    .map((href) => pagesByHref[href].markdown.trim());

  return sections.join('\n\n---\n\n') + '\n';
}

module.exports = { buildLlmsFullTxt };

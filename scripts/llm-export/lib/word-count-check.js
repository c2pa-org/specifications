function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function checkWordCountDrift(pages, thresholdRatio = 0.85) {
  let htmlWords = 0;
  let mdWords = 0;
  for (const page of pages) {
    htmlWords += countWords(page.sourceText);
    mdWords += countWords(page.markdown);
  }
  const ratio = htmlWords === 0 ? 1 : mdWords / htmlWords;
  return { ok: ratio >= thresholdRatio, ratio, htmlWords, mdWords };
}

module.exports = { checkWordCountDrift };

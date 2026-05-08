export function extractPullQuote(roastText: string): string {
  // Find the last paragraph (the verdict)
  const paragraphs = roastText.trim().split(/\n+/)
  const lastParagraph = paragraphs[paragraphs.length - 1] ?? roastText

  // Split into sentences
  const sentences = lastParagraph.match(/[^.!?]+[.!?]+/g) ?? [lastParagraph]

  // Find the shortest sentence that's still quotable (30–200 chars) — most tweet-able
  const candidates = sentences
    .map(s => s.trim())
    .filter(s => s.length >= 30 && s.length <= 200)
    .sort((a, b) => a.length - b.length)

  return candidates[0] ?? sentences[sentences.length - 1]?.trim() ?? roastText.slice(0, 140)
}

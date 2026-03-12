const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with",
  "this",
  "these",
  "those",
  "i",
  "you",
  "your",
  "we",
  "our",
  "they",
  "their",
  "or",
  "but",
  "if",
  "then",
  "than",
  "so",
]);

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitIntoChunks(text, options = {}) {
  const maxChunks = Number(options.maxChunks ?? 8);
  const minChunkLength = Number(options.minChunkLength ?? 45);

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= minChunkLength);

  if (sentences.length > 0) {
    return sentences.slice(0, maxChunks);
  }

  const words = text.trim().split(/\s+/);
  const fallbackChunks = [];
  const chunkSize = 20;

  for (let index = 0; index < words.length; index += chunkSize) {
    const chunk = words
      .slice(index, index + chunkSize)
      .join(" ")
      .trim();
    if (chunk.length >= minChunkLength) {
      fallbackChunks.push(chunk);
    }
    if (fallbackChunks.length >= maxChunks) {
      break;
    }
  }

  return fallbackChunks;
}

function toTokenSet(text) {
  const normalized = normalizeText(text);
  if (!normalized) {
    return new Set();
  }

  const tokens = normalized
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

  return new Set(tokens);
}

function jaccardSimilarity(a, b) {
  const setA = toTokenSet(a);
  const setB = toTokenSet(b);

  if (setA.size === 0 || setB.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function average(numbers) {
  if (!numbers.length) {
    return 0;
  }

  const total = numbers.reduce((sum, value) => sum + value, 0);
  return total / numbers.length;
}

module.exports = {
  splitIntoChunks,
  jaccardSimilarity,
  average,
};

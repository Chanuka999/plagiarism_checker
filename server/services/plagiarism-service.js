const { getCandidatesForChunk } = require("./providers");
const { splitIntoChunks, jaccardSimilarity, average } = require("./text-utils");

function buildSourceSummary(matches) {
  const sourceMap = new Map();

  for (const match of matches) {
    const key = match.sourceUrl;
    const existing = sourceMap.get(key);

    if (!existing) {
      sourceMap.set(key, {
        sourceTitle: match.sourceTitle,
        sourceUrl: match.sourceUrl,
        matches: 1,
        averageSimilarity: match.similarity,
        matchedChunks: [match.chunk]
      });
      continue;
    }

    existing.matches += 1;
    existing.averageSimilarity = (existing.averageSimilarity + match.similarity) / 2;
    existing.matchedChunks.push(match.chunk);
  }

  return [...sourceMap.values()]
    .sort((a, b) => b.averageSimilarity - a.averageSimilarity)
    .slice(0, 12)
    .map((source) => ({
      ...source,
      averageSimilarity: Number((source.averageSimilarity * 100).toFixed(1))
    }));
}

async function analyzeText(text, config) {
  const chunks = splitIntoChunks(text, {
    maxChunks: config.maxChunks,
    minChunkLength: config.minChunkLength
  });

  if (!chunks.length) {
    return {
      chunks: [],
      chunkMatches: [],
      similarityScore: 0,
      sources: []
    };
  }

  const chunkMatches = [];
  const chunkScores = [];

  for (const chunk of chunks) {
    const candidates = await getCandidatesForChunk(chunk, config.providerConfig);

    const evaluated = candidates
      .map((candidate) => ({
        ...candidate,
        chunk,
        similarity: jaccardSimilarity(chunk, candidate.snippet)
      }))
      .filter((candidate) => candidate.similarity >= config.similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity);

    if (evaluated.length) {
      const best = evaluated[0];
      chunkScores.push(best.similarity);
      chunkMatches.push({
        sourceTitle: best.sourceTitle,
        sourceUrl: best.sourceUrl,
        chunk,
        matchedSnippet: best.snippet,
        similarity: Number((best.similarity * 100).toFixed(1))
      });
    } else {
      chunkScores.push(0);
    }
  }

  const similarityScore = Number((average(chunkScores) * 100).toFixed(1));
  const sources = buildSourceSummary(
    chunkMatches.map((match) => ({ ...match, similarity: match.similarity / 100 }))
  );

  return {
    chunks,
    chunkMatches,
    similarityScore,
    sources
  };
}

module.exports = {
  analyzeText
};

const axios = require("axios");

const userAgent = "PlagiarismCheckerTool/1.0 (+https://example.local)";

async function googleSearchSnippets(chunk, credentials) {
  const { apiKey, cx } = credentials;

  if (!apiKey || !cx) {
    return null;
  }

  try {
    const response = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: {
          key: apiKey,
          cx,
          q: chunk,
          num: 5,
        },
        timeout: 15000,
        headers: {
          "User-Agent": userAgent,
        },
      },
    );

    const items = response.data.items || [];
    return items.map((item) => ({
      sourceTitle: item.title,
      sourceUrl: item.link,
      snippet: item.snippet || "",
    }));
  } catch (error) {
    console.warn("Google provider unavailable; falling back to mock provider.");
    return null;
  }
}

function mockSearchSnippets(chunk) {
  const examples = [
    {
      sourceTitle: "Academic Writing Guide",
      sourceUrl: "https://example.edu/academic-writing-guide",
      snippet:
        "Academic writing requires citations, structured argumentation, and careful source attribution.",
    },
    {
      sourceTitle: "Research Methodology Notes",
      sourceUrl: "https://example.edu/research-methodology",
      snippet:
        "Students should avoid direct copying and paraphrase ideas with proper references in reports.",
    },
    {
      sourceTitle: "Open Knowledge Article",
      sourceUrl: "https://example.com/open-knowledge",
      snippet:
        "Plagiarism detection systems compare textual overlap against indexed web and publication data.",
    },
  ];

  const firstWords = chunk.split(/\s+/).slice(0, 8).join(" ");

  return examples.map((entry) => ({
    ...entry,
    snippet: `${entry.snippet} ${firstWords}`,
  }));
}

async function getCandidatesForChunk(chunk, providerConfig) {
  if (providerConfig.provider === "google") {
    const googleResults = await googleSearchSnippets(
      chunk,
      providerConfig.google,
    );
    if (googleResults && googleResults.length) {
      return googleResults;
    }
  }

  return mockSearchSnippets(chunk);
}

module.exports = {
  getCandidatesForChunk,
};

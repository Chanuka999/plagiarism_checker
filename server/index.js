const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { analyzeText } = require("./services/plagiarism-service");

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

const similarityThreshold = Number(process.env.SIMILARITY_THRESHOLD || 0.35);
const maxChunks = Number(process.env.MAX_CHUNKS || 8);
const minChunkLength = Number(process.env.MIN_CHUNK_LENGTH || 45);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, provider: process.env.PLAGIARISM_PROVIDER || "mock" });
});

app.post("/api/check", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length < 60) {
    return res.status(400).json({
      error: "Please enter at least 60 characters to run plagiarism checking.",
    });
  }

  const configuredProvider = (
    process.env.PLAGIARISM_PROVIDER || "mock"
  ).toLowerCase();
  const provider = configuredProvider === "google" ? "google" : "mock";
  const providerConfig = {
    provider,
    google: {
      apiKey: process.env.GOOGLE_API_KEY,
      cx: process.env.GOOGLE_CX,
    },
  };

  try {
    const results = await analyzeText(text, {
      maxChunks,
      minChunkLength,
      similarityThreshold,
      providerConfig,
    });

    return res.json({
      provider,
      checkedAt: new Date().toISOString(),
      ...results,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to run plagiarism analysis",
    });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Plagiarism checker running on http://localhost:${port}`);
});

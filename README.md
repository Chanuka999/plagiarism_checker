# Plagiarism Checker Tool

Technical project එකක් ලෙස text plagiarism detection workflow එකක් implement කරලා තියෙනවා.

## Core Features

- Text Comparison: input text එක sentence/chunk level එකෙන් break කරලා web search snippets එක්ක compare කරනවා.
- Percentage Score: similarity score එක percentage එකක් විදියට chart එකෙන් පෙන්නනවා.
- Source Highlighting: matched sources list එක source URL, average similarity, match count එක්ක පෙන්නනවා.

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript, Chart.js
- Backend: Node.js, Express
- External Provider:
  - Option A: Google Custom Search API (default)
  - Option B: Mock provider (local demo/testing)

## Project Structure

- public/index.html: UI layout
- public/styles.css: modern responsive design + animations
- public/app.js: API integration, chart rendering, results rendering
- server/index.js: Express API server
- server/services/text-utils.js: chunking + similarity utils
- server/services/providers.js: provider adapters
- server/services/plagiarism-service.js: analysis pipeline

## Setup

1. Install dependencies

   npm install

2. Copy env file

   copy .env.example .env

3. Configure .env

   For Google provider:
   - PLAGIARISM_PROVIDER=google
   - GOOGLE_API_KEY=your_google_api_key
   - GOOGLE_CX=your_custom_search_engine_id

   For demo mode:
   - PLAGIARISM_PROVIDER=mock

4. Run app

   npm run dev

5. Open browser

   http://localhost:4000

## API

### POST /api/check

Request:

{
"text": "Your long text here..."
}

Response (example):

{
"provider": "google",
"checkedAt": "2026-03-12T09:30:00.000Z",
"chunks": ["..."],
"chunkMatches": [
{
"sourceTitle": "...",
"sourceUrl": "...",
"chunk": "...",
"matchedSnippet": "...",
"similarity": 62.5
}
],
"similarityScore": 41.2,
"sources": [
{
"sourceTitle": "...",
"sourceUrl": "...",
"matches": 2,
"averageSimilarity": 58.3,
"matchedChunks": ["..."]
}
]
}

## Notes

- Google API quota limits තියෙන නිසා production use එකට caching සහ retry add කරන්න.
- Similarity metric එක Jaccard token overlap metric එක base කරලා.
- Better accuracy සඳහා academic corpus APIs (Copyleaks වගේ) add කරන්න provider adapter එක extend කරලා.

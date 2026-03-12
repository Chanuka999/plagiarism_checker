const inputText = document.getElementById("inputText");
const checkBtn = document.getElementById("checkBtn");
const statusText = document.getElementById("statusText");
const scoreValue = document.getElementById("scoreValue");
const providerInfo = document.getElementById("providerInfo");
const sourceCount = document.getElementById("sourceCount");
const sourceList = document.getElementById("sourceList");
const chunkCount = document.getElementById("chunkCount");
const chunkList = document.getElementById("chunkList");

const chart = new Chart(document.getElementById("scoreChart"), {
  type: "doughnut",
  data: {
    labels: ["Similar", "Unique"],
    datasets: [
      {
        data: [0, 100],
        backgroundColor: ["#d94f2b", "#f3e5d4"],
        borderWidth: 0,
      },
    ],
  },
  options: {
    responsive: false,
    plugins: {
      legend: { display: false },
    },
    cutout: "72%",
  },
});

function setLoading(isLoading) {
  checkBtn.disabled = isLoading;
  checkBtn.textContent = isLoading ? "Analyzing..." : "Check Similarity";
  statusText.textContent = isLoading ? "Checking web sources..." : "Ready";
}

function updateScore(score) {
  const safeScore = Math.max(0, Math.min(100, Number(score || 0)));
  scoreValue.textContent = `${safeScore}%`;
  chart.data.datasets[0].data = [safeScore, 100 - safeScore];
  chart.update();
}

function renderSources(sources) {
  sourceCount.textContent = `${sources.length} source${sources.length === 1 ? "" : "s"}`;

  if (!sources.length) {
    sourceList.innerHTML =
      "<li class='source-item'>No source matches above threshold.</li>";
    return;
  }

  sourceList.innerHTML = sources
    .map(
      (source) => `
      <li class="source-item">
        <h4>${source.sourceTitle || "Untitled source"}</h4>
        <a href="${source.sourceUrl}" target="_blank" rel="noreferrer">${source.sourceUrl}</a>
        <p class="meta">Avg similarity: ${source.averageSimilarity}% | Matches: ${source.matches}</p>
      </li>
    `,
    )
    .join("");
}

function renderChunkMatches(chunks, chunkMatches) {
  chunkCount.textContent = `${chunkMatches.length}/${chunks.length} matched`;

  if (!chunkMatches.length) {
    chunkList.innerHTML =
      "<div class='chunk-item'>No chunk-level matches found.</div>";
    return;
  }

  chunkList.innerHTML = chunkMatches
    .map(
      (match) => `
      <article class="chunk-item">
        <p class="chunk">${match.chunk}</p>
        <p class="match">
          ${match.similarity}% similar with
          <a href="${match.sourceUrl}" target="_blank" rel="noreferrer">${match.sourceTitle}</a>
        </p>
      </article>
    `,
    )
    .join("");
}

async function runCheck() {
  const text = inputText.value.trim();
  if (text.length < 60) {
    statusText.textContent = "Please enter at least 60 characters.";
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Failed to check plagiarism");
    }

    updateScore(payload.similarityScore || 0);
    providerInfo.textContent = `Provider: ${payload.provider}`;
    renderSources(payload.sources || []);
    renderChunkMatches(payload.chunks || [], payload.chunkMatches || []);
    statusText.textContent = `Completed at ${new Date(payload.checkedAt).toLocaleTimeString()}`;
  } catch (error) {
    statusText.textContent = error.message;
  } finally {
    setLoading(false);
  }
}

checkBtn.addEventListener("click", runCheck);

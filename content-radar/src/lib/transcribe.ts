export async function transcribeAudio(audioUrl: string): Promise<string> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) throw new Error("ASSEMBLYAI_API_KEY nicht konfiguriert");

  const submitRes = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: { Authorization: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ audio_url: audioUrl, language_detection: true }),
  });

  if (!submitRes.ok) {
    const text = await submitRes.text();
    throw new Error(`AssemblyAI Fehler ${submitRes.status}: ${text.slice(0, 200)}`);
  }

  const { id } = await submitRes.json();

  for (let i = 0; i < 120; i++) {
    await sleep(3000);
    const res = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { Authorization: apiKey },
    });
    const data = await res.json();

    if (data.status === "completed") return data.text ?? "";
    if (data.status === "error") throw new Error(`AssemblyAI: ${data.error}`);
  }

  throw new Error("AssemblyAI Timeout (6 Minuten)");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

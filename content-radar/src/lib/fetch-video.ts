import { YoutubeTranscript } from "youtube-transcript";

export interface VideoData {
  title: string;
  description: string;
  directTranscript?: string;
  audioUrl?: string;
}

export async function fetchVideoData(url: string, platform: string): Promise<VideoData> {
  if (platform === "youtube") return fetchYouTube(url);

  const apifyKey = process.env.APIFY_API_KEY;
  if (!apifyKey) throw new Error("APIFY_API_KEY nicht konfiguriert");

  if (platform === "tiktok") return fetchTikTok(url, apifyKey);
  return fetchInstagram(url, apifyKey);
}

async function fetchYouTube(url: string): Promise<VideoData> {
  const videoId = extractYouTubeId(url);
  if (!videoId) throw new Error("YouTube Video-ID nicht gefunden");

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const text = transcript.map((t: { text: string }) => t.text).join(" ");
    return { title: `YouTube Video (${videoId})`, description: "", directTranscript: text };
  } catch {
    return { title: `YouTube Video (${videoId})`, description: "" };
  }
}

async function fetchTikTok(url: string, apifyKey: string): Promise<VideoData> {
  const run = await runApifyActor(
    "clockworks~tiktok-scraper",
    { postURLs: [url], shouldDownloadVideos: false, shouldDownloadCovers: false },
    apifyKey
  );
  const items = await getApifyDataset(run.defaultDatasetId, apifyKey);
  const item = items[0];
  if (!item) throw new Error("TikTok-Video nicht gefunden");

  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  return {
    title: str(item.text) ?? str(item.desc) ?? "TikTok Video",
    description: str(item.text) ?? str(item.desc) ?? "",
    audioUrl: str(item.videoUrl) ?? str(item.downloadAddr),
  };
}

async function fetchInstagram(url: string, apifyKey: string): Promise<VideoData> {
  const run = await runApifyActor(
    "apify~instagram-reel-scraper",
    { directUrls: [url] },
    apifyKey
  );
  const items = await getApifyDataset(run.defaultDatasetId, apifyKey);
  const item = items[0];
  if (!item) throw new Error("Instagram-Reel nicht gefunden");

  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  return {
    title: str(item.caption) ?? str(item.title) ?? "Instagram Reel",
    description: str(item.caption) ?? "",
    audioUrl: str(item.videoUrl) ?? str(item.url),
  };
}

async function runApifyActor(actorId: string, input: object, apiKey: string): Promise<{ defaultDatasetId: string }> {
  const res = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify Fehler ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const runId = data.data.id;

  for (let i = 0; i < 60; i++) {
    await sleep(3000);
    const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`);
    const statusData = await statusRes.json();
    const status: string = statusData.data.status;

    if (status === "SUCCEEDED") return { defaultDatasetId: statusData.data.defaultDatasetId };
    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Apify Actor fehlgeschlagen: ${status}`);
    }
  }

  throw new Error("Apify Timeout (3 Minuten)");
}

async function getApifyDataset(datasetId: string, apiKey: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiKey}`);
  return res.json();
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

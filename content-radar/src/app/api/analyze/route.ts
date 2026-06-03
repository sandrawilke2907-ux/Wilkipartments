import { NextRequest } from "next/server";
import { VideoAnalysis } from "@/lib/types";
import { generateMockAnalysis } from "@/lib/mock-data";
import { fetchVideoData } from "@/lib/fetch-video";
import { transcribeAudio } from "@/lib/transcribe";

export const maxDuration = 300;

function detectPlatform(url: string): VideoAnalysis["platform"] {
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  return "youtube";
}

function sse(event: string, data: object): Uint8Array {
  return new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function POST(request: NextRequest) {
  const { url, description } = await request.json();

  if (!url || typeof url !== "string") {
    return new Response(JSON.stringify({ error: "URL fehlt" }), { status: 400 });
  }

  const platform = detectPlatform(url);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: object) => controller.enqueue(sse(event, data));

      try {
        if (!apiKey) {
          send("step", { message: "Demo-Modus aktiv (kein ANTHROPIC_API_KEY)", step: 0 });
          const mock = generateMockAnalysis(url, platform);
          send("result", { analysis: mock, demo: true, error: "Kein API-Key. Trage ANTHROPIC_API_KEY in .env.local ein." });
          controller.close();
          return;
        }

        const hasApify = !!process.env.APIFY_API_KEY;
        const hasAssemblyAI = !!process.env.ASSEMBLYAI_API_KEY;

        let transcript = description || "";
        let videoTitle = "";

        // Step 1 — fetch video via Apify or youtube-transcript
        if (platform === "youtube" || hasApify) {
          send("step", { message: "📥 Video wird geladen…", step: 1 });
          try {
            const videoData = await fetchVideoData(url, platform);
            videoTitle = videoData.title;

            if (videoData.directTranscript) {
              transcript = videoData.directTranscript;
              send("step", { message: "✅ Transkript aus YouTube geladen", step: 2 });
            } else if (videoData.audioUrl && hasAssemblyAI) {
              // Step 2 — transcribe audio via AssemblyAI
              send("step", { message: "🎙️ Audio wird transkribiert…", step: 2 });
              transcript = await transcribeAudio(videoData.audioUrl);
              send("step", { message: "✅ Transkription abgeschlossen", step: 2 });
            } else if (videoData.description) {
              transcript = videoData.description;
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            send("step", { message: `⚠️ ${msg} — weiter mit manueller Beschreibung`, step: 1 });
          }
        }

        // Step 3 — Claude analysis
        send("step", { message: "🧠 Claude analysiert alle 12 Dimensionen…", step: 3 });

        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        const client = new Anthropic({ apiKey });

        const contentInfo = transcript
          ? `Plattform: ${platform}\nURL: ${url}${videoTitle ? `\nTitel: ${videoTitle}` : ""}\n\nTranskript / Beschreibung:\n${transcript}`
          : `Plattform: ${platform}\nURL: ${url}\n\nHinweis: Kein Transkript verfügbar — analysiere basierend auf URL-Kontext und typischen ${platform}-Mustern.`;

        const prompt = `Du bist ein Social-Media-Content-Experte. Analysiere dieses Video:\n\n${contentInfo}

Bewerte das Video auf einer Skala von 0-100 für jede der folgenden 12 Dimensionen:
1. Hook-Qualität (Neugier-Gap, erster Eindruck, erste 3 Sekunden)
2. Storytelling (Narrative, Struktur, roter Faden)
3. Emotionale Trigger (Gefühle, Aspiration, FOMO, Identifikation)
4. Visuelle Elemente (Ästhetik, Qualität, visuelle Dynamik)
5. Engagement-Muster (Interaktionsanreize, Kommentar-Trigger)
6. CTA-Stärke (Call-to-Action, Handlungsaufforderung)
7. Pacing & Schnitt (Tempo, Rhythmus, Schnittfrequenz)
8. Authentizität (Glaubwürdigkeit, Persönlichkeit)
9. Nischen-Relevanz (Zielgruppenfit, Aktualität, Themenpassung)
10. Musik & Ton (Sound, Musik, Audio-Qualität)
11. Text-Overlay (Untertitel, Texteinblendungen, Lesbarkeit)
12. Viral-Potenzial (Shareability, Replay-Wert, Gesamtpotenzial)

Antworte NUR mit validem JSON:
{
  "title": "Kurze Videobeschreibung",
  "viralScore": <Durchschnitt aller 12 Scores>,
  "dimensions": [
    {"name": "Hook-Qualität", "score": <0-100>, "description": "<Begründung auf Deutsch>"},
    {"name": "Storytelling", "score": <0-100>, "description": "<Begründung>"},
    {"name": "Emotionale Trigger", "score": <0-100>, "description": "<Begründung>"},
    {"name": "Visuelle Elemente", "score": <0-100>, "description": "<Begründung>"},
    {"name": "Engagement-Muster", "score": <0-100>, "description": "<Begründung>"},
    {"name": "CTA-Stärke", "score": <0-100>, "description": "<Begründung>"},
    {"name": "Pacing & Schnitt", "score": <0-100>, "description": "<Begründung>"},
    {"name": "Authentizität", "score": <0-100>, "description": "<Begründung>"},
    {"name": "Nischen-Relevanz", "score": <0-100>, "description": "<Begründung>"},
    {"name": "Musik & Ton", "score": <0-100>, "description": "<Begründung>"},
    {"name": "Text-Overlay", "score": <0-100>, "description": "<Begründung>"},
    {"name": "Viral-Potenzial", "score": <0-100>, "description": "<Begründung>"}
  ],
  "summary": "<2-3 Sätze Gesamtbewertung auf Deutsch>",
  "topStrengths": ["<Stärke 1>", "<Stärke 2>", "<Stärke 3>"],
  "improvements": ["<Verbesserung 1>", "<Verbesserung 2>", "<Verbesserung 3>"]
}`;

        const message = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          messages: [{ role: "user", content: prompt }],
        });

        const text = message.content[0].type === "text" ? message.content[0].text : "";
        const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("Claude Antwort:", text.slice(0, 500));
          throw new Error("Kein JSON in der Claude-Antwort");
        }

        const parsed = JSON.parse(jsonMatch[0]);
        const analysis: VideoAnalysis = {
          id: Date.now().toString(),
          url,
          platform,
          title: parsed.title ?? videoTitle ?? "Analysiertes Video",
          analyzedAt: new Date().toISOString(),
          viralScore: parsed.viralScore ?? 0,
          dimensions: parsed.dimensions ?? [],
          summary: parsed.summary ?? "",
          topStrengths: parsed.topStrengths ?? [],
          improvements: parsed.improvements ?? [],
        };

        send("result", { analysis, demo: false });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error("❌ Analyse Fehler:", errMsg);
        const mock = generateMockAnalysis(url, platform);
        send("result", { analysis: mock, demo: true, error: `Fehler: ${errMsg}` });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

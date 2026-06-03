import { NextRequest, NextResponse } from "next/server";
import { VideoAnalysis } from "@/lib/types";
import { generateMockAnalysis } from "@/lib/mock-data";

function detectPlatform(url: string): VideoAnalysis["platform"] {
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  return "youtube";
}

export async function POST(request: NextRequest) {
  const { url, description } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL fehlt" }, { status: 400 });
  }

  const platform = detectPlatform(url);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.log("⚠️  Kein ANTHROPIC_API_KEY gefunden — Demo-Modus aktiv");
    const mock = generateMockAnalysis(url, platform);
    return NextResponse.json({ analysis: mock, demo: true, error: "Kein API-Key. Trage ANTHROPIC_API_KEY in .env.local ein." });
  }

  console.log("✅ ANTHROPIC_API_KEY gefunden — starte echte Analyse...");

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });

    const contentInfo = description
      ? `Plattform: ${platform}\nURL: ${url}\n\nVideo-Beschreibung vom Creator:\n${description}`
      : `Plattform: ${platform}\nURL: ${url}\n\nHinweis: Keine Beschreibung angegeben — analysiere basierend auf URL-Kontext und typischen ${platform}-Mustern.`;

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
  "title": "Kurze Videobeschreibung basierend auf der URL",
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
    // Strip markdown code blocks if present
    const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Claude Antwort:", text.slice(0, 500));
      throw new Error("Kein JSON in der Antwort");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const analysis: VideoAnalysis = {
      id: Date.now().toString(),
      url,
      platform,
      title: parsed.title ?? "Analysiertes Video",
      analyzedAt: new Date().toISOString(),
      viralScore: parsed.viralScore ?? 0,
      dimensions: parsed.dimensions ?? [],
      summary: parsed.summary ?? "",
      topStrengths: parsed.topStrengths ?? [],
      improvements: parsed.improvements ?? [],
    };

    return NextResponse.json({ analysis, demo: false });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ Claude Fehler:", errMsg);
    const mock = generateMockAnalysis(url, platform);
    return NextResponse.json({ analysis: mock, demo: true, error: `Claude-Fehler: ${errMsg}` });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { VideoAnalysis } from "@/lib/types";
import { generateMockAnalysis } from "@/lib/mock-data";

function detectPlatform(url: string): VideoAnalysis["platform"] {
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  return "youtube";
}

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL fehlt" }, { status: 400 });
  }

  const platform = detectPlatform(url);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("⚠️  Kein GEMINI_API_KEY gefunden — Demo-Modus aktiv");
    const mock = generateMockAnalysis(url, platform);
    return NextResponse.json({ analysis: mock, demo: true, error: "Kein API-Key gefunden. Prüfe .env.local" });
  }

  console.log("✅ GEMINI_API_KEY gefunden — starte echte Analyse...");

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Du bist ein Social-Media-Content-Experte. Analysiere dieses Video von ${platform}: ${url}

Bewerte das Video auf einer Skala von 0-100 für jede der folgenden 12 Dimensionen:
1. Hook (erster Eindruck, erste 3 Sekunden)
2. Storytelling (Narrative, Struktur)
3. Pacing (Tempo, Rhythmus)
4. CTA (Call-to-Action, Handlungsaufforderung)
5. Hook-Qualität (Neugier-Gap, Spannung)
6. Emotionale Trigger (Gefühle, Aspiration, FOMO)
7. Engagement-Muster (Interaktionsanreize, Kommentar-Trigger)
8. Visuelle Wirkung (Ästhetik, Schnitte, Qualität)
9. Audio / Musik (Ton, Musik, Sounddesign)
10. Relevanz (Aktualität, Zielgruppenfit)
11. Authentizität (Glaubwürdigkeit, Persönlichkeit)
12. Conversion-Kraft (Verbindung zum Angebot, Sales-Potential)

Antworte NUR mit validem JSON in diesem Format:
{
  "title": "Videotitel oder Beschreibung",
  "viralScore": <Gesamtdurchschnitt 0-100>,
  "dimensions": [
    {"name": "Hook", "score": <0-100>, "description": "<kurze Begründung auf Deutsch>"},
    ...alle 12...
  ],
  "summary": "<2-3 Sätze Gesamtbewertung auf Deutsch>",
  "topStrengths": ["<Stärke 1>", "<Stärke 2>", "<Stärke 3>"],
  "improvements": ["<Verbesserung 1>", "<Verbesserung 2>", "<Verbesserung 3>"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error("Kein JSON in der Antwort");

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
    console.error("❌ Gemini Fehler:", errMsg);
    const mock = generateMockAnalysis(url, platform);
    return NextResponse.json({ analysis: mock, demo: true, error: `Gemini-Fehler: ${errMsg}` });
  }
}

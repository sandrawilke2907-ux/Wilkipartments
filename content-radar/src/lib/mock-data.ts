import { VideoAnalysis } from "./types";

export const MOCK_ANALYSES: VideoAnalysis[] = [
  {
    id: "1",
    url: "https://www.youtube.com/watch?v=example1",
    platform: "youtube",
    title: "5 Fehler, die Coaches beim Content machen",
    analyzedAt: "2026-06-01T10:30:00Z",
    viralScore: 87,
    dimensions: [
      { name: "Hook-Qualität",     score: 92, description: "Starker Einstieg mit direkter Problemansprache" },
      { name: "Storytelling",      score: 85, description: "Klare Narrative mit Identifikationspotenzial" },
      { name: "Emotionale Trigger",score: 82, description: "Frustration und Hoffnung gut balanciert" },
      { name: "Visuelle Elemente", score: 80, description: "Professionell, könnte dynamischer sein" },
      { name: "Engagement-Muster", score: 86, description: "Regelmäßige Interaktionspunkte" },
      { name: "CTA-Stärke",        score: 90, description: "Klarer, spezifischer Call-to-Action am Ende" },
      { name: "Pacing & Schnitt",  score: 78, description: "Gutes Tempo, leicht langsam im Mittelteil" },
      { name: "Authentizität",     score: 88, description: "Persönliche Erfahrungen gut eingebaut" },
      { name: "Nischen-Relevanz",  score: 95, description: "Trifft aktuellen Pain Point exakt" },
      { name: "Musik & Ton",       score: 75, description: "Klarer Ton, Hintergrundmusik passt" },
      { name: "Text-Overlay",      score: 83, description: "Gut lesbare Untertitel, wichtige Punkte hervorgehoben" },
      { name: "Viral-Potenzial",   score: 84, description: "Hohe Shareability durch relatables Thema" },
    ],
    summary: "Starkes Video mit exzellentem Relevanz-Score. Der Hook ist besonders stark und greift einen spezifischen Schmerzpunkt auf. Die Conversion-Kraft könnte durch ein stärkeres Angebot am Ende weiter gesteigert werden.",
    topStrengths: ["Relevanter Themenbezug", "Starker Hook mit Neugier-Gap", "Klarer CTA"],
    improvements: ["Pacing im Mittelteil beschleunigen", "Mehr B-Roll für visuelle Dynamik", "Frühere CTA-Andeutung"],
  },
  {
    id: "2",
    url: "https://www.tiktok.com/@example/video/123",
    platform: "tiktok",
    title: "So verdiene ich 5k/Monat als Creator",
    analyzedAt: "2026-06-02T14:15:00Z",
    viralScore: 94,
    dimensions: [
      { name: "Hook-Qualität",     score: 98, description: "Zahlen-Hook erzeugt maximale Neugier" },
      { name: "Storytelling",      score: 88, description: "Persönliche Journey gut strukturiert" },
      { name: "Emotionale Trigger",score: 90, description: "Aspiration und FOMO stark aktiviert" },
      { name: "Visuelle Elemente", score: 88, description: "Dynamische Schnitte, trendige Ästhetik" },
      { name: "Engagement-Muster", score: 92, description: "Kommentar-provokative Aussagen" },
      { name: "CTA-Stärke",        score: 85, description: "Link in Bio Verweis" },
      { name: "Pacing & Schnitt",  score: 95, description: "Perfektes TikTok-Tempo, keine Längen" },
      { name: "Authentizität",     score: 85, description: "Etwas poliert, aber glaubwürdig" },
      { name: "Nischen-Relevanz",  score: 93, description: "Money/Creator-Thema immer relevant" },
      { name: "Musik & Ton",       score: 96, description: "Trending Sound perfekt eingesetzt" },
      { name: "Text-Overlay",      score: 91, description: "Klare Texteinblendungen verstärken Hook" },
      { name: "Viral-Potenzial",   score: 90, description: "Starke Verlinkung zum Angebot" },
    ],
    summary: "Viraler Hit mit nahezu perfektem Hook. Die Kombination aus konkreter Zahl, Trending Sound und aspirativem Content erzeugt maximales Engagement. Vorzeige-Video für die Money/Creator-Nische.",
    topStrengths: ["Zahlen-Hook mit Neugier-Gap", "Trending Sound", "FOMO-Trigger"],
    improvements: ["Authentizitäts-Score könnte höher", "CTA konkreter formulieren"],
  },
  {
    id: "3",
    url: "https://www.instagram.com/reel/example3",
    platform: "instagram",
    title: "Behind the Scenes meines Coaching-Business",
    analyzedAt: "2026-06-02T18:45:00Z",
    viralScore: 71,
    dimensions: [
      { name: "Hook-Qualität",     score: 62, description: "Kein klarer Neugier-Gap" },
      { name: "Storytelling",      score: 80, description: "Gute Behind-the-Scenes Narrative" },
      { name: "Emotionale Trigger",score: 75, description: "Inspiration gut, aber nicht spezifisch genug" },
      { name: "Visuelle Elemente", score: 85, description: "Hochwertige Ästhetik" },
      { name: "Engagement-Muster", score: 68, description: "Wenig Interaktionspunkte" },
      { name: "CTA-Stärke",        score: 60, description: "Fehlender oder schwacher CTA" },
      { name: "Pacing & Schnitt",  score: 70, description: "Stellenweise zu langsam" },
      { name: "Authentizität",     score: 90, description: "Sehr authentisch und nahbar" },
      { name: "Nischen-Relevanz",  score: 72, description: "Thema passend, aber wenig spezifisch" },
      { name: "Musik & Ton",       score: 78, description: "Gute Musikwahl" },
      { name: "Text-Overlay",      score: 55, description: "Kaum Texteinblendungen genutzt" },
      { name: "Viral-Potenzial",   score: 58, description: "Kein klarer Link zum Angebot" },
    ],
    summary: "Authentisches Video mit starker visueller Ästhetik, aber schwachem Hook und fehlendem CTA. Großes Verbesserungspotenzial durch stärkeren Einstieg und klarere Conversion-Strategie.",
    topStrengths: ["Sehr hohe Authentizität", "Professionelle Visuals", "Gutes Storytelling"],
    improvements: ["Hook komplett umschreiben", "CTA am Ende hinzufügen", "Neugier-Gap im ersten Frame"],
  },
];

export function generateMockAnalysis(url: string, platform: string): VideoAnalysis {
  const scores = Array.from({ length: 12 }, () => Math.floor(Math.random() * 30) + 60);
  const viralScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const dimensionLabels = [
    "Hook-Qualität", "Storytelling", "Emotionale Trigger", "Visuelle Elemente",
    "Engagement-Muster", "CTA-Stärke", "Pacing & Schnitt", "Authentizität",
    "Nischen-Relevanz", "Musik & Ton", "Text-Overlay", "Viral-Potenzial",
  ];

  return {
    id: Date.now().toString(),
    url,
    platform: platform as VideoAnalysis["platform"],
    title: "Analysiertes Video",
    analyzedAt: new Date().toISOString(),
    viralScore,
    dimensions: dimensionLabels.map((name, i) => ({
      name,
      score: scores[i],
      description: "KI-Analyse wird nach API-Key-Konfiguration verfügbar.",
    })),
    summary: "Demo-Analyse. Konfiguriere deinen Gemini API-Key in .env.local für echte KI-Analysen.",
    topStrengths: ["Demo-Modus aktiv", "Alle 12 Dimensionen verfügbar", "Viral Score berechnet"],
    improvements: ["Gemini API Key hinzufügen", "Echte Video-URL eingeben", "Analyse erneut starten"],
  };
}

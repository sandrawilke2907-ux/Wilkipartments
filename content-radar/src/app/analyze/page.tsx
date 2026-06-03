import { Nav } from "@/app/page";
import AnalyzeForm from "@/components/AnalyzeForm";

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-[#0d0a14]">
      <Nav active="analyze" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#db2777]/10 border border-[#db2777]/30 rounded-full text-xs text-[#db2777] font-medium mb-4">
            <span className="w-1.5 h-1.5 bg-[#db2777] rounded-full" />
            Powered by Claude AI
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#f0e6ff] mb-3">
            Video analysieren
          </h1>
          <p className="text-[#9d8ab5] text-lg">
            Füge eine YouTube-, TikTok- oder Instagram-URL ein und erhalte in Sekunden eine vollständige KI-Analyse über 12 Dimensionen.
          </p>
        </div>

        {/* What gets analyzed */}
        <div className="bg-[#161020] border border-[#2a1f40] rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-[#f0e6ff] mb-4">
            Claude analysiert 12 Dimensionen
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ANALYSIS_DIMENSIONS.map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <span className="text-base">{d.icon}</span>
                <span className="text-xs text-[#9d8ab5]">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <AnalyzeForm />

        {/* API key hint */}
        <div className="mt-8 bg-[#1e1530] border border-[#2a1f40] rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-[#f0e6ff]">API-Keys einrichten (.env.local)</p>
          <div className="space-y-1.5 text-xs text-[#9d8ab5]">
            <div>
              <code className="bg-[#0d0a14] px-1 py-0.5 rounded text-[#db2777]">ANTHROPIC_API_KEY</code>
              {" "}— KI-Analyse · console.anthropic.com{" "}
              <span className="text-green-400 font-medium">Pflicht</span>
            </div>
            <div>
              <code className="bg-[#0d0a14] px-1 py-0.5 rounded text-[#db2777]">APIFY_API_KEY</code>
              {" "}— Video laden (TikTok/Instagram) · apify.com{" "}
              <span className="text-amber-400 font-medium">Optional</span>
            </div>
            <div>
              <code className="bg-[#0d0a14] px-1 py-0.5 rounded text-[#db2777]">ASSEMBLYAI_API_KEY</code>
              {" "}— Auto-Transkription · assemblyai.com{" "}
              <span className="text-amber-400 font-medium">Optional</span>
            </div>
          </div>
          <p className="text-xs text-[#4a3d66]">Ohne ANTHROPIC_API_KEY läuft die App im Demo-Modus.</p>
        </div>
      </main>
    </div>
  );
}

const ANALYSIS_DIMENSIONS = [
  { icon: "🎣", label: "Hook-Qualität" },
  { icon: "📖", label: "Storytelling" },
  { icon: "❤️", label: "Emotionale Trigger" },
  { icon: "👁️", label: "Visuelle Elemente" },
  { icon: "🔄", label: "Engagement-Muster" },
  { icon: "🎯", label: "CTA-Stärke" },
  { icon: "⚡", label: "Pacing & Schnitt" },
  { icon: "💎", label: "Authentizität" },
  { icon: "📍", label: "Nischen-Relevanz" },
  { icon: "🎵", label: "Musik & Ton" },
  { icon: "✍️", label: "Text-Overlay" },
  { icon: "🚀", label: "Viral-Potenzial" },
];

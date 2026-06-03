"use client";

import { useState } from "react";
import { VideoAnalysis } from "@/lib/types";
import AnalysisCard from "./AnalysisCard";

function detectPlatform(url: string) {
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  return "youtube";
}

export default function AnalyzeForm() {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState<{ analysis: VideoAnalysis; demo: boolean; error?: string } | null>(null);
  const [error, setError] = useState("");

  const platform = url ? detectPlatform(url) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setSteps(["🔌 Verbindung wird aufgebaut…"]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), description: description.trim() }),
      });

      if (!res.ok || !res.body) throw new Error("Server-Fehler");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          let eventType = "message";
          let dataStr = "";

          for (const line of part.split("\n")) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            if (line.startsWith("data: ")) dataStr = line.slice(6).trim();
          }

          if (!dataStr) continue;
          const data = JSON.parse(dataStr);

          if (eventType === "step") {
            setSteps((prev) => [...prev, data.message]);
          } else if (eventType === "result") {
            setResult(data);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
      setSteps([]);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#f0e6ff] mb-2">
            Video-URL eingeben
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full bg-[#1e1530] border border-[#2a1f40] rounded-xl px-4 py-3.5 text-[#f0e6ff] placeholder-[#4a3d66] focus:outline-none focus:border-[#db2777] focus:ring-1 focus:ring-[#db2777] transition-colors text-sm"
                disabled={loading}
              />
              {platform && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    platform === "youtube"   ? "bg-red-600/20 text-red-400" :
                    platform === "tiktok"    ? "bg-white/10 text-white" :
                    "bg-purple-600/20 text-purple-400"
                  }`}>
                    {platform === "youtube" ? "YouTube" : platform === "tiktok" ? "TikTok" : "Instagram"}
                  </span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-6 py-3.5 bg-[#db2777] hover:bg-[#be185d] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm glow-pink whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin-slow w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analysiere…
                </span>
              ) : "Analysieren →"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#f0e6ff] mb-2">
            Video beschreiben{" "}
            <span className="text-[#9d8ab5] font-normal">(optional — wird automatisch transkribiert wenn API-Keys konfiguriert)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibe kurz was in deinem Video passiert: Thema, Hook, Struktur, CTA, Musik, Stil…"
            rows={3}
            className="w-full bg-[#1e1530] border border-[#2a1f40] rounded-xl px-4 py-3 text-[#f0e6ff] placeholder-[#4a3d66] focus:outline-none focus:border-[#db2777] focus:ring-1 focus:ring-[#db2777] transition-colors text-sm resize-none"
            disabled={loading}
          />
        </div>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && steps.length > 0 && (
        <div className="bg-[#161020] border border-[#2a1f40] rounded-2xl p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 rounded-full border-2 border-[#db2777] border-t-transparent animate-spin-slow flex-shrink-0" />
            <p className="text-[#f0e6ff] font-semibold text-sm">Analyse läuft…</p>
          </div>
          <ul className="space-y-2">
            {steps.map((msg, i) => (
              <li key={i} className="text-sm text-[#9d8ab5] flex items-start gap-2">
                <span className="text-[#db2777] mt-0.5">›</span>
                <span className={i === steps.length - 1 ? "text-[#f0e6ff]" : ""}>{msg}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result?.error && result.demo && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-400 text-sm">
          <strong>Hinweis:</strong> {result.error}
        </div>
      )}

      {result && (
        <AnalysisCard analysis={result.analysis} isDemo={result.demo} />
      )}
    </div>
  );
}

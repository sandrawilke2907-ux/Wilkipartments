"use client";

import { useState } from "react";
import { VideoAnalysis } from "@/lib/types";
import AnalysisCard from "./AnalysisCard";

function detectPlatform(url: string) {
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  return "youtube";
}

const PLACEHOLDER_URLS = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://www.tiktok.com/@creator/video/123456789",
  "https://www.instagram.com/reel/ABC123/",
];

export default function AnalyzeForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: VideoAnalysis; demo: boolean; error?: string } | null>(null);
  const [error, setError] = useState("");

  const platform = url ? detectPlatform(url) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analyse fehlgeschlagen");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
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

        <p className="text-xs text-[#9d8ab5]">
          Unterstützt: YouTube, TikTok, Instagram Reels
        </p>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="bg-[#161020] border border-[#2a1f40] rounded-2xl p-8 text-center animate-fade-in-up">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-[#db2777] border-t-transparent animate-spin-slow" />
            <div>
              <p className="text-[#f0e6ff] font-semibold">Gemini analysiert…</p>
              <p className="text-[#9d8ab5] text-sm mt-1">12 Dimensionen werden bewertet</p>
            </div>
          </div>
        </div>
      )}

      {result?.error && result.demo && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-400 text-sm">
          <strong>Gemini-Fehler:</strong> {result.error}
        </div>
      )}

      {result && (
        <AnalysisCard analysis={result.analysis} isDemo={result.demo} />
      )}
    </div>
  );
}

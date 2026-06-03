"use client";

import { useState } from "react";
import { VideoAnalysis } from "@/lib/types";
import { MOCK_ANALYSES } from "@/lib/mock-data";
import AnalysisCard from "./AnalysisCard";
import PlatformBadge from "./PlatformBadge";

const PLATFORM_FILTERS = ["alle", "youtube", "tiktok", "instagram"] as const;

export default function Dashboard() {
  const [filter, setFilter] = useState<typeof PLATFORM_FILTERS[number]>("alle");

  const analyses = MOCK_ANALYSES;
  const filtered = filter === "alle" ? analyses : analyses.filter((a) => a.platform === filter);

  const avgScore = Math.round(analyses.reduce((s, a) => s + a.viralScore, 0) / analyses.length);
  const best = analyses.reduce((prev, curr) => prev.viralScore > curr.viralScore ? prev : curr);

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Analysierte Videos" value={analyses.length.toString()} sub="gesamt" />
        <StatCard label="Ø Viral Score" value={avgScore.toString()} sub="über alle Videos" accent />
        <StatCard label="Bester Score" value={best.viralScore.toString()} sub={best.title} />
      </div>

      {/* Platform filter */}
      <div className="flex flex-wrap gap-2">
        {PLATFORM_FILTERS.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === p
                ? "bg-[#db2777] text-white"
                : "bg-[#1e1530] text-[#9d8ab5] hover:text-[#f0e6ff] border border-[#2a1f40]"
            }`}
          >
            {p === "alle" ? "Alle Plattformen" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Analysis cards */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <p className="text-[#9d8ab5] text-center py-8">Keine Analysen für diese Plattform.</p>
        ) : (
          filtered.map((a) => <AnalysisCard key={a.id} analysis={a} isDemo />)
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: {
  label: string; value: string; sub: string; accent?: boolean;
}) {
  return (
    <div className="bg-[#161020] border border-[#2a1f40] rounded-2xl p-5">
      <p className="text-[#9d8ab5] text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-4xl font-bold ${accent ? "text-[#db2777]" : "text-[#f0e6ff]"}`}>{value}</p>
      <p className="text-[#9d8ab5] text-xs mt-1 truncate">{sub}</p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { VideoAnalysis } from "@/lib/types";
import ViralScoreRing from "./ViralScoreRing";
import DimensionBar from "./DimensionBar";
import PlatformBadge from "./PlatformBadge";
import ExportPDFButton from "./ExportPDFButton";

interface Props {
  analysis: VideoAnalysis;
  isDemo?: boolean;
}

export default function AnalysisCard({ analysis, isDemo }: Props) {
  const [expanded, setExpanded] = useState(true);
  const date = new Date(analysis.analyzedAt).toLocaleDateString("de-DE", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="bg-[#161020] border border-[#2a1f40] rounded-2xl overflow-hidden animate-fade-in-up">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <ViralScoreRing score={analysis.viralScore} size={140} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <PlatformBadge platform={analysis.platform} />
              {isDemo && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Demo-Modus
                </span>
              )}
              <span className="text-xs text-[#9d8ab5]">{date}</span>
            </div>

            <h3 className="text-lg font-bold text-[#f0e6ff] mb-2 truncate">{analysis.title}</h3>
            <p className="text-sm text-[#9d8ab5] mb-4 line-clamp-3">{analysis.summary}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <p className="text-xs font-semibold text-green-400 mb-2">Top-Stärken</p>
                <ul className="space-y-1">
                  {analysis.topStrengths.map((s, i) => (
                    <li key={i} className="text-xs text-[#f0e6ff] flex gap-1.5">
                      <span className="text-green-400 mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <p className="text-xs font-semibold text-amber-400 mb-2">Verbesserungen</p>
                <ul className="space-y-1">
                  {analysis.improvements.map((s, i) => (
                    <li key={i} className="text-xs text-[#f0e6ff] flex gap-1.5">
                      <span className="text-amber-400 mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-[#db2777] hover:text-[#f472b6] transition-colors font-medium"
          >
            {expanded ? "▲ Alle 12 Dimensionen ausblenden" : "▼ Alle 12 Dimensionen anzeigen"}
          </button>
          {!isDemo && <ExportPDFButton analysis={analysis} />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#2a1f40] p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {analysis.dimensions.map((dim, i) => (
            <DimensionBar
              key={dim.name}
              name={dim.name}
              score={dim.score}
              description={dim.description}
              delay={i * 40}
            />
          ))}
        </div>
      )}
    </div>
  );
}

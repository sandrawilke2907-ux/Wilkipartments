"use client";

import { VideoAnalysis } from "@/lib/types";

interface Props {
  analysis: VideoAnalysis;
}

export default function ExportPDFButton({ analysis }: Props) {
  async function handleExport() {
    const { default: jsPDF } = await import("jspdf");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;
    const margin = 16;
    const contentW = pageW - margin * 2;
    let y = margin;

    const pink = [219, 39, 119] as [number, number, number];
    const dark = [13, 10, 20] as [number, number, number];
    const light = [240, 230, 255] as [number, number, number];
    const muted = [157, 138, 181] as [number, number, number];

    // Header background
    doc.setFillColor(...dark);
    doc.rect(0, 0, pageW, 40, "F");

    // Logo badge
    doc.setFillColor(...pink);
    doc.roundedRect(margin, y, 12, 12, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("CR", margin + 6, y + 7.5, { align: "center" });

    // Title
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Content Radar", margin + 16, y + 8);
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text("KI-Analyse Report", margin + 16, y + 13);

    // Date
    const date = new Date(analysis.analyzedAt).toLocaleDateString("de-DE", {
      day: "2-digit", month: "long", year: "numeric",
    });
    doc.setFontSize(8);
    doc.text(date, pageW - margin, y + 8, { align: "right" });

    y = 48;

    // Video title
    doc.setFillColor(30, 21, 48);
    doc.roundedRect(margin, y, contentW, 20, 3, 3, "F");
    doc.setTextColor(...light);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(analysis.title, contentW - 8);
    doc.text(titleLines, margin + 4, y + 7);

    // Platform badge
    const platformLabel = analysis.platform === "youtube" ? "YouTube" :
      analysis.platform === "tiktok" ? "TikTok" : "Instagram";
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(platformLabel, margin + 4, y + 16);

    y = 74;

    // Viral Score section
    doc.setFillColor(30, 21, 48);
    doc.roundedRect(margin, y, 55, 32, 3, 3, "F");
    doc.setTextColor(...muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("VIRAL SCORE", margin + 27.5, y + 7, { align: "center" });

    const scoreColor: [number, number, number] = analysis.viralScore >= 85 ? [34, 197, 94] :
      analysis.viralScore >= 70 ? [245, 158, 11] : [239, 68, 68];
    doc.setTextColor(...scoreColor);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(String(analysis.viralScore), margin + 27.5, y + 22, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("/ 100", margin + 27.5, y + 29, { align: "center" });

    // Summary
    doc.setFillColor(30, 21, 48);
    doc.roundedRect(margin + 60, y, contentW - 60, 32, 3, 3, "F");
    doc.setTextColor(...muted);
    doc.setFontSize(7);
    doc.text("ZUSAMMENFASSUNG", margin + 62, y + 6);
    doc.setTextColor(...light);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary, contentW - 68);
    doc.text(summaryLines, margin + 62, y + 12);

    y = 112;

    // Strengths & Improvements
    const halfW = (contentW - 4) / 2;

    doc.setFillColor(34, 197, 94, 0.1);
    doc.setFillColor(20, 50, 30);
    doc.roundedRect(margin, y, halfW, 28, 3, 3, "F");
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("TOP-STÄRKEN", margin + 3, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...light);
    doc.setFontSize(8);
    analysis.topStrengths.forEach((s, i) => {
      doc.text(`✓  ${s}`, margin + 3, y + 13 + i * 5);
    });

    doc.setFillColor(50, 35, 10);
    doc.roundedRect(margin + halfW + 4, y, halfW, 28, 3, 3, "F");
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("VERBESSERUNGEN", margin + halfW + 7, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...light);
    doc.setFontSize(8);
    analysis.improvements.forEach((s, i) => {
      doc.text(`→  ${s}`, margin + halfW + 7, y + 13 + i * 5);
    });

    y = 146;

    // Dimensions header
    doc.setTextColor(...muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("12 DIMENSIONEN IM DETAIL", margin, y);
    y += 5;

    // Dimensions grid (2 columns)
    const colW = (contentW - 4) / 2;
    analysis.dimensions.forEach((dim, i) => {
      const col = i % 2;
      const x = margin + col * (colW + 4);
      if (col === 0 && i > 0) y += 18;

      doc.setFillColor(30, 21, 48);
      doc.roundedRect(x, y, colW, 16, 2, 2, "F");

      // Score bar background
      doc.setFillColor(13, 10, 20);
      doc.roundedRect(x + 3, y + 10, colW - 6, 3, 1, 1, "F");

      // Score bar fill
      const barColor: [number, number, number] = dim.score >= 85 ? [34, 197, 94] :
        dim.score >= 70 ? [245, 158, 11] : [239, 68, 68];
      doc.setFillColor(...barColor);
      doc.roundedRect(x + 3, y + 10, (colW - 6) * (dim.score / 100), 3, 1, 1, "F");

      // Name and score
      doc.setTextColor(...light);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text(dim.name, x + 3, y + 7);
      doc.setTextColor(...barColor);
      doc.text(String(dim.score), x + colW - 3, y + 7, { align: "right" });
    });

    y += 22;

    // Footer
    doc.setFillColor(...dark);
    doc.rect(0, 285, pageW, 12, "F");
    doc.setTextColor(...muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Erstellt mit Content Radar", margin, 292);
    doc.text("contentreader.app", pageW - margin, 292, { align: "right" });

    doc.save(`content-radar-${analysis.platform}-${Date.now()}.pdf`);
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-[#1e1530] hover:bg-[#2a1f40] border border-[#2a1f40] text-[#f0e6ff] text-sm font-medium rounded-xl transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
      PDF exportieren
    </button>
  );
}

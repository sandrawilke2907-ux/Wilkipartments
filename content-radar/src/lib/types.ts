export type Platform = "youtube" | "tiktok" | "instagram";

export interface Dimension {
  name: string;
  score: number; // 0–100
  description: string;
}

export interface VideoAnalysis {
  id: string;
  url: string;
  platform: Platform;
  title: string;
  analyzedAt: string;
  viralScore: number; // 0–100
  dimensions: Dimension[];
  summary: string;
  topStrengths: string[];
  improvements: string[];
}

export const DIMENSIONS: { key: string; label: string; icon: string }[] = [
  { key: "hook",         label: "Hook",              icon: "🎣" },
  { key: "storytelling", label: "Storytelling",      icon: "📖" },
  { key: "pacing",       label: "Pacing",            icon: "⚡" },
  { key: "cta",          label: "CTA",               icon: "🎯" },
  { key: "hook_quality", label: "Hook-Qualität",     icon: "✨" },
  { key: "emotional",    label: "Emotionale Trigger", icon: "❤️" },
  { key: "engagement",   label: "Engagement-Muster", icon: "🔄" },
  { key: "visuals",      label: "Visuelle Wirkung",  icon: "👁️" },
  { key: "audio",        label: "Audio / Musik",     icon: "🎵" },
  { key: "relevance",    label: "Relevanz",          icon: "🎯" },
  { key: "authenticity", label: "Authentizität",     icon: "💎" },
  { key: "conversion",   label: "Conversion-Kraft",  icon: "💰" },
];

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
  { key: "hook_quality",   label: "Hook-Qualität",     icon: "🎣" },
  { key: "storytelling",  label: "Storytelling",       icon: "📖" },
  { key: "emotional",     label: "Emotionale Trigger", icon: "❤️" },
  { key: "visuals",       label: "Visuelle Elemente",  icon: "👁️" },
  { key: "engagement",    label: "Engagement-Muster",  icon: "🔄" },
  { key: "cta",           label: "CTA-Stärke",         icon: "🎯" },
  { key: "pacing",        label: "Pacing & Schnitt",   icon: "⚡" },
  { key: "authenticity",  label: "Authentizität",      icon: "💎" },
  { key: "relevance",     label: "Nischen-Relevanz",   icon: "📍" },
  { key: "audio",         label: "Musik & Ton",        icon: "🎵" },
  { key: "text_overlay",  label: "Text-Overlay",       icon: "✍️" },
  { key: "viral",         label: "Viral-Potenzial",    icon: "🚀" },
];

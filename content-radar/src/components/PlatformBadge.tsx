import { VideoAnalysis } from "@/lib/types";

const PLATFORM_CONFIG = {
  youtube: { label: "YouTube", color: "bg-red-600 text-white" },
  tiktok:  { label: "TikTok",  color: "bg-black text-white border border-white/20" },
  instagram: { label: "Instagram", color: "bg-gradient-to-r from-purple-600 to-pink-500 text-white" },
};

export default function PlatformBadge({ platform }: { platform: VideoAnalysis["platform"] }) {
  const { label, color } = PLATFORM_CONFIG[platform];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

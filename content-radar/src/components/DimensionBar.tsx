"use client";

interface Props {
  name: string;
  score: number;
  description: string;
  delay?: number;
}

function barColor(score: number) {
  if (score >= 85) return "bg-green-500";
  if (score >= 70) return "bg-amber-500";
  if (score >= 50) return "bg-orange-500";
  return "bg-red-500";
}

export default function DimensionBar({ name, score, description, delay = 0 }: Props) {
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-[#f0e6ff]">{name}</span>
        <span className="text-sm font-bold text-[#f0e6ff]">{score}</span>
      </div>
      <div className="w-full bg-[#1e1530] rounded-full h-2.5 mb-1">
        <div
          className={`h-2.5 rounded-full ${barColor(score)} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-[#9d8ab5]">{description}</p>
    </div>
  );
}

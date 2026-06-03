"use client";

interface Props {
  score: number;
  size?: number;
}

function scoreColor(score: number) {
  if (score >= 85) return { stroke: "#22c55e", text: "text-green-400" };
  if (score >= 70) return { stroke: "#f59e0b", text: "text-amber-400" };
  if (score >= 50) return { stroke: "#f97316", text: "text-orange-400" };
  return { stroke: "#ef4444", text: "text-red-400" };
}

function scoreLabel(score: number) {
  if (score >= 90) return "Viral-Potenzial";
  if (score >= 80) return "Stark";
  if (score >= 70) return "Gut";
  if (score >= 50) return "Ausbaubar";
  return "Schwach";
}

export default function ViralScoreRing({ score, size = 160 }: Props) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const { stroke, text } = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e1530"
            strokeWidth={12}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${text}`}>{score}</span>
          <span className="text-xs text-[#9d8ab5] mt-0.5">Viral Score</span>
        </div>
      </div>
      <span className={`text-sm font-semibold ${text}`}>{scoreLabel(score)}</span>
    </div>
  );
}

import Link from "next/link";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d0a14]">
      <Nav active="dashboard" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#db2777]/10 border border-[#db2777]/30 rounded-full text-xs text-[#db2777] font-medium mb-4">
            <span className="w-1.5 h-1.5 bg-[#db2777] rounded-full" />
            KI-gestützte Content-Analyse
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#f0e6ff] mb-3">
            Content Radar
          </h1>
          <p className="text-[#9d8ab5] text-lg max-w-xl">
            Verstehe, welcher Content wirklich funktioniert — mit KI-Analyse über 12 Dimensionen und einem klaren Viral Score.
          </p>
        </div>

        <Dashboard />
      </main>
    </div>
  );
}

export function Nav({ active }: { active: "dashboard" | "analyze" }) {
  return (
    <nav className="border-b border-[#1e1530] bg-[#0d0a14]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#db2777] flex items-center justify-center text-white font-bold text-sm">
            CR
          </div>
          <span className="font-bold text-[#f0e6ff]">Content Radar</span>
        </div>

        <div className="flex items-center gap-1">
          <NavLink href="/" label="Dashboard" active={active === "dashboard"} />
          <NavLink href="/analyze" label="Analysieren" active={active === "analyze"} />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-[#db2777]/10 text-[#db2777]"
          : "text-[#9d8ab5] hover:text-[#f0e6ff]"
      }`}
    >
      {label}
    </Link>
  );
}

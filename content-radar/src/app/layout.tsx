import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Radar — Viral Score & KI-Analyse",
  description: "Analysiere deine Videos mit KI über 12 Dimensionen. Verstehe deinen Viral Score und repliziere Erfolge auf TikTok, Instagram und YouTube.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}

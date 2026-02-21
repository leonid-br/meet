import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leo Meet",
  description: "Private room access by password"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-950 text-slate-200 antialiased [background:radial-gradient(1200px_circle_at_20%_10%,#1e293b_0%,#0f172a_55%)]">
        {children}
      </body>
    </html>
  );
}

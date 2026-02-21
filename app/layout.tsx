import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leo Meet",
  description: "Private room access by password"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

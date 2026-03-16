import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your Personal Shopper",
  description: "AI-curated Zara picks for your Soft Summer style",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

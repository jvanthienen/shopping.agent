import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your Personal Shopper",
  description: "AI-curated picks styled for your Soft Summer palette",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-800">{children}</body>
    </html>
  );
}

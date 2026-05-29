import type { Metadata } from "next";
import "./globals.css";
import { displayDomain, getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "OpenAITPM",
  description: `Idea pages that build from GitHub and publish to ${displayDomain} paths.`,
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

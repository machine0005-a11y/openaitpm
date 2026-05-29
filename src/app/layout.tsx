import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenAITPM",
  description: "Idea pages that build from GitHub and publish to openAITpm.com paths."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

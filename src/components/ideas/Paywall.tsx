"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

type PaywallProps = {
  slug: string;
  name: string;
  theme: { from: string; to: string; ink: string };
  priceLabel: string;
  demo: boolean;
};

// Apple Pay glyph (official mark style, drawn inline so no external asset).
function ApplePayMark() {
  return (
    <svg viewBox="0 0 48 20" aria-hidden className="h-5 w-auto" fill="currentColor">
      <path d="M8.6 3.2c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.4-.7 2.2.8 0 1.6-.5 2.1-1.1zM9.3 5.4c-1.2-.1-2.2.7-2.7.7-.6 0-1.4-.6-2.4-.6-1.2 0-2.4.7-3 1.8-1.3 2.2-.3 5.5 1 7.3.6.9 1.3 1.9 2.3 1.8.9 0 1.3-.6 2.4-.6 1.1 0 1.4.6 2.4.6 1 0 1.6-.9 2.2-1.8.7-1 1-2 1-2-.1 0-1.9-.7-1.9-2.9 0-1.8 1.5-2.7 1.5-2.7-.8-1.2-2.1-1.4-2.5-1.4z" />
      <text x="17" y="15" fontSize="13" fontFamily="-apple-system, Helvetica, Arial" fontWeight="600">Pay</text>
    </svg>
  );
}

export function Paywall({ slug, name, theme, priceLabel, demo }: PaywallProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const grad = `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`;

  async function unlock() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug })
      });
      const data = await r.json();
      if (data.url) {
        window.location.href = data.url; // Stripe Checkout (Apple Pay)
      } else if (data.demo) {
        window.location.href = `/api/unlock?slug=${encodeURIComponent(slug)}&demo=1`;
      } else {
        setError(data.error || "Could not start checkout.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: grad }}>
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-40 blur-3xl" style={{ background: theme.to }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full opacity-30 blur-3xl" style={{ background: theme.from }} />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Lock aria-hidden className="h-8 w-8 text-white" />
        </div>

        <p className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ color: theme.ink }}>
          <Sparkles aria-hidden className="h-3.5 w-3.5" />
          Idea locked
        </p>

        <h1 className="mt-5 text-4xl font-black leading-tight text-white drop-shadow-sm md:text-5xl">
          {name}
        </h1>
        <p className="mt-4 text-lg font-medium text-white/90">
          Your idea is built and ready. Unlock the full page for {priceLabel}.
        </p>

        <button
          onClick={unlock}
          disabled={loading}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 text-lg font-semibold text-white shadow-xl transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? (
            "Starting…"
          ) : (
            <>
              <ApplePayMark />
              <span className="ml-1">· Unlock for {priceLabel}</span>
            </>
          )}
        </button>

        <p className="mt-4 text-sm text-white/80">
          One-time payment. Instant access on this device.
        </p>

        {demo ? (
          <p className="mt-3 rounded-lg bg-black/20 px-3 py-2 text-xs font-medium text-white/90">
            Demo mode — no card is charged. Add Stripe keys to take real Apple Pay payments.
          </p>
        ) : null}

        {error ? <p className="mt-3 text-sm font-semibold text-white">{error}</p> : null}

        <Link href="/" className="mt-10 text-sm font-semibold text-white/80 underline-offset-4 hover:underline">
          ← ideamuses.com
        </Link>
      </div>
    </main>
  );
}

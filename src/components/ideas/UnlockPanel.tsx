"use client";

import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";

type UnlockPanelProps = {
  slug: string;
  name: string;
  priceLabel: string;
  demo: boolean;
  theme: { from: string; to: string; ink: string };
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

// Google Pay wordmark, simplified inline (brand-blue G + Pay).
function GooglePayMark() {
  return (
    <svg viewBox="0 0 44 20" aria-hidden className="h-5 w-auto" fill="currentColor">
      <text x="0" y="15" fontSize="13" fontFamily="-apple-system, Helvetica, Arial" fontWeight="600">
        <tspan fill="#4285F4">G</tspan>
        <tspan dx="3">Pay</tspan>
      </text>
    </svg>
  );
}

export function UnlockPanel({ slug, name, priceLabel, demo, theme }: UnlockPanelProps) {
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
        window.location.href = data.url; // Stripe Checkout (Apple Pay / Google Pay)
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
    <div
      className="w-full max-w-md rounded-3xl border border-[var(--line)] p-7 text-center shadow-2xl"
      style={{ background: "var(--background)" }}
    >
      <div
        className="mx-auto grid h-12 w-12 place-items-center rounded-2xl text-white"
        style={{ background: grad }}
      >
        <Lock aria-hidden className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-black tracking-tight">
        You&rsquo;ve seen 13% of {name}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
        The proof points, visual gallery, and full launch roadmap — the other 87% of this page — are one tap away.
      </p>
      <button
        onClick={unlock}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-4 text-base font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
        style={{ background: grad }}
      >
        {loading ? (
          "Starting…"
        ) : (
          <>
            <ApplePayMark />
            <span aria-hidden className="opacity-40">/</span>
            <GooglePayMark />
            <span>Unlock · {priceLabel}</span>
            <ArrowRight aria-hidden className="h-5 w-5" />
          </>
        )}
      </button>
      <p className="mt-3 text-xs text-[var(--ink-soft)]">One-time payment. Instant access on this device.</p>
      {demo ? <p className="mt-1 text-xs font-semibold text-[var(--ink-soft)]">Demo mode — no card is charged.</p> : null}
      {error ? <p className="mt-3 text-sm font-semibold text-red-500">{error}</p> : null}
    </div>
  );
}

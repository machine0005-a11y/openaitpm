"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, Orbit, Sparkles, Zap } from "lucide-react";

type PaywallProps = {
  slug: string;
  name: string;
  theme: { from: string; to: string; ink: string };
  priceLabel: string;
  demo: boolean;
  heroImage?: string | null;
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

export function Paywall({ slug, name, theme, priceLabel, demo, heroImage }: PaywallProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <main className="locked-preview" style={{ "--idea-from": theme.from, "--idea-to": theme.to } as React.CSSProperties}>
      <div aria-hidden className="idea-hero-grid" />
      <div className="locked-preview-wrap">
        <Link href="/" className="idea-brand">
          <span className="idea-brand-mark"><Orbit aria-hidden className="h-4 w-4" /></span>
          ideamuses
        </Link>

        <div className="locked-preview-layout">
          <section className="locked-preview-copy">
            <p className="idea-kicker"><Sparkles aria-hidden className="h-3.5 w-3.5" /> Built from one text</p>
            <h1>{name}</h1>
            <p>Your idea is alive. Open the complete concept, product thesis, proof points, and launch path.</p>

            <div className="locked-offer-card">
              <div className="locked-offer-icon"><Lock aria-hidden className="h-5 w-5" /></div>
              <div>
                <span>Full concept access</span>
                <strong>Unlock the complete page</strong>
              </div>
              <span className="locked-price">{priceLabel}</span>
            </div>

            <button onClick={unlock} disabled={loading} className="locked-pay-button">
              {loading ? "Starting…" : <><ApplePayMark /><span>Unlock for {priceLabel}</span><ArrowRight className="ml-auto h-5 w-5" /></>}
            </button>
            <p className="locked-fine-print">One-time payment. Instant access on this device.</p>
            {demo ? <p className="locked-demo">Demo mode. No card is charged.</p> : null}
            {error ? <p className="mt-3 text-sm font-semibold text-white">{error}</p> : null}
          </section>

          <section className="locked-visual">
            {heroImage ? (
              <Image src={heroImage} alt={`Visual concept for ${name}`} fill priority sizes="(max-width: 900px) 100vw, 50vw" className="object-cover" />
            ) : (
              <div className="idea-fallback-art" aria-label={`Visual concept for ${name}`}>
                <div className="idea-orbit idea-orbit-one" />
                <div className="idea-orbit idea-orbit-two" />
                <div className="idea-art-card idea-art-card-back"><Zap className="h-7 w-7" /></div>
                <div className="idea-art-card idea-art-card-main">
                  <span>PRIVATE PREVIEW / 01</span>
                  <strong>{name}</strong>
                  <div className="idea-art-line" />
                  <small>A complete product direction, ready to explore.</small>
                </div>
              </div>
            )}
            <div className="locked-visual-label"><span>Visual concept</span><strong>Ready to open</strong></div>
          </section>
        </div>
      </div>
    </main>
  );
}

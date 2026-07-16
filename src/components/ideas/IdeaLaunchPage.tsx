import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, CircleDot, Clock3, Sparkles, MessageSquareText, MousePointer2, Orbit, Zap } from "lucide-react";
import type { IdeaPage, IdeaStatus } from "@/lib/ideas/catalog";
import { themeFor } from "@/lib/ideas/theme";
import { UnlockPanel } from "@/components/ideas/UnlockPanel";

const statusCopy: Record<IdeaStatus, string> = {
  draft: "Draft",
  building: "Building",
  preview: "Preview",
  live: "Live"
};

const milestoneIcon = {
  done: CheckCircle2,
  active: CircleDot,
  next: Clock3
};

const TEXT_NUMBER_DISPLAY = "(949) 508-9229";
const TEXT_NUMBER_TEL = "+19495089229";

type IdeaLaunchPageProps = {
  idea: IdeaPage;
  relatedIdeas?: IdeaPage[];
  /** Locked mode: render the REAL page up to the hero + thesis, then stop.
   *  The remaining 87% never reaches the browser — only blurred ghost
   *  placeholders and the unlock card. */
  locked?: boolean;
  unlock?: { priceLabel: string; demo: boolean };
};

export function IdeaLaunchPage({ idea, relatedIdeas = [], locked = false, unlock }: IdeaLaunchPageProps) {
  const t = themeFor(idea.slug);
  const grad = `linear-gradient(135deg, ${t.from} 0%, ${t.to} 100%)`;
  const heroStyle = { "--idea-from": t.from, "--idea-to": t.to, "--idea-glow": t.glow } as React.CSSProperties;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="idea-hero" style={heroStyle}>
        <div aria-hidden className="idea-hero-grid" />
        <div className="relative mx-auto max-w-7xl px-6 py-6 md:px-10 md:py-10">
          <Link
            href="/"
            className="idea-brand"
          >
            <span className="idea-brand-mark"><Orbit aria-hidden className="h-4 w-4" /></span>
            ideamuses
          </Link>

          <div className="idea-hero-layout">
            <div className="idea-hero-copy">
              <div className="flex flex-wrap items-center gap-3">
                <span className="idea-kicker">
                  <Sparkles aria-hidden className="h-3.5 w-3.5" />
                  {statusCopy[idea.status]} concept
                </span>
                <span className="idea-route">ideamuses.com{idea.route}</span>
              </div>
              <h1>{idea.name}</h1>
              <p>{idea.tagline}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href={`sms:${TEXT_NUMBER_TEL}`} className="idea-primary-cta" style={{ color: t.ink }}>
                  <MessageSquareText aria-hidden className="h-5 w-5" />
                  {idea.primaryCta}
                </a>
                <a href="#proof" className="idea-secondary-cta">
                  {idea.secondaryCta}
                  <ArrowRight aria-hidden className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="idea-visual-shell">
              {idea.heroImage ? (
                <Image
                  src={idea.heroImage}
                  alt={`Visual concept for ${idea.name}`}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="idea-fallback-art" aria-label={`Visual concept for ${idea.name}`}>
                  <div className="idea-orbit idea-orbit-one" />
                  <div className="idea-orbit idea-orbit-two" />
                  <div className="idea-art-card idea-art-card-back"><Zap className="h-7 w-7" /></div>
                  <div className="idea-art-card idea-art-card-main">
                    <span>01 / CONCEPT</span>
                    <strong>{idea.name}</strong>
                    <div className="idea-art-line" />
                    <small>{idea.tagline}</small>
                  </div>
                  <MousePointer2 className="idea-pointer" />
                </div>
              )}
              <div className="idea-visual-caption">
                <span>Visual prototype</span>
                <strong>Built from one text</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THESIS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: t.from }}>
              The idea
            </h2>
            <p className="mt-5 max-w-3xl text-2xl font-medium leading-10 text-[var(--foreground)] md:text-3xl">
              {idea.thesis}
            </p>
          </div>
          <div
            className="idea-audience-card self-start p-7 text-white"
            style={{ background: grad, boxShadow: `0 20px 40px -12px ${t.glow}` }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">Who it&rsquo;s for</h3>
            <p className="mt-3 text-lg font-semibold leading-7">{idea.audience}</p>
          </div>
        </div>
      </section>

      {locked ? (
        /* LOCKED BREAK — the visitor sees the REAL page down to here (~13%).
           Everything below is blurred ghost placeholders; the actual proof
           points, gallery, and roadmap are never rendered server-side, so
           nothing leaks via view-source or devtools. */
        <section id="proof" className="relative overflow-hidden border-t border-[var(--line)] bg-[var(--panel)]">
          <div aria-hidden className="mx-auto max-w-6xl select-none px-6 py-16 blur-md">
            <div className="h-4 w-44 rounded-full opacity-60" style={{ background: grad }} />
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-[var(--line)] bg-[var(--background)] p-6">
                  <div className="h-11 w-11 rounded-xl" style={{ background: grad }} />
                  <div className="mt-4 h-3 w-full rounded bg-[var(--panel-muted)]" />
                  <div className="mt-2 h-3 w-4/5 rounded bg-[var(--panel-muted)]" />
                  <div className="mt-2 h-3 w-3/5 rounded bg-[var(--panel-muted)]" />
                </div>
              ))}
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="aspect-[16/9] rounded-2xl bg-[var(--panel-muted)]" />
              <div className="aspect-[16/9] rounded-2xl bg-[var(--panel-muted)]" />
            </div>
            <div className="mt-10 grid gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-2xl border border-[var(--line)] bg-[var(--background)]" />
              ))}
            </div>
          </div>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, transparent 0%, var(--background) 82%)" }}
          />
          <div className="absolute inset-0 grid place-items-center px-6">
            <UnlockPanel
              slug={idea.slug}
              name={idea.name}
              priceLabel={unlock?.priceLabel ?? "$0.99"}
              demo={unlock?.demo ?? true}
              theme={{ from: t.from, to: t.to, ink: t.ink }}
            />
          </div>
        </section>
      ) : (
        <>
      {/* VISUAL GALLERY — AI-generated concept scenes (only when present) */}
      {idea.galleryImages && idea.galleryImages.length > 0 ? (
        <section className="border-t border-[var(--line)] bg-[var(--panel)]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: t.from }}>
              Visual concept
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {idea.galleryImages.map((src, i) => (
                <div
                  key={src}
                  className={`relative overflow-hidden rounded-2xl border border-[var(--line)] ${i === 0 ? "md:col-span-2 aspect-[16/8]" : "aspect-[4/3]"}`}
                  style={{ boxShadow: `0 24px 50px -20px ${t.glow}` }}
                >
                  {/* unoptimized: gallery scenes are served by the unlock-gated
                      /api/scene route, and Next's optimizer proxy strips the
                      visitor's unlock cookie (it would always get a 403).
                      eager: this gallery is the paid reveal — it must simply
                      be there when the freshly-unlocked page opens. */}
                  <Image
                    src={src}
                    alt={`${idea.name} — visual concept ${i + 1}`}
                    fill
                    unoptimized
                    loading="eager"
                    sizes="(max-width: 900px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* PROOF POINTS — big colorful cards */}
      <section id="proof" className="border-y border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-black tracking-tight">Why it works</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {idea.proofPoints.map((point, i) => (
              <div
                key={point}
                className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--background)] p-6 transition hover:-translate-y-1 hover:shadow-xl"
                style={{ boxShadow: `0 1px 0 ${t.from}22` }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ background: grad }}
                />
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl text-lg font-black text-white"
                  style={{ background: grad }}
                >
                  {i + 1}
                </div>
                <p className="mt-4 text-base font-medium leading-7 text-[var(--foreground)]">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-black tracking-tight">What&rsquo;s next</h2>
        <div className="mt-8 grid gap-4">
          {idea.launchChecks.map((check) => {
            const Icon = milestoneIcon[check.state];
            const isDone = check.state === "done";
            const isActive = check.state === "active";
            return (
              <div
                key={check.label}
                className="flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5"
              >
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white"
                  style={{ background: isDone || isActive ? grad : "var(--panel-muted)" }}
                >
                  <Icon aria-hidden className="h-5 w-5" style={{ color: isDone || isActive ? "#fff" : "var(--ink-soft)" }} />
                </div>
                <span className="text-lg font-semibold">{check.label}</span>
                <span
                  className="ml-auto rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                  style={{ background: t.chip, color: t.ink }}
                >
                  {check.state}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden" style={{ background: grad }}>
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-3xl font-black text-white md:text-4xl">Have an idea of your own?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-white/90">
            Text it and get your own page like this one in under a minute.
          </p>
          <a
            href={`sms:${TEXT_NUMBER_TEL}`}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-lg font-bold shadow-lg transition hover:-translate-y-0.5"
            style={{ color: t.ink }}
          >
            <MessageSquareText aria-hidden className="h-5 w-5" />
            Text {TEXT_NUMBER_DISPLAY}
          </a>
        </div>
      </section>

      {/* Related */}
      {relatedIdeas.length > 0 ? (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-black tracking-tight">More ideas people dreamed up</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {relatedIdeas.map((related) => {
              const rt = themeFor(related.slug);
              return (
                <Link
                  key={related.slug}
                  href={related.route}
                  className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="h-2" style={{ background: `linear-gradient(135deg, ${rt.from}, ${rt.to})` }} />
                  <div className="p-5">
                    <h3 className="text-base font-bold leading-6">{related.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--ink-soft)]">
                      {related.tagline}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: rt.from }}>
                      Open
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
        </>
      )}

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center text-sm text-[var(--ink-soft)]">
          ideamuses.com — every idea gets its own page.
        </div>
      </footer>
    </main>
  );
}

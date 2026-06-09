import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot, Clock3, Sparkles, MessageSquareText } from "lucide-react";
import type { IdeaPage, IdeaStatus } from "@/lib/ideas/catalog";
import { themeFor } from "@/lib/ideas/theme";

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
};

export function IdeaLaunchPage({ idea, relatedIdeas = [] }: IdeaLaunchPageProps) {
  const t = themeFor(idea.slug);
  const grad = `linear-gradient(135deg, ${t.from} 0%, ${t.to} 100%)`;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* HERO — full-bleed gradient */}
      <section className="relative overflow-hidden" style={{ background: grad }}>
        {/* decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-40 blur-3xl"
          style={{ background: t.to }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: t.from }}
        />

        <div className="relative mx-auto max-w-5xl px-6 py-16 md:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <ArrowRight aria-hidden className="h-4 w-4 rotate-180" />
            ideamuses.com
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ color: t.ink }}>
              <Sparkles aria-hidden className="h-3.5 w-3.5" />
              {statusCopy[idea.status]}
            </span>
            <span className="rounded-full bg-black/20 px-3 py-1 font-mono text-xs text-white/90">
              ideamuses.com{idea.route}
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight text-white drop-shadow-sm md:text-7xl">
            {idea.name}
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-medium leading-8 text-white/95 md:text-2xl">
            {idea.tagline}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={`sms:${TEXT_NUMBER_TEL}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-bold shadow-lg transition hover:-translate-y-0.5"
              style={{ color: t.ink }}
            >
              <MessageSquareText aria-hidden className="h-5 w-5" />
              {idea.primaryCta}
            </a>
            <a
              href="#proof"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {idea.secondaryCta}
              <ArrowRight aria-hidden className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* THESIS */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: t.from }}>
              The idea
            </h2>
            <p className="mt-4 text-2xl font-medium leading-9 text-[var(--foreground)]">
              {idea.thesis}
            </p>
          </div>
          <div
            className="self-start rounded-2xl p-6 text-white shadow-xl"
            style={{ background: grad, boxShadow: `0 20px 40px -12px ${t.glow}` }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">Who it&rsquo;s for</h3>
            <p className="mt-3 text-lg font-semibold leading-7">{idea.audience}</p>
          </div>
        </div>
      </section>

      {/* PROOF POINTS — big colorful cards */}
      <section id="proof" className="border-y border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
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
      <section className="mx-auto max-w-5xl px-6 py-16">
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

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center text-sm text-[var(--ink-soft)]">
          ideamuses.com — every idea gets its own page.
        </div>
      </footer>
    </main>
  );
}

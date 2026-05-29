import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  ExternalLink,
  GitPullRequestArrow,
  Rocket,
  ShieldCheck
} from "lucide-react";
import type { IdeaPage, IdeaStatus } from "@/lib/ideas/catalog";

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

type IdeaLaunchPageProps = {
  idea: IdeaPage;
  relatedIdeas?: IdeaPage[];
};

export function IdeaLaunchPage({ idea, relatedIdeas = [] }: IdeaLaunchPageProps) {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:px-8 lg:grid-cols-[1fr_360px] lg:py-12">
          <div>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--accent-strong)] transition hover:border-[var(--accent)] hover:bg-white"
              href="/"
            >
              <ArrowRight aria-hidden="true" className="h-4 w-4 rotate-180" />
              OpenAITPM launchpad
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm font-semibold">
                {statusCopy[idea.status]}
              </span>
              <span className="rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--ink-soft)]">
                openAITpm.com{idea.route}
              </span>
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
              {idea.name}
            </h1>
            <p className="mt-5 max-w-3xl text-xl leading-8 text-[var(--ink-soft)]">
              {idea.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                href="#decision-room"
              >
                {idea.primaryCta}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--background)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:bg-white"
                href="#evidence"
              >
                {idea.secondaryCta}
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-[var(--line)] bg-[var(--background)] p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent)] text-white">
                <GitPullRequestArrow aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Ship loop</h2>
                <p className="text-sm text-[var(--ink-soft)]">Check in code, open PR, build page.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 text-sm">
              <Link
                className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-[var(--accent)] hover:bg-white"
                href="#github-flow"
              >
                <span className="block font-semibold">Branch</span>
                <span className="mt-1 block text-[var(--ink-soft)]">{idea.sourceBranch}</span>
              </Link>
              <Link
                className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-[var(--accent)] hover:bg-white"
                href="#github-flow"
              >
                <span className="block font-semibold">Build target</span>
                <span className="mt-1 block text-[var(--ink-soft)]">{idea.repoPath}</span>
              </Link>
              <Link
                className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-[var(--accent)] hover:bg-white"
                href="#launch-checks"
              >
                <span className="block font-semibold">Production route</span>
                <span className="mt-1 block text-[var(--ink-soft)]">/{idea.slug}</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section
        className="mx-auto grid max-w-7xl gap-5 px-5 py-8 md:px-8 lg:grid-cols-[1.1fr_0.9fr]"
        id="decision-room"
      >
        <article className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6">
          <div className="flex items-center gap-3">
            <Rocket aria-hidden="true" className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-semibold">Customer-Ready Thesis</h2>
          </div>
          <p className="mt-4 text-base leading-7 text-[var(--ink-soft)]">{idea.thesis}</p>
          <p className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--background)] p-4 text-sm leading-6">
            <span className="font-semibold">Who it is for: </span>
            {idea.audience}
          </p>
        </article>

        <article className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6" id="evidence">
          <div className="flex items-center gap-3">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-semibold">Proof Points</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {idea.proofPoints.map((point) => (
              <Link
                className="rounded-lg border border-[var(--line)] bg-[var(--background)] p-4 text-sm leading-6 transition hover:border-[var(--accent)] hover:bg-white"
                href="#launch-checks"
                key={point}
              >
                {point}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8 md:px-8" id="launch-checks">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6">
            <h2 className="text-xl font-semibold">Launch Checks</h2>
            <div className="mt-5 grid gap-3">
              {idea.launchChecks.map((check) => {
                const Icon = milestoneIcon[check.state];
                return (
                  <Link
                    className="flex min-h-16 items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--background)] p-4 text-sm transition hover:border-[var(--accent)] hover:bg-white"
                    href="#github-flow"
                    key={check.label}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[var(--accent)]" />
                    <span className="font-semibold">{check.label}</span>
                    <span className="ml-auto rounded-lg bg-[var(--panel-muted)] px-2 py-1 text-xs text-[var(--ink-soft)]">
                      {check.state}
                    </span>
                  </Link>
                );
              })}
            </div>
          </article>

          <article className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6" id="github-flow">
            <h2 className="text-xl font-semibold">GitHub to openAITpm.com</h2>
            <div className="mt-5 grid gap-3 text-sm">
              {[
                "Create a branch named idea/<idea-name>.",
                "Check in the page or catalog update.",
                "GitHub Actions runs lint, typecheck, tests, and build.",
                "The workflow opens or refreshes a pull request into main.",
                "Vercel builds the preview, then production serves openAITpm.com/<idea-name> after merge."
              ].map((step, index) => (
                <Link
                  className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--background)] p-4 transition hover:border-[var(--accent)] hover:bg-white"
                  href="/docs/openaitpm-deployment"
                  key={step}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--foreground)] text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>

      {relatedIdeas.length > 0 ? (
        <section className="mx-auto max-w-7xl px-5 pb-12 md:px-8">
          <h2 className="text-xl font-semibold">Other Idea Pages</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {relatedIdeas.map((related) => (
              <Link
                className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-[var(--accent)] hover:bg-white"
                href={related.route}
                key={related.slug}
              >
                <span className="text-sm font-semibold">{related.name}</span>
                <span className="mt-2 block text-sm leading-6 text-[var(--ink-soft)]">
                  {related.tagline}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

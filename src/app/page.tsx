import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  GitBranch,
  GitPullRequestArrow,
  Globe2,
  Rocket
} from "lucide-react";
import { gates, invariants } from "@/lib/foundation/gates";
import { listIdeaPages } from "@/lib/ideas/catalog";

const statusLabel = {
  complete: "Complete",
  next: "Next",
  planned: "Planned"
};

export default function Home() {
  const ideas = listIdeaPages();

  return (
    <main className="min-h-screen">
      <section className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="max-w-4xl">
            <p className="mb-3 text-sm font-semibold uppercase text-[var(--accent-strong)]">
              OpenAITPM launchpad
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-[var(--foreground)] md:text-6xl">
              Every checked-in idea gets a customer-ready URL.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--ink-soft)]">
              Build from GitHub, open a pull request, pass the build, and serve the idea at
              openAITpm.com/&lt;idea-name&gt;. This is the local prototype of that publishing loop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                href="/enterprise-leadership-context-os"
              >
                Open default idea
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--background)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:bg-white"
                href="/docs/openaitpm-deployment"
              >
                Deployment runbook
                <Globe2 aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-[var(--line)] bg-[var(--background)] p-5">
            <h2 className="text-base font-semibold">Production loop</h2>
            <div className="mt-4 grid gap-3 text-sm">
              {[
                { href: "/docs/openaitpm-deployment#branch-flow", icon: GitBranch, label: "Push idea branch" },
                {
                  href: "/docs/openaitpm-deployment#branch-flow",
                  icon: GitPullRequestArrow,
                  label: "Auto-open PR"
                },
                { href: "/docs/openaitpm-deployment#domain-setup", icon: Globe2, label: "Publish domain route" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-[var(--accent)] hover:bg-white"
                    href={item.href}
                    key={item.label}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5 text-[var(--accent)]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Idea Pages</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              These cards are the current routes that would become openAITpm.com paths after the
              repo is connected to Vercel.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:bg-white"
            href="/new-customer-demo-room"
          >
            Try generated route
            <Rocket aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {ideas.map((idea) => (
            <Link
              className="flex min-h-64 flex-col rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-white"
              href={idea.route}
              key={idea.slug}
            >
              <span className="w-fit rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-xs font-semibold uppercase text-[var(--accent-strong)]">
                {idea.status}
              </span>
              <h3 className="mt-5 text-xl font-semibold leading-7">{idea.name}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{idea.tagline}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-[var(--accent-strong)]">
                Open /{idea.slug}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-12 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="text-2xl font-semibold">Product Invariants</h2>
          <div className="mt-5 grid gap-3">
            {invariants.map((item) => (
              <Link
                className="flex min-h-14 items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 transition hover:border-[var(--accent)] hover:bg-white"
                href="/person-moment-music"
                key={item}
              >
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-[var(--accent)]" />
                <span className="text-sm leading-6 text-[var(--foreground)]">{item}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold">Gate Plan</h2>
          <div className="mt-5 grid gap-3">
            {gates.map((gate) => (
              <Link
                className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-[var(--accent)] hover:bg-white"
                href="/person-moment-music"
                key={gate.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-[var(--accent-strong)]">
                      {gate.id.replace("gate-", "Gate ")}
                    </p>
                    <h3 className="mt-1 text-base font-semibold">{gate.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{gate.outcome}</p>
                  </div>
                  <span className="inline-flex min-w-24 items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold">
                    {statusLabel[gate.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

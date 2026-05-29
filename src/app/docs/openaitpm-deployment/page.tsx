import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Globe2,
  GitBranch,
  GitPullRequestArrow,
  Terminal
} from "lucide-react";

const branchSteps = [
  "Create an idea branch like idea/enterprise-leadership-context-os.",
  "Add or edit src/content/ideas/<idea-name>.json.",
  "Push the branch to GitHub.",
  "GitHub Actions opens or updates a pull request into main.",
  "The workflow runs npm run verify so the PR records build status."
];

const domainSteps = [
  "Create a Vercel project from the GitHub repository.",
  "Enable pull request previews and keep main as the production branch.",
  "Add openAITpm.com and www.openAITpm.com in Vercel.",
  "Point DNS at the exact Vercel records shown in the domain screen.",
  "Merge the PR so production serves openAITpm.com/<idea-name>."
];

const readinessChecks = [
  { label: "Local commit", state: "pass" },
  { label: "Idea content files", state: "pass" },
  { label: "Dynamic route", state: "pass" },
  { label: "Auto-PR workflow", state: "pass" },
  { label: "Vercel config", state: "pass" },
  { label: "GitHub origin remote", state: "missing" }
];

export default function DeploymentRunbookPage() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
          <Link
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--accent-strong)] transition hover:border-[var(--accent)] hover:bg-white"
            href="/"
          >
            <ArrowRight aria-hidden="true" className="h-4 w-4 rotate-180" />
            Launchpad
          </Link>
          <h1 className="mt-8 text-4xl font-semibold leading-tight md:text-6xl">
            OpenAITPM Deployment Runbook
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--ink-soft)]">
            The repo now has the local pieces for GitHub branch builds, automatic pull requests,
            and stable dynamic idea routes. Vercel and DNS are the external account steps.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-5 py-8 md:px-8 lg:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6" id="branch-flow">
          <div className="flex items-center gap-3">
            <GitPullRequestArrow aria-hidden="true" className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-semibold">Branch to PR Flow</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {branchSteps.map((step) => (
              <Link
                className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--background)] p-4 text-sm transition hover:border-[var(--accent)] hover:bg-white"
                href="/enterprise-leadership-context-os"
                key={step}
              >
                <GitBranch aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>{step}</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6" id="domain-setup">
          <div className="flex items-center gap-3">
            <Globe2 aria-hidden="true" className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-semibold">Vercel and Domain</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {domainSteps.map((step) => (
              <Link
                className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--background)] p-4 text-sm transition hover:border-[var(--accent)] hover:bg-white"
                href="/docs/openaitpm-deployment#domain-setup"
                key={step}
              >
                <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>{step}</span>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-5 pb-8 md:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6">
          <div className="flex items-center gap-3">
            <ClipboardCheck aria-hidden="true" className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-semibold">Launch Readiness Audit</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
            Run this any time to see whether the repo is ready for the real
            openAITpm.com publishing loop.
          </p>
          <Link
            className="mt-5 flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--background)] p-4 text-sm font-semibold transition hover:border-[var(--accent)] hover:bg-white"
            href="/docs/openaitpm-deployment#owner-access"
          >
            <Terminal aria-hidden="true" className="h-4 w-4 text-[var(--accent)]" />
            npm run launch:audit
          </Link>
        </article>

        <article className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6">
          <h2 className="text-xl font-semibold">Current State</h2>
          <div className="mt-5 grid gap-3">
            {readinessChecks.map((check) => (
              <Link
                className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--background)] p-4 text-sm transition hover:border-[var(--accent)] hover:bg-white"
                href={check.state === "pass" ? "/enterprise-leadership-context-os" : "#owner-access"}
                key={check.label}
              >
                {check.state === "pass" ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-[var(--accent)]"
                  />
                ) : (
                  <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--clay)]" />
                )}
                <span>{check.label}</span>
                <span className="ml-auto rounded-lg bg-[var(--panel-muted)] px-2 py-1 text-xs text-[var(--ink-soft)]">
                  {check.state}
                </span>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-12 md:px-8" id="owner-access">
        <article className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6">
          <h2 className="text-xl font-semibold">Owner Access Still Required</h2>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
            I can put the repo-side machinery in place here. Creating the GitHub remote, connecting
            Vercel, and changing registrar DNS require account access from the owner of those
            systems.
          </p>
        </article>
      </section>
    </main>
  );
}

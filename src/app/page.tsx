import Link from "next/link";
import { ArrowRight, MessageSquareText, Sparkles, Link2 } from "lucide-react";
import { listIdeaPages } from "@/lib/ideas/catalog";

const TEXT_NUMBER_DISPLAY = "(949) 508-9229";
const TEXT_NUMBER_TEL = "+19495089229";

export default function Home() {
  // Show a few ideas as living proof — capped so the page stays an intro, not a directory.
  const ideas = listIdeaPages().slice(0, 6);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8 md:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--background)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent-strong)]">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            ideamuses.com
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-[var(--foreground)] md:text-6xl">
            Text an idea.<br />Get a page for it.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-soft)]">
            Send any idea as a text message and we&rsquo;ll turn it into its own little web page —
            with a thesis, the people it&rsquo;s for, and why it could work. You get back a link you
            can save, revisit, and share.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3">
            <a
              href={`sms:${TEXT_NUMBER_TEL}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              <MessageSquareText aria-hidden="true" className="h-5 w-5" />
              Text your idea to {TEXT_NUMBER_DISPLAY}
            </a>
            <p className="text-sm text-[var(--ink-soft)]">
              One idea per text. A link comes back in under a minute.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 py-16 md:px-8">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">
          How it works
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: MessageSquareText,
              step: "1",
              title: "Text it",
              body: "Send your idea to the number above. A sentence is plenty — like &ldquo;a tide chart that tells surfers the best hour to paddle out.&rdquo;"
            },
            {
              icon: Sparkles,
              step: "2",
              title: "We build the page",
              body: "Your idea becomes its own page — the promise, who it&rsquo;s for, proof points, and the first milestones to ship it."
            },
            {
              icon: Link2,
              step: "3",
              title: "Save your link",
              body: "It lives at ideamuses.com/your-idea. Bookmark it, send it to a friend, come back to it whenever."
            }
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.step}
                className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--background)] text-sm font-semibold text-[var(--accent-strong)]">
                    {card.step}
                  </span>
                  <Icon aria-hidden="true" className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
                <p
                  className="mt-2 text-sm leading-6 text-[var(--ink-soft)]"
                  dangerouslySetInnerHTML={{ __html: card.body }}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent ideas — living proof, not a dashboard */}
      {ideas.length > 0 && (
        <section className="border-t border-[var(--line)] bg-[var(--panel)]">
          <div className="mx-auto max-w-5xl px-5 py-16 md:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">A few ideas people have dreamed up</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
                Each one started as a single text message.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {ideas.map((idea) => (
                <Link
                  key={idea.slug}
                  href={idea.route}
                  className="flex min-h-44 flex-col rounded-lg border border-[var(--line)] bg-[var(--background)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-white"
                >
                  <h3 className="text-base font-semibold leading-6">{idea.name}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--ink-soft)]">
                    {idea.tagline}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-[var(--accent-strong)]">
                    Open this idea
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8">
        <h2 className="text-3xl font-semibold leading-tight">Have an idea right now?</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">
          Don&rsquo;t let it disappear. Text it and give it a home.
        </p>
        <a
          href={`sms:${TEXT_NUMBER_TEL}`}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--accent-strong)]"
        >
          <MessageSquareText aria-hidden="true" className="h-5 w-5" />
          Text {TEXT_NUMBER_DISPLAY}
        </a>
      </section>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl px-5 py-8 text-center text-sm text-[var(--ink-soft)] md:px-8">
          ideamuses.com — every idea gets its own page.
        </div>
      </footer>
    </main>
  );
}

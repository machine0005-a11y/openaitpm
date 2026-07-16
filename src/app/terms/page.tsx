import type { Metadata } from "next";
import Link from "next/link";
import { PRICE_LABEL } from "@/lib/paywall";

export const metadata: Metadata = {
  title: "Terms, Refunds & Privacy | ideamuses",
  description: "The plain-English terms for ideamuses.com: what $0.99 buys, our instant-refund policy, and what happens to ideas you text."
};

const TEXT_NUMBER_DISPLAY = "(949) 508-9229";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-[var(--foreground)]">
      <Link href="/" className="text-sm font-bold text-[var(--ink-soft)]">← ideamuses</Link>
      <h1 className="mt-6 text-3xl font-black tracking-tight">Terms, refunds &amp; privacy</h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">Plain English, because 99 cents shouldn&rsquo;t need a lawyer.</p>

      <section className="mt-10 space-y-8 text-base leading-7">
        <div>
          <h2 className="text-lg font-bold">The deal</h2>
          <p className="mt-2">
            Unlocking a page is a one-time {PRICE_LABEL} payment. It opens the full page — proof
            points, visual gallery, and launch roadmap — on the device you paid from, for a year.
            Payment is processed by Stripe; we never see or store your card details.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Refunds</h2>
          <p className="mt-2">
            Not happy, for any reason? Text {TEXT_NUMBER_DISPLAY} with the word REFUND and the
            page link, and you&rsquo;ll get your {PRICE_LABEL} back — no questions, and you keep
            access. If you were charged but the page never unlocked, the same applies: text us and
            a human makes it right.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Ideas you text us</h2>
          <p className="mt-2">
            Your idea stays your idea — texting it here gives us permission to build and host a
            concept page for it, nothing more. Want a page taken down? Text {TEXT_NUMBER_DISPLAY}
            with the link and a human will remove it.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">What these pages are</h2>
          <p className="mt-2">
            Pages are AI-generated concept previews built from a single text message. They are
            starting points, not professional, legal, financial, or engineering advice, and any
            numbers on them are illustrative assumptions unless labeled otherwise.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Privacy</h2>
          <p className="mt-2">
            We store the idea you text, the page generated from it, and standard web logs. We
            don&rsquo;t sell your data or your phone number. Payments run entirely through Stripe
            (see their privacy policy for card handling).
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Contact</h2>
          <p className="mt-2">
            One channel, always answered: text {TEXT_NUMBER_DISPLAY}.
          </p>
        </div>
      </section>

      <p className="mt-12 text-xs text-[var(--ink-soft)]">ideamuses.com — every idea gets its own page.</p>
    </main>
  );
}

import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  BookOpenText,
  GitBranch,
  HeartHandshake,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  Users
} from "lucide-react";
import "./marketplace.css";

export const metadata: Metadata = {
  title: "Humanware | Skills with a human source",
  description:
    "A consent-first marketplace for licensed, continuously updated SKILL.md and SOUL.md files."
};

const listings = [
  {
    initials: "K",
    type: "SKILL.md + SOUL.md",
    name: "Krystina's Welcome",
    creator: "Hospitality and human connection",
    description:
      "A warm greeting and conversation framework for restaurants, ordering agents, and customer support.",
    tags: ["Hospitality", "Support", "Restaurant"],
    accent: "coral",
    href: "#krystina-welcome"
  },
  {
    initials: "M",
    type: "SKILL.md",
    name: "The Patient Explainer",
    creator: "Technical education",
    description:
      "Turns complex instructions into calm, step-by-step guidance without making people feel behind.",
    tags: ["Education", "Onboarding", "SaaS"],
    accent: "blue",
    href: "#creator"
  },
  {
    initials: "A",
    type: "SOUL.md",
    name: "The Thoughtful Host",
    creator: "Community facilitation",
    description:
      "Interaction principles for helping new members feel noticed, included, and ready to participate.",
    tags: ["Community", "Events", "Welcome"],
    accent: "gold",
    href: "#creator"
  }
];

export default function SkillSoulMarketplacePage() {
  return (
    <main className="humanware">
      <section className="humanware-hero">
        <nav className="humanware-nav">
          <a className="humanware-logo" href="#top">
            <span><Sparkles aria-hidden="true" /></span>
            Humanware
          </a>
          <div className="humanware-nav-links">
            <a href="#marketplace">Marketplace</a>
            <a href="#how-it-works">How it works</a>
            <a className="humanware-nav-cta" href="#creator">Publish your craft</a>
          </div>
        </nav>

        <div className="humanware-hero-grid" id="top">
          <div className="humanware-hero-copy">
            <p className="humanware-kicker"><Store aria-hidden="true" /> The marketplace for human expertise</p>
            <h1>Great agents need<br /><em>great humans.</em></h1>
            <p className="humanware-lede">
              Discover licensed <code>SKILL.md</code> expertise and consent-based <code>SOUL.md</code>
              interaction principles, created by real people and improved as they learn.
            </p>
            <div className="humanware-actions">
              <a className="humanware-primary" href="#marketplace">Explore the marketplace <ArrowRight aria-hidden="true" /></a>
              <a className="humanware-secondary" href="#creator">Become a creator</a>
            </div>
          </div>

          <div className="humanware-file-stack" aria-label="Example marketplace files">
            <article className="humanware-file humanware-file-back">
              <div className="humanware-file-top">
                <span className="humanware-file-dot" />
                <code>Krystina.SOUL.md</code>
                <BadgeCheck aria-label="Verified human source" />
              </div>
              <p className="humanware-file-label">Interaction principles</p>
              <h2>Everyone should leave feeling better than when they arrived.</h2>
              <div className="humanware-code-lines">
                <span /><span /><span /><span />
              </div>
            </article>
            <article className="humanware-file humanware-file-front">
              <div className="humanware-file-top">
                <span className="humanware-file-dot" />
                <code>Krystina.SKILL.md</code>
                <BadgeCheck aria-label="Verified human source" />
              </div>
              <p className="humanware-file-label">Hospitality skill · v1.8</p>
              <h2>Turn a transaction into a welcome.</h2>
              <ol>
                <li><span>01</span> Notice the person before the order.</li>
                <li><span>02</span> Open with warmth, not a script.</li>
                <li><span>03</span> Make the next step feel easy.</li>
              </ol>
              <footer>
                <span><RefreshCw aria-hidden="true" /> Updated by Krystina</span>
                <strong>Try in your agent →</strong>
              </footer>
            </article>
          </div>
        </div>
      </section>

      <section className="humanware-trust">
        <p>Built for responsible agent systems</p>
        <div>
          <span><ShieldCheck aria-hidden="true" /> Creator consent</span>
          <span><GitBranch aria-hidden="true" /> Version history</span>
          <span><BadgeCheck aria-hidden="true" /> Verified provenance</span>
          <span><RefreshCw aria-hidden="true" /> Continuous updates</span>
        </div>
      </section>

      <section className="humanware-market" id="marketplace">
        <div className="humanware-section-heading">
          <div>
            <p className="humanware-kicker">Featured humanware</p>
            <h2>Borrow the craft.<br />Honor the source.</h2>
          </div>
          <p>
            Preview a version, test it in a sandbox, then license the file and its future
            creator-approved updates for your agent system.
          </p>
        </div>

        <div className="humanware-listings">
          {listings.map((listing) => (
            <article className="humanware-listing" key={listing.name}>
              <div className={`humanware-avatar ${listing.accent}`}>{listing.initials}</div>
              <div className="humanware-listing-type"><Blocks aria-hidden="true" /> {listing.type}</div>
              <h3>{listing.name}</h3>
              <p className="humanware-listing-creator">{listing.creator}</p>
              <p className="humanware-description">{listing.description}</p>
              <div className="humanware-tags">
                {listing.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <div className="humanware-listing-footer">
                <span>Preview available</span>
                <a href={listing.href}>Open listing <ArrowRight aria-hidden="true" /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="humanware-preview" id="krystina-welcome">
        <div className="humanware-preview-copy">
          <p className="humanware-kicker"><BadgeCheck aria-hidden="true" /> Sample listing</p>
          <h2>Krystina&apos;s Welcome</h2>
          <p>
            Try a bounded sample before licensing a creator-approved version. These files
            demonstrate the product format without claiming to represent Krystina herself.
          </p>
          <div className="humanware-preview-actions">
            <a href="/humanware/krystina-welcome/SKILL.md" download>
              Download sample SKILL.md <ArrowRight aria-hidden="true" />
            </a>
            <a href="/humanware/krystina-welcome/SOUL.md" download>
              Download sample SOUL.md <ArrowRight aria-hidden="true" />
            </a>
          </div>
          <small>
            Prototype sample only. A commercial listing would require Krystina&apos;s direct
            participation, review, consent, and licensing terms.
          </small>
        </div>
        <div className="humanware-preview-file">
          <div className="humanware-file-top">
            <span className="humanware-file-dot" />
            <code>Krystina-Welcome/SKILL.md</code>
            <BadgeCheck aria-label="Sample file" />
          </div>
          <pre>{`# Warm Welcome

## Goal
Help a guest feel noticed before asking what they need.

## Interaction
1. Offer one natural welcome.
2. Ask one easy, relevant question.
3. Reflect their answer briefly.
4. Make the next step clear.

## Boundaries
- Never pretend to be Krystina.
- Do not infer sensitive personal details.
- Keep the guest in control.`}</pre>
        </div>
      </section>

      <section className="humanware-model" id="how-it-works">
        <div className="humanware-section-heading light">
          <div>
            <p className="humanware-kicker">A living knowledge license</p>
            <h2>Not a prompt pack.<br />A creator relationship.</h2>
          </div>
          <p>
            Each file stays connected to its human source, so better judgment can become
            better agent behavior without pretending to clone a person.
          </p>
        </div>
        <div className="humanware-steps">
          <article><BookOpenText aria-hidden="true" /><span>01</span><h3>Capture</h3><p>A creator turns journals, stories, and real experience into reviewed guidance.</p></article>
          <article><ShieldCheck aria-hidden="true" /><span>02</span><h3>Verify</h3><p>They approve the public scope, license, allowed uses, and private boundaries.</p></article>
          <article><Blocks aria-hidden="true" /><span>03</span><h3>Try</h3><p>Teams test a bounded version in a sandbox before introducing it to an agent.</p></article>
          <article><RefreshCw aria-hidden="true" /><span>04</span><h3>Subscribe</h3><p>Subscribers receive creator-approved updates, provenance, and version notes.</p></article>
        </div>
      </section>

      <section className="humanware-krystina">
        <div className="humanware-quote-mark">“</div>
        <div>
          <p className="humanware-kicker"><HeartHandshake aria-hidden="true" /> First creator concept</p>
          <blockquote>
            Krystina has a gift for helping people talk, relax, and feel good at a local
            cafe. What if that human craft could improve a restaurant-ordering agent or
            a support system, while Krystina stays credited, in control, and paid?
          </blockquote>
          <p className="humanware-assumption">
            Concept framing only. Krystina’s story, guidance, participation, and licensing
            would require her direct review and consent.
          </p>
        </div>
      </section>

      <section className="humanware-creator" id="creator">
        <div>
          <p className="humanware-kicker"><Users aria-hidden="true" /> For people with a craft worth sharing</p>
          <h2>Your experience can become useful infrastructure.</h2>
        </div>
        <div className="humanware-creator-card">
          <p>Start with one journal entry, story, or lesson. Turn it into a testable file. Keep ownership of your voice and approve every update.</p>
          <a href="mailto:hello@ideamuses.com?subject=Draft%20my%20first%20Humanware%20skill">
            Draft your first skill <ArrowRight aria-hidden="true" />
          </a>
          <small>Prototype only · No purchase or financial action is performed here.</small>
        </div>
      </section>

      <footer className="humanware-footer">
        <a className="humanware-logo" href="#top"><span><Sparkles aria-hidden="true" /></span>Humanware</a>
        <p>A marketplace concept by ideamuses.com</p>
      </footer>
    </main>
  );
}

import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquareText, Orbit } from "lucide-react";
import styles from "./page.module.css";

const textNumber = "+19495089229";

const proof = [
  ["Founder speed", "Turn a hunch into a page you can send to buyers, partners, or investors."],
  ["Agency leverage", "Produce first-pass concepts before a workshop ends, then polish the winners."],
  ["Creator offers", "Package courses, services, communities, and experiments as testable pages."],
  ["Operator clarity", "Make internal tools and workflow ideas visible enough for fast decisions."]
];

const plans = [
  {
    label: "Starter",
    name: "Idea Page",
    price: "$49",
    cadence: "per prototype",
    description: "For a fast first version that makes an idea visible.",
    cta: "Request starter",
    body: "I want the Idea Page package for: ",
    items: ["One live prototype URL", "Offer, audience, and workflow framing", "Mobile-ready single page", "Useful for quick buyer feedback"]
  },
  {
    label: "Best first offer",
    name: "Polished Launch Page",
    price: "$299",
    cadence: "per page",
    description: "For founders or sellers who want the prototype shaped into a credible pitch surface.",
    cta: "Request polished",
    body: "I want a Polished Launch Page for: ",
    featured: true,
    items: ["Stronger visual direction and copy", "Pricing, objections, and CTA structure", "More complete product narrative", "Ready for direct outreach"]
  },
  {
    label: "Recurring",
    name: "Idea Lab",
    price: "$199",
    cadence: "per month",
    description: "For repeat testers who want a stream of ideas turned into concrete pages.",
    cta: "Request lab",
    body: "I want the Idea Lab plan. My use case: ",
    items: ["Multiple prototype runs each month", "Saved gallery of experiments", "Revision queue for promising pages", "Good fit for agencies and creators"]
  }
];

function smsHref(body: string) {
  return `sms:${textNumber}?body=${encodeURIComponent(body)}`;
}

export default function IdeamusesMoneyPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/" className={styles.brand}>
            <span className={styles.mark}><Orbit aria-hidden size={16} /></span>
            <span>ideamuses</span>
          </Link>
          <div className={styles.navlinks}>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#offer">Start</a>
          </div>
        </nav>

        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Text an idea. Get a live prototype.</span>
            <h1>Launch the page before the thought cools off.</h1>
            <p>
              ideamuses turns raw ideas into reachable prototype websites for founders,
              agencies, creators, and operators who need something real to show today.
            </p>
            <div className={styles.actions}>
              <a className={`${styles.btn} ${styles.primary}`} href={smsHref("Build a prototype for: ")}>
                <MessageSquareText aria-hidden size={20} />
                Text the idea
              </a>
              <a className={`${styles.btn} ${styles.secondary}`} href="#pricing">
                See packages
                <ArrowRight aria-hidden size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <h2>Built for selling, testing, and showing.</h2>
            <p>
              Most ideas die as notes, decks, or vague chats. ideamuses makes the first
              version concrete: a named page, a clear offer, useful interface details,
              and a URL someone can open.
            </p>
          </div>
          <div className={styles.proofGrid} aria-label="Core value points">
            {proof.map(([title, copy], index) => (
              <article className={styles.proof} key={title}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.band}`} id="how">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <h2>The workflow is deliberately simple.</h2>
            <p>
              No intake portal, no prompt engineering, no blank-page setup. Send the idea.
              Machine One turns it into a page and verifies the route before a URL goes out.
            </p>
          </div>
          <div className={styles.workflow}>
            {[
              ["Text the raw idea", "One sentence is enough. The system extracts the product shape, audience, and first useful interface."],
              ["Prototype gets built", "Role-based product, design, systems, growth, finance, and risk review tightens the page before publish."],
              ["Reachable URL ships", "The page is checked before delivery, so the result is not a screenshot or promise. It is a live page."]
            ].map(([title, copy], index) => (
              <article className={styles.step} key={title}>
                <div className={styles.num}>{index + 1}</div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="pricing">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <h2>Simple ways to make the machine pay.</h2>
            <p>
              Use these as public packages or sales anchors. Real billing still requires
              John to set up and approve payment tools manually.
            </p>
          </div>
          <div className={styles.pricing}>
            {plans.map((plan) => (
              <article className={`${styles.plan} ${plan.featured ? styles.featured : ""}`} key={plan.name}>
                <div className={styles.label}>{plan.label}</div>
                <h3>{plan.name}</h3>
                <p className={styles.price}>{plan.price} <small>{plan.cadence}</small></p>
                <p>{plan.description}</p>
                <ul>
                  {plan.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <a className={`${styles.btn} ${plan.featured ? styles.primary : styles.line}`} href={smsHref(plan.body)}>
                  {plan.cta}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="offer">
        <div className={styles.wrap}>
          <div className={styles.offer}>
            <div className={styles.offerVisual} role="img" aria-label="Phone idea becoming a laptop prototype" />
            <div className={styles.offerCopy}>
              <h2>Today&apos;s sales move: publish examples, then sell outcomes.</h2>
              <p className={styles.muted}>
                The website is the storefront, but the cash comes from direct offers.
                Send prospects a specific promise: &quot;Text me your idea and I&apos;ll send
                back a live prototype page.&quot;
              </p>
              <ul className={styles.checklist}>
                {[
                  "Create three public demo pages for common buyers: founder MVP, agency concept, creator offer.",
                  "Send concise direct messages to people who already pay for landing pages, content, design, or MVP validation.",
                  "Upsell the best prototype into a polished launch page, custom domain, analytics, or ongoing idea lab."
                ].map((item) => (
                  <li key={item}>
                    <span className={styles.check}><CheckCircle2 aria-hidden size={14} /></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.actions}>
                <a className={`${styles.btn} ${styles.dark}`} href={smsHref("Build my first demo page for: ")}>
                  Build a demo
                </a>
                <Link className={`${styles.btn} ${styles.line}`} href="/sites">View gallery</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

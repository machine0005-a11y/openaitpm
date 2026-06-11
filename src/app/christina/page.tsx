import type { Metadata } from "next";
import { ArrowDown, Globe2, HeartHandshake, MessageCircleHeart, Utensils } from "lucide-react";
import { ChristinaExperience } from "./ChristinaExperience";
import "./christina.css";

export const metadata: Metadata = {
  title: "Christina | Hospitality that feels like home",
  description:
    "Christina turns a life shaped by Greece, Italy, family, restaurants, and service into warmer customer experiences."
};

const principles = [
  {
    icon: HeartHandshake,
    title: "Make people feel seen",
    body: "The best welcome begins before a guest has to ask. Notice the small things, listen carefully, and respond with care."
  },
  {
    icon: Utensils,
    title: "Turn service into hospitality",
    body: "From the first greeting to the final goodbye, every moment can feel thoughtful, clear, and personal."
  },
  {
    icon: MessageCircleHeart,
    title: "Recover with humanity",
    body: "When something goes wrong, honesty and attention can rebuild trust and create a lasting relationship."
  }
];

export default function ChristinaPage() {
  return (
    <main className="christina-page">
      <section className="christina-hero">
        <nav>
          <a className="christina-mark" href="#top" aria-label="Christina home">C.</a>
          <a className="christina-nav-link" href="#ask">
            Ask Christina <ArrowDown aria-hidden="true" />
          </a>
        </nav>
        <div className="christina-hero-content" id="top">
          <p className="christina-kicker"><Globe2 aria-hidden="true" /> A life between cultures. A gift for welcome.</p>
          <h1>Hospitality that<br /><em>feels like home.</em></h1>
          <p className="christina-lede">
            Christina draws from a life shaped by Greece, Italy, raising two children,
            restaurants, and real customer moments to help people create experiences
            guests remember.
          </p>
          <a className="christina-primary" href="#ask">Ask for Christina&apos;s guidance</a>
        </div>
        <div className="christina-hero-note">
          <span>Her belief</span>
          <p>Everyone deserves to feel welcome.</p>
        </div>
      </section>

      <section className="christina-story">
        <p className="christina-section-label">The Christina way</p>
        <h2>Experience becomes instinct.<br />Instinct becomes exceptional service.</h2>
        <p>
          Christina&apos;s story is still being written in her own words. This space is designed
          to grow with her, turning true experiences and lessons into useful guidance without
          inventing the details.
        </p>
      </section>

      <section className="christina-principles">
        {principles.map(({ icon: Icon, title, body }, index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <Icon aria-hidden="true" />
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <div id="ask">
        <ChristinaExperience />
      </div>

      <footer className="christina-footer">
        <div>
          <span className="christina-mark">C.</span>
          <p>Warmth is a skill. Welcome is a choice.</p>
        </div>
        <p>Christina on ideamuses.com</p>
      </footer>
    </main>
  );
}

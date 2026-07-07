"use client";

import {
  Bell,
  Bone,
  Check,
  ChevronRight,
  Dog,
  Gift,
  HeartPulse,
  MessageCircle,
  PackageCheck,
  PawPrint,
  Sparkles,
  Star,
  Trophy,
  Truck,
  Zap
} from "lucide-react";
import { useMemo, useState } from "react";

const customers = [
  {
    name: "Maya Chen",
    pet: "Biscuit",
    breed: "Corgi",
    status: "Refill due",
    mood: "Loyal",
    value: "$148/mo",
    next: "Chicken + pumpkin arrives Friday",
    score: 92,
    color: "sun",
    history: ["6 on-time deliveries", "Loves crunchy toppers", "Birthday in 9 days"]
  },
  {
    name: "Andre Brooks",
    pet: "Nova",
    breed: "Maine Coon",
    status: "Win-back",
    mood: "At risk",
    value: "$84/mo",
    next: "Skipped salmon recipe twice",
    score: 58,
    color: "rose",
    history: ["Price concern", "Prefers pate texture", "Open support ticket"]
  },
  {
    name: "Priya Shah",
    pet: "Moose",
    breed: "Lab mix",
    status: "Upgrade ready",
    mood: "Happy",
    value: "$213/mo",
    next: "Add dental chews to monthly box",
    score: 97,
    color: "mint",
    history: ["High protein plan", "Two-dog household", "Shared referral code"]
  }
];

const missions = [
  {
    icon: MessageCircle,
    title: "Send Nova a flavor reset",
    reward: "+120 joy",
    body: "Offer a pate sampler and ask which texture she liked best."
  },
  {
    icon: Gift,
    title: "Add Biscuit's birthday treat",
    reward: "+80 joy",
    body: "Drop a lamb topper into the Friday box with a handwritten card."
  },
  {
    icon: PackageCheck,
    title: "Confirm Moose's chew bundle",
    reward: "+95 joy",
    body: "Upgrade without adding another checkout step for Priya."
  }
];

const feed = [
  "Biscuit finished the bowl 5 days in a row",
  "Nova's parent opened the sampler offer",
  "Moose unlocked dental bundle eligibility",
  "Route 17 has 100% on-time delivery confidence"
];

export function PetFoodCrmExperience() {
  const [selected, setSelected] = useState(0);
  const [completed, setCompleted] = useState<number[]>([1]);
  const [pulse, setPulse] = useState(false);
  const active = customers[selected];

  const joy = useMemo(() => 420 + completed.length * 95, [completed.length]);
  const allDone = completed.length === missions.length;

  function completeMission(index: number) {
    if (!completed.includes(index)) {
      setCompleted((items) => [...items, index]);
      setPulse(true);
      window.setTimeout(() => setPulse(false), 900);
    }
  }

  return (
    <main className="pf-page">
      <section className="pf-shell">
        <aside className="pf-sidebar" aria-label="TailTreat navigation">
          <a className="pf-logo" href="#overview" aria-label="TailTreat CRM">
            <span><PawPrint aria-hidden="true" /></span>
            TailTreat
          </a>
          <nav className="pf-nav">
            {[
              ["Overview", Bone],
              ["Customers", Dog],
              ["Messages", MessageCircle],
              ["Rewards", Trophy],
              ["Delivery", Truck]
            ].map(([label, Icon]) => (
              <a className={label === "Customers" ? "active" : ""} href="#overview" key={label as string}>
                <Icon aria-hidden="true" />
                <span>{label as string}</span>
              </a>
            ))}
          </nav>
          <div className="pf-streak">
            <Trophy aria-hidden="true" />
            <strong>{allDone ? "Perfect run" : "7-day streak"}</strong>
            <span>{allDone ? "All pet-parent moments cleared." : "2 more wins keep the streak alive."}</span>
          </div>
        </aside>

        <section className="pf-workspace" id="overview">
          <header className="pf-topbar">
            <div>
              <p className="pf-kicker"><Sparkles aria-hidden="true" /> dopamine CRM for pet food teams</p>
              <h1>Every save should feel like a tiny victory.</h1>
            </div>
            <div className={`pf-joy ${pulse ? "pulse" : ""}`} aria-live="polite">
              <Zap aria-hidden="true" />
              <span>{joy}</span>
              <small>joy points</small>
            </div>
          </header>

          <section className="pf-metrics" aria-label="Daily operating metrics">
            {[
              ["Bowls saved", "34", "+12 today", HeartPulse],
              ["Refills protected", "$4.8k", "weekly MRR", PackageCheck],
              ["Delight drops", "18", "birthday + rescue", Gift],
              ["NPS heat", "71", "rising", Star]
            ].map(([label, value, note, Icon]) => (
              <article key={label as string}>
                <Icon aria-hidden="true" />
                <span>{label as string}</span>
                <strong>{value as string}</strong>
                <small>{note as string}</small>
              </article>
            ))}
          </section>

          <section className="pf-grid">
            <div className="pf-panel pf-customers">
              <div className="pf-panel-head">
                <div>
                  <p>Live customer pack</p>
                  <h2>Prioritized by emotion, revenue, and pet need.</h2>
                </div>
                <Bell aria-hidden="true" />
              </div>
              <div className="pf-customer-list">
                {customers.map((customer, index) => (
                  <button
                    className={selected === index ? "selected" : ""}
                    key={customer.name}
                    onClick={() => setSelected(index)}
                    type="button"
                  >
                    <span className={`pf-avatar ${customer.color}`}><Dog aria-hidden="true" /></span>
                    <span>
                      <strong>{customer.pet}</strong>
                      <small>{customer.name} · {customer.breed}</small>
                    </span>
                    <em>{customer.status}</em>
                  </button>
                ))}
              </div>
            </div>

            <div className="pf-panel pf-profile">
              <div className="pf-pet-card">
                <span className={`pf-avatar large ${active.color}`}><Dog aria-hidden="true" /></span>
                <div>
                  <p>{active.name}</p>
                  <h2>{active.pet}</h2>
                  <span>{active.breed} · {active.value}</span>
                </div>
                <strong>{active.score}</strong>
              </div>
              <div className="pf-health">
                <span style={{ width: `${active.score}%` }} />
              </div>
              <div className="pf-next">
                <PackageCheck aria-hidden="true" />
                <div>
                  <span>Best next action</span>
                  <strong>{active.next}</strong>
                </div>
              </div>
              <div className="pf-tags">
                {active.history.map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>

            <div className="pf-panel pf-missions">
              <div className="pf-panel-head">
                <div>
                  <p>Reward loop</p>
                  <h2>Micro-missions make retention addictive.</h2>
                </div>
                <Sparkles aria-hidden="true" />
              </div>
              {missions.map(({ icon: Icon, title, reward, body }, index) => {
                const done = completed.includes(index);
                return (
                  <button className={done ? "done" : ""} key={title} onClick={() => completeMission(index)} type="button">
                    <Icon aria-hidden="true" />
                    <span>
                      <strong>{title}</strong>
                      <small>{body}</small>
                    </span>
                    <em>{done ? <Check aria-label="Completed" /> : reward}</em>
                  </button>
                );
              })}
            </div>

            <div className="pf-panel pf-feed">
              <div className="pf-panel-head">
                <div>
                  <p>Happy signals</p>
                  <h2>Make the good news visible.</h2>
                </div>
                <HeartPulse aria-hidden="true" />
              </div>
              {feed.map((item) => (
                <div className="pf-feed-row" key={item}>
                  <span><Sparkles aria-hidden="true" /></span>
                  <p>{item}</p>
                  <ChevronRight aria-hidden="true" />
                </div>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

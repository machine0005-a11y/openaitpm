export type GateStatus = "complete" | "next" | "planned";

export type Gate = {
  id: string;
  name: string;
  status: GateStatus;
  outcome: string;
};

export const gates: Gate[] = [
  {
    id: "gate-0",
    name: "Foundation",
    status: "complete",
    outcome: "Next.js, TypeScript, Tailwind, Prisma, docs, CI, and verification scripts."
  },
  {
    id: "gate-1",
    name: "Auth + Moments",
    status: "next",
    outcome: "Baseline auth, moment CRUD, persistence, and privacy enforcement."
  },
  {
    id: "gate-2",
    name: "MusicSpec",
    status: "planned",
    outcome: "Strict schema-validated JSON planner with fallback defaults."
  },
  {
    id: "gate-3",
    name: "Async Audio",
    status: "planned",
    outcome: "Queue, worker, stub MusicGenProvider, real playable audio files, and playback UI."
  },
  {
    id: "gate-4",
    name: "Feed + Share",
    status: "planned",
    outcome: "Moment feed, public share pages, story card PNG, QR/link flow."
  },
  {
    id: "gate-5",
    name: "Hardening",
    status: "planned",
    outcome: "Rate limits, delete flows, monitoring hooks, deploy runbook, smoke tests."
  }
];

export const invariants = [
  "Atomic unit: person-moment.",
  "Raw journal text is private by default.",
  "Public surfaces expose safe summaries only.",
  "MusicSpec JSON is planned before audio rendering.",
  "Distribution is a feed of moments, not a playlist catalog."
];

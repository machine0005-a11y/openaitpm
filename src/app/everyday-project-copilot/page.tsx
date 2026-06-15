import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  FileText,
  Fingerprint,
  Inbox,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const journal = [
  ["Changed", "The hotel moved check-in to 4:00 PM.", "Travel confirmation"],
  ["Due today", "Approve the airport ride plan.", "Family calendar"],
  ["This week", "Maya needs a passport photo by Friday.", "School email"],
  ["Blocked", "Dinner reservation needs a headcount.", "Group message"],
];

const plan = [
  ["01", "Product", "A calm, permissioned AI project assistant for everyday life. It turns selected emails, calendars, files, screenshots, messages, and notes into one source-backed project picture and a useful Daily Journal."],
  ["02", "Journey", "Create a project → answer six grounding questions → choose sources → review the first project twin → receive Daily Journals → approve any reminder or external action."],
  ["03", "V1 wedge", "Start with family trips and school applications. Support pasted text, uploads, Gmail, Calendar, and Drive. Generate tasks, dates, decisions, risks, a Daily Journal, and drafts. No autonomous actions."],
  ["04", "Screens", "Home / projects, six-question project setup, source picker, project room, Daily Journal, source detail, draft review, and approval queue."],
  ["05", "Google first", "Google OAuth, Gmail read-only with user-selected messages or labels, Calendar read-only with selected calendars, Drive file picker, and Docs export/read access."],
  ["06", "AI behavior", "Read first. Cite every claim. Separate confirmed facts from inference. Ask one simple question when a critical field is missing. Draft actions, then wait for explicit approval."],
  ["07", "Memory", "Project goal, people, roles, tasks, deadlines, events, documents, decisions, reminders, risks, next steps, source links, provenance, confidence, timestamps, and approval history."],
  ["08", "Reminders", "Short, specific, source-linked, and previewed before sending. Show recipient, channel, timing, exact message, reason, and the source that triggered it."],
  ["09", "Privacy", "Project-scoped permissions, least-privilege OAuth, visible source access, revocation, deletion, audit history, encryption, no training on private content by default, and no cross-project leakage."],
  ["10", "Build plan", "Weeks 1–2: project/source model and uploads. 3–4: extraction and project twin. 5–6: Daily Journal and citations. 7–8: Google connectors and approval queue. 9–10: pilot, security review, and reliability."],
];

const mvp = [
  "Create and share a project",
  "Add selected sources",
  "Extract tasks, dates, people, and decisions",
  "Generate a source-backed Daily Journal",
  "Show confirmed vs. inferred facts",
  "Draft reminders and emails",
  "Require approval for every action",
  "Keep a visible activity and source log",
];

export default function EverydayProjectCopilotPage() {
  return (
    <main className="min-h-screen bg-[#f5f2ea] text-[#15221c]">
      <section className="relative overflow-hidden border-b border-[#15221c]/10 bg-[#10251d] text-white">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-7 md:px-10 md:pb-28">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-[.18em]">
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#b7f36b]" /> ideamuses</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-white/60">Product plan · v1</span>
          </div>
          <div className="mt-20 grid items-center gap-14 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-[#b7f36b]">Everyday Project Copilot</p>
              <h1 className="mt-5 max-w-3xl text-6xl font-black leading-[.9] tracking-[-.065em] md:text-8xl">
                Life has projects. Give them a memory.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-white/68">
                A permissioned AI assistant that turns the information people choose into a living project twin, a clear Daily Journal, and actions they approve.
              </p>
              <a href="#plan" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#b7f36b] px-6 py-4 text-sm font-black text-[#10251d]">
                Open the product plan <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/8 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl md:rotate-2">
              <div className="rounded-[1.5rem] bg-[#faf8f2] p-5 text-[#15221c] md:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.18em] text-[#607168]">Daily Journal</p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight">Family trip · Monday</h2>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[#e6f8ce]"><CalendarDays className="h-5 w-5" /></div>
                </div>
                <div className="mt-6 space-y-3">
                  {journal.map(([label, text, source]) => (
                    <div key={label} className="rounded-2xl border border-[#15221c]/10 bg-white p-4">
                      <div className="flex gap-3">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-[#3f7a20]" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-[#607168]">{label}</p>
                          <p className="mt-1 font-bold">{text}</p>
                          <p className="mt-2 flex items-center gap-1 text-xs text-[#607168]"><FileText className="h-3 w-3" /> {source}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[#10251d] px-5 py-4 text-left text-sm font-black text-white">
                  Review 2 suggested actions <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#3f7a20]">The product wedge</p>
            <h2 className="mt-4 text-5xl font-black leading-[.95] tracking-[-.055em]">Read first.<br />Act later.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <Inbox className="h-7 w-7 text-[#3f7a20]" />
              <h3 className="mt-5 text-xl font-black">Read mode</h3>
              <p className="mt-2 leading-7 text-[#607168]">Summarize, organize, find dates and tasks, cite sources, draft outputs, and suggest next steps.</p>
            </div>
            <div className="rounded-3xl border-2 border-[#ef9b56] bg-[#fff5e9] p-6">
              <LockKeyhole className="h-7 w-7 text-[#a95314]" />
              <h3 className="mt-5 text-xl font-black">Act mode</h3>
              <p className="mt-2 leading-7 text-[#76533a]">Send, schedule, notify, or update only after the user reviews and explicitly approves the exact action.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="plan" className="border-y border-[#15221c]/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#3f7a20]">Simple product plan</p>
            <h2 className="mt-4 text-5xl font-black tracking-[-.055em]">Ten decisions that make it buildable.</h2>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-[#15221c]/10 bg-[#15221c]/10 md:grid-cols-2">
            {plan.map(([number, title, copy]) => (
              <article key={number} className="bg-white p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-[#3f7a20]">{number}</span>
                  <h3 className="text-lg font-black">{title}</h3>
                </div>
                <p className="mt-4 leading-7 text-[#607168]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-[#10251d] p-7 text-white md:p-10">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#b7f36b]">First release</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.05em]">A narrow MVP people can trust.</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {mvp.map((item) => (
                <div key={item} className="flex gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-bold">
                  <Check className="h-4 w-4 shrink-0 text-[#b7f36b]" /> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] bg-[#e6f8ce] p-7 md:p-10">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#3f7a20]">Core trust contract</p>
            <div className="mt-8 space-y-6">
              {[
                [Fingerprint, "Every fact has provenance", "Show where it came from, when it arrived, who added it, and whether it is confirmed or inferred."],
                [ShieldCheck, "Permissions stay visible", "Users select sources, can revoke access, and can see exactly what each project can read."],
                [CircleAlert, "Uncertainty becomes one question", "Never quietly invent a date, owner, location, decision, or source."],
                [Users, "Actions belong to people", "Always show who will receive an action and require approval before it leaves the app."],
              ].map(([Icon, title, copy]) => {
                const ItemIcon = Icon as typeof Fingerprint;
                return (
                  <div key={title as string} className="flex gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white"><ItemIcon className="h-5 w-5" /></div>
                    <div><h3 className="font-black">{title as string}</h3><p className="mt-1 leading-7 text-[#526249]">{copy as string}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#ef9b56]">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <MessageSquareText className="mx-auto h-9 w-9" />
          <h2 className="mt-5 text-5xl font-black tracking-[-.06em]">The north-star experience</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-8 text-[#55351e]">
            Open one page and know what changed, what matters now, who owns the next move, and which source proves it.
          </p>
        </div>
      </section>
    </main>
  );
}

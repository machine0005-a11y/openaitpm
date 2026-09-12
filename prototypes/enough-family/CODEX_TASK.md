# Codex handoff: finish and publish Enough Family

The owner requested an actual build/deploy, not another product plan. Source files in this directory are the staged implementation derived from the conversation's earlier single-module Worker, now separated into browser assets, arithmetic, Worker and tests. This handoff does not assume Codex can see the private ChatGPT conversation.

## Deliverable
A verified HTTPS Cloudflare prototype URL that the owner can send to anyone. Public demo works without Instagram login, payment, child details or an LLM key.

## UX
Screenshot -> local preview -> optional OCR -> human-confirmed evidence -> Who/What/When/Where/Why -> chosen time target -> three actions. Also support pasted Instagram reference links and sample data. Share only the empty public app URL. Native iPhone receiving from Share Sheet and device enforcement are future capabilities; do not misrepresent web sharing as a native receiver.

## Current work to do
1. Inspect this branch and follow the scoped AGENTS.md. Keep all changes inside this prototype unless an essential project-specific workflow is approved.
2. Run npm test in this directory. Earlier conversation claimed tests passed, but no retained execution log accompanies this handoff. Rerun rather than repeat those claims.
3. Resolve dependencies and add a reproducible package-lock.json. Review npm audit results. Prefer self-hosted pinned OCR assets if practical; disclose downloads while external assets remain.
4. Run Wrangler dry-run and launch locally. Test the full interface at phone sizes in Chromium and WebKit, with real OCR on a generated nonpersonal Screen Time-style fixture. Measure limitations; no invented accuracy percentages.
5. Fix any discovered bugs, including invalidation of old results, family authorization state, OCR cancellation/timeout and low-memory handling. Manual entry must remain usable if OCR is blocked.
6. Verify no image POST or analytics request occurs. Check external OCR requests, links, CSP, keyboard/focus behavior, reduced motion and clearing. Do not collect diagnoses or children's private data.
7. Inspect existing authorized Cloudflare access without printing secrets. Confirm the intended account. Deploy a new isolated enough-family-prototype Worker; preserve all existing sites, routes and DNS.
8. If no authorization is available, stop only the remote-deploy step, explain exactly what is needed securely, and leave build/test artifacts ready. Do not borrow credentials from unrelated projects.
9. If deployment succeeds, GET / and /health from the public URL, test sample mode and sharing on that origin, and return the real URL plus commit, test summary and limitations. Never invent a workers.dev address.

## Test arithmetic
90 min/day baseline, 30 min/day target, 120 min/day leisure => 420 potential min/week, 66.6667% target reduction, 90 leisure min/day left. This is potential, not measured improvement. 630 min/full-week yields the same daily baseline. Partial-week total requires a different explicit denominator and must not silently divide by seven.

## Research boundary
The previous research was targeted, not a review of 5,000 papers and 10,000 websites. Do not repeat that unfulfilled coverage claim. Useful primary references:
- https://about.fb.com/news/2024/11/introducing-recommendations-reset-instagram/
- https://developer.apple.com/videos/play/wwdc2021/10123/
- https://developer.apple.com/videos/play/wwdc2022/110336/
- https://developers.cloudflare.com/workers/static-assets/
- https://github.com/naptha/tesseract.js/blob/master/docs/api.md

## Status on handoff
Branch-staged code and runnable test definitions. No live URL, no confirmed Codex execution, no verified Cloudflare deployment. Do not call an unrelated launchpad/Vercel preview the Enough Cloudflare prototype.

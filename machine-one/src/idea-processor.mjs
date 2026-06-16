#!/usr/bin/env node
/**
 * idea-processor: turn a one-line idea into a published page on the openaitpm
 * Next.js project, then iMessage the URL back to the sender.
 *
 *   node idea-processor.mjs --idea "a flashcard app for sat vocab" --reply-to +14843260020
 *
 * Uses the `claude` CLI (Claude Code) for generation — no API key needed,
 * relies on the user's existing OAuth login.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_DIR = '/Users/machine1/Documents/New project';
const IDEAS_DIR = join(PROJECT_DIR, 'src', 'content', 'ideas');
const BASE_URL = process.env.OPENAITPM_BASE_URL || 'https://www.ideamuses.com';
const IMSG = '/opt/homebrew/bin/imsg';
const CLAUDE = '/opt/homebrew/bin/claude';
const MODEL = process.env.CLAUDE_MODEL || 'sonnet';

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const idea = arg('--idea');
const replyTo = arg('--reply-to');
const noText = argv.includes('--no-text');
const noCommit = argv.includes('--no-commit');

if (!idea) {
  console.error('Usage: idea-processor --idea "<one-line idea>" [--reply-to +1XXXXXXXXXX] [--no-text] [--no-commit]');
  process.exit(1);
}

// --- 1. slug (matches scripts/create-idea.mjs exactly) ---
function normalizeIdeaSlug(input) {
  const slug = input
    .trim().toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return slug || 'untitled-idea';
}
function formatNameFromSlug(slug) {
  return slug.split('-').filter(Boolean).map(p => p[0].toUpperCase() + p.slice(1)).join(' ');
}
let slug = normalizeIdeaSlug(idea);
const name = formatNameFromSlug(slug);
if (existsSync(join(IDEAS_DIR, `${slug}.json`))) {
  slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
}
const writtenPath = join(IDEAS_DIR, `${slug}.json`);

// --- 2. Claude CLI generates the IdeaPage content ---
const schema = {
  type: 'object',
  properties: {
    tagline: { type: 'string', maxLength: 110 },
    thesis: { type: 'string' },
    audience: { type: 'string', maxLength: 140 },
    primaryCta: { type: 'string', maxLength: 24 },
    secondaryCta: { type: 'string', maxLength: 24 },
    proofPoints: {
      type: 'array', minItems: 3, maxItems: 3,
      items: { type: 'string' }
    },
    nextMilestone: { type: 'string', maxLength: 60 },
    futureMilestone: { type: 'string', maxLength: 60 }
  },
  required: ['tagline','thesis','audience','primaryCta','secondaryCta','proofPoints','nextMilestone','futureMilestone'],
  additionalProperties: false
};

const prompt = `Turn this one-line product idea into structured launch-page content for ideamuses.com/${slug}.

Idea: "${idea}"
Name: ${name}

Be specific and concrete — use real numbers, real workflows, real personas. Do not hedge with "could" or "might". Write like the product already exists.

- tagline: one sentence, customer-facing promise, < 110 chars
- thesis: 2-3 sentences: problem, target user, workflow change, proof it could be real
- audience: specific buyer/user/segment, < 140 chars
- primaryCta / secondaryCta: 2-3 word imperative CTAs (e.g. "Open dashboard", "Invite teammate")
- proofPoints: exactly 3 distinct one-sentence proof points, each concrete
- nextMilestone: the next concrete milestone to ship
- futureMilestone: a future milestone after that

Return ONLY the JSON object matching the schema.`;

console.log(`[claude] generating slug=${slug}`);
const t0 = Date.now();
const r = spawnSync(CLAUDE, [
  '--print',
  '--model', MODEL,
  '--output-format', 'json',
  '--json-schema', JSON.stringify(schema),
  '--disable-slash-commands',
  prompt
], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });

if (r.status !== 0) {
  console.error('[claude] failed:', (r.stderr || r.stdout).slice(-1000));
  process.exit(r.status || 1);
}

// claude --output-format json wraps the result; extract the structured text
let raw = r.stdout.trim();
let inner;
try {
  const outer = JSON.parse(raw);
  // shape: { type: 'result', result: '...json string...', ... }
  inner = JSON.parse(outer.result ?? outer.text ?? outer.content ?? raw);
} catch {
  // fallback: raw is the JSON we want
  inner = JSON.parse(raw);
}

console.log(`[claude] done in ${Date.now() - t0}ms`);

const ideaPage = {
  slug,
  name,
  status: 'preview',
  tagline: inner.tagline,
  thesis: inner.thesis,
  audience: inner.audience,
  sourceBranch: `idea/${slug}`,
  repoPath: `src/content/ideas/${slug}.json`,
  primaryCta: inner.primaryCta,
  secondaryCta: inner.secondaryCta,
  proofPoints: inner.proofPoints,
  launchChecks: [
    { label: 'Idea page generated', state: 'done' },
    { label: inner.nextMilestone, state: 'active' },
    { label: inner.futureMilestone, state: 'next' }
  ]
};

// --- 3. write the file ---
mkdirSync(IDEAS_DIR, { recursive: true });
writeFileSync(writtenPath, JSON.stringify(ideaPage, null, 2) + '\n');
console.log(`[write] ${writtenPath}`);

// --- 4. optional commit + push ---
if (!noCommit) {
  const ran = (cmd, args) => spawnSync(cmd, args, { cwd: PROJECT_DIR, encoding: 'utf8' });
  const remote = ran('git', ['remote']).stdout.trim();
  if (remote) {
    ran('git', ['add', `src/content/ideas/${slug}.json`]);
    const c = ran('git', ['commit', '-m', `idea: add ${name}`]);
    console.log(`[git] commit: ${(c.stdout || c.stderr).trim()}`);
    const p = ran('git', ['push']);
    console.log(`[git] push: ${((p.stdout || '') + (p.stderr || '')).trim().split('\n').slice(-3).join(' | ')}`);
  } else {
    console.log('[git] no remote configured — written locally only');
  }
}

// --- 5. iMessage the URL ---
const url = `${BASE_URL.replace(/\/$/, '')}/${slug}`;
console.log(`[url] ${url}`);

if (replyTo && !noText) {
  const s = spawnSync(IMSG, ['send', '--to', replyTo, '--text', url, '--service', 'imessage', '--json'], { encoding: 'utf8' });
  console.log(`[imsg] ${(s.stdout || s.stderr).trim()}`);
  if (s.status !== 0) process.exit(s.status);
}

console.log(JSON.stringify({ slug, name, url, file: writtenPath }, null, 2));

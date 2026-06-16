#!/usr/bin/env node
/**
 * publish-idea: take a fully-formed IdeaPage JSON on stdin, write it to the
 * Next.js project, optionally commit+push, and iMessage the URL back.
 *
 * Usage:
 *   node publish-idea.mjs --slug habit-tracker --name "Habit Tracker" \
 *        --reply-to +14843260020 \
 *        --base-url https://seed-hopefully-limited-representation.trycloudflare.com \
 *        < idea.json
 *
 * The JSON on stdin must have fields: tagline, thesis, audience, primaryCta,
 * secondaryCta, proofPoints (array of 3), nextMilestone, futureMilestone.
 * slug/name are forced from args.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_DIR = '/Users/machine1/Documents/New project';
const IDEAS_DIR = join(PROJECT_DIR, 'src', 'content', 'ideas');
const IMSG = '/opt/homebrew/bin/imsg';

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const slug = arg('--slug');
const name = arg('--name');
const replyTo = arg('--reply-to');
const baseUrl = arg('--base-url') || 'https://www.ideamuses.com';
const noText = argv.includes('--no-text');
const noCommit = argv.includes('--no-commit');

if (!slug || !name) {
  console.error('Usage: publish-idea --slug <slug> --name "<Name>" [--reply-to +1...] [--base-url ...] < idea.json');
  process.exit(1);
}

const stdin = readFileSync(0, 'utf8').trim();
const i = JSON.parse(stdin);

for (const k of ['tagline','thesis','audience','primaryCta','secondaryCta','proofPoints','nextMilestone','futureMilestone']) {
  if (!(k in i)) { console.error(`missing field: ${k}`); process.exit(1); }
}
if (!Array.isArray(i.proofPoints) || i.proofPoints.length !== 3) {
  console.error('proofPoints must be a 3-element array');
  process.exit(1);
}

const ideaPage = {
  slug,
  name,
  status: 'preview',
  tagline: i.tagline,
  thesis: i.thesis,
  audience: i.audience,
  sourceBranch: `idea/${slug}`,
  repoPath: `src/content/ideas/${slug}.json`,
  primaryCta: i.primaryCta,
  secondaryCta: i.secondaryCta,
  proofPoints: i.proofPoints,
  launchChecks: [
    { label: 'Idea page generated', state: 'done' },
    { label: i.nextMilestone, state: 'active' },
    { label: i.futureMilestone, state: 'next' }
  ]
};

mkdirSync(IDEAS_DIR, { recursive: true });
const out = join(IDEAS_DIR, `${slug}.json`);
writeFileSync(out, JSON.stringify(ideaPage, null, 2) + '\n');
console.log(`[write] ${out}`);

if (!noCommit) {
  const run = (cmd, a) => spawnSync(cmd, a, { cwd: PROJECT_DIR, encoding: 'utf8' });
  const remote = run('git', ['remote']).stdout.trim();
  if (remote) {
    run('git', ['add', `src/content/ideas/${slug}.json`]);
    const c = run('git', ['commit', '-m', `idea: add ${name}`]);
    console.log(`[git] ${(c.stdout || c.stderr).trim()}`);
    const p = run('git', ['push']);
    console.log(`[git] ${((p.stdout || '') + (p.stderr || '')).trim().split('\n').slice(-3).join(' | ')}`);
  } else {
    console.log('[git] no remote — local-only');
  }
}

const url = `${baseUrl.replace(/\/$/, '')}/${slug}`;
console.log(`[url] ${url}`);

if (replyTo && !noText) {
  const s = spawnSync(IMSG, ['send','--to',replyTo,'--text',url,'--service','imessage','--json'], { encoding: 'utf8' });
  console.log(`[imsg] ${(s.stdout || s.stderr).trim()}`);
}

console.log(JSON.stringify({ slug, name, url, file: out }, null, 2));

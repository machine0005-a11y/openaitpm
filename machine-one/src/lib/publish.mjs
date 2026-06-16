// publish.mjs — write an idea page to the Next.js project and ship it.
// Single responsibility: given an idea string, produce a live URL.
//   1. slug + name           (text.mjs)
//   2. generate content      (generate.mjs: claude → template fallback)
//   3. write JSON locally    (durable source record for later refinement)
//   4. verify dynamic route  (production renders every valid idea slug)
//   5. return the reachable URL
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { config, log } from './config.mjs';
import { toSlug, toTitle } from './text.mjs';
import { generateContent } from './generate.mjs';
import { generateVisuals } from './visual.mjs';

function uniqueSlug(base) {
  let slug = base;
  if (existsSync(join(config.ideasDir, `${slug}.json`))) {
    const suffix = `-${Date.now().toString(36).slice(-4)}`;
    slug = `${base.slice(0, 80 - suffix.length).replace(/-+$/, '')}${suffix}`;
  }
  return slug;
}

// Commit the idea JSON + any generated images, then push so Vercel deploys them.
// publicImagePaths are site-absolute (e.g. /ideas/<slug>/hero.webp); on disk they
// live under public/. Non-fatal: if there's no git remote we keep the local files.
function gitShip(slug, name, publicImagePaths = []) {
  const git = (args) => spawnSync('git', args, { cwd: config.projectDir, encoding: 'utf8' });
  if (!git(['remote']).stdout.trim()) {
    log('[git] no remote — wrote locally only');
    return false;
  }
  const files = [`src/content/ideas/${slug}.json`, ...publicImagePaths.map((p) => `public${p}`)];
  const ident = ['-c', 'user.name=machine0005-a11y', '-c', 'user.email=machine0005@gmail.com'];
  git(['add', ...files]);
  git([...ident, 'commit', '-m', `idea: ${name}`]);
  // Absorb the remote's other commits first, then push.
  git([...ident, 'pull', '--no-rebase', '--no-edit']);
  const p = git(['push']);
  const ok = p.status === 0;
  log('[git]', ok ? `pushed (${files.length} files)` : 'push failed: ' + (p.stderr || '').split('\n').slice(-2)[0]);
  return ok;
}

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function verifyLive(url, expectedName) {
  for (let attempt = 1; attempt <= config.verifyAttempts; attempt += 1) {
    const response = spawnSync('curl', ['-fsSL', '--max-time', '8', url], { encoding: 'utf8' });
    if (response.status === 0 && response.stdout.includes(expectedName)) return true;
    sleep(config.verifyDelayMs);
  }
  throw new Error(`domain route: page not reachable at ${url}`);
}

// Returns { slug, name, url, source }.
export function publishIdea(idea) {
  const name = toTitle(toSlug(idea));
  const slug = uniqueSlug(toSlug(idea));

  const { content, source, council } = generateContent(idea, slug, name);

  // Generate multiple images (hero + scenes) BEFORE sending the URL. This tries
  // real generation and falls back cleanly to no-image the instant any limit is hit.
  const { heroImage, galleryImages } = generateVisuals({
    slug,
    name,
    tagline: content.tagline,
    thesis: content.thesis,
    audience: content.audience,
    visualPrompt: content.visualPrompt,
    proofPoints: content.proofPoints,
  });

  const page = {
    slug,
    name,
    status: 'preview',
    tagline: content.tagline,
    thesis: content.thesis,
    audience: content.audience,
    sourceBranch: `idea/${slug}`,
    repoPath: `src/content/ideas/${slug}.json`,
    primaryCta: content.primaryCta,
    secondaryCta: content.secondaryCta,
    proofPoints: content.proofPoints,
    heroImage,
    galleryImages,
    launchChecks: [
      { label: 'Idea page generated', state: 'done' },
      { label: content.nextMilestone, state: 'active' },
      { label: content.futureMilestone, state: 'next' },
    ],
  };

  mkdirSync(config.ideasDir, { recursive: true });
  writeFileSync(join(config.ideasDir, `${slug}.json`), JSON.stringify(page, null, 2) + '\n');
  log('[write]', slug);

  // Commit + push the JSON and any generated images so the live site serves the
  // full rich page (static images must be deployed; the dynamic route alone only
  // renders a generated fallback for brand-new slugs). Non-fatal if no remote.
  const allImages = [heroImage, ...galleryImages].filter(Boolean);
  gitShip(slug, name, allImages);

  const url = `${config.baseUrl}/${slug}`;
  verifyLive(url, name);
  log('[route] reachable', url, `(${allImages.length} images)`);
  return { slug, name, url, source, council, images: allImages };
}

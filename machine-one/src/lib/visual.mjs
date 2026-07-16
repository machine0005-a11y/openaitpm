// visual.mjs — generate MULTIPLE durable images for an idea page before the URL
// is sent back, so pages feel rich and humanistic.
//
// Resilience contract (per the owner's instruction): try real generation, but
// the moment ANY call hits a limit/quota/billing/network error, STOP generating
// and fall back to "no image" gracefully. Image generation never blocks the URL.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { config, log } from './config.mjs';

// Error substrings that mean "stop trying for this run" — billing/quota/rate.
const STOP_ERRORS = /billing_hard_limit|insufficient_quota|exceeded your current quota|rate limit|rate_limit|429|billing/i;

// ---------------------------------------------------------------------------
// Circuit breaker: once image gen hits a hard cap / out-of-quota, TRIP the
// breaker so we stop firing doomed API calls. Future ideas go straight to
// non-hero (no wasted call, no latency). After a cooldown we allow ONE re-probe,
// so the instant credit is added it auto-recovers — no code change, no restart.
// ---------------------------------------------------------------------------
function breakerState() {
  try { return JSON.parse(readFileSync(config.imageBreakerFile, 'utf8')); }
  catch { return { trippedAt: 0 }; }
}
function tripBreaker(reason) {
  try { writeFileSync(config.imageBreakerFile, JSON.stringify({ trippedAt: Date.now(), reason })); } catch {}
  log('[visual] circuit breaker TRIPPED — pausing image gen', String(reason).slice(0, 80));
}
function resetBreaker() {
  try { writeFileSync(config.imageBreakerFile, JSON.stringify({ trippedAt: 0 })); } catch {}
}
// Returns true if we should attempt generation. When tripped, only allow a
// single re-probe once the cooldown has elapsed.
function breakerAllowsAttempt() {
  const { trippedAt } = breakerState();
  if (!trippedAt) return true; // healthy
  const elapsed = Date.now() - trippedAt;
  if (elapsed >= config.imageBreakerCooldownMs) {
    log('[visual] breaker cooldown elapsed — re-probing image gen');
    return true; // one probe; if it fails it'll re-trip below
  }
  return false; // still cooling down → skip, go non-hero
}

// Generate ONE image. Returns { ok, publicPath, repoFile } on success, or
// { ok:false, stop:true } when we should abandon further generation this run.
// gated=true stores the image OUTSIDE public/ (src/content/idea-images/) so it
// is only served through the unlock-checking /api/scene route — paid content
// must not be fetchable by guessing static URLs.
function generateOne({ slug, file, prompt, gated = false }) {
  const payload = JSON.stringify({
    model: config.openaiImageModel,
    prompt,
    size: '1536x1024',
    quality: config.openaiImageQuality,
    output_format: 'webp',
    output_compression: 82,
  });

  const res = spawnSync('curl', [
    '-sS', '--max-time', '180',
    'https://api.openai.com/v1/images/generations',
    '-H', `Authorization: Bearer ${process.env.OPENAI_API_KEY}`,
    '-H', 'Content-Type: application/json',
    '-d', payload,
  ], { encoding: 'utf8', maxBuffer: 48 * 1024 * 1024 });

  // Network / curl failure with no body — treat as stop (don't hammer a broken endpoint).
  if (res.status !== 0 && !res.stdout) {
    log('[visual] curl failed; stopping', String(res.stderr || '').slice(-160));
    return { ok: false, stop: true };
  }

  let body;
  try { body = JSON.parse(res.stdout); } catch { return { ok: false, stop: true }; }

  if (body.error) {
    const msg = body.error.message || body.error.code || 'unknown error';
    const stop = STOP_ERRORS.test(msg) || STOP_ERRORS.test(body.error.code || '');
    log('[visual] api error' + (stop ? ' (stopping)' : ''), String(msg).slice(0, 120));
    return { ok: false, stop, reason: msg };
  }

  const b64 = body.data?.[0]?.b64_json;
  if (!b64) return { ok: false, stop: true };

  const repoDir = gated
    ? join('src', 'content', 'idea-images', slug)
    : join('public', 'ideas', slug);
  const dir = join(config.projectDir, repoDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, file), Buffer.from(b64, 'base64'));
  log('[visual] generated', `${slug}/${file}${gated ? ' (gated)' : ''}`);
  return {
    ok: true,
    publicPath: gated ? `/api/scene/${slug}/${file}` : `/ideas/${slug}/${file}`,
    repoFile: `${repoDir}/${file}`,
  };
}

// Generate a hero + a few section images. Returns:
//   { heroImage: string|null, galleryImages: string[] }
// Always succeeds (never throws); returns whatever was generated before any
// limit was hit. Empty when generation is unavailable.
export function generateVisuals({ slug, name, tagline, thesis, audience, visualPrompt, proofPoints = [] }) {
  if (!process.env.OPENAI_API_KEY) {
    log('[visual] skipped (OPENAI_API_KEY not set)', slug);
    return { heroImage: null, galleryImages: [], repoFiles: [] };
  }

  // Circuit breaker: if we recently hit the hard cap, skip image gen entirely
  // (no wasted doomed call) and ship non-hero. Auto-re-probes after cooldown.
  if (!breakerAllowsAttempt()) {
    log('[visual] breaker open — skipping image gen (non-hero)', slug);
    return { heroImage: null, galleryImages: [], repoFiles: [] };
  }

  const base = [
    visualPrompt,
    'Award-winning editorial photograph. Shot on a 35mm prime, shallow depth of field, cinematic natural light, rich but true-to-life color.',
    'A real, believable human moment or a tangible real-world object as the hero — photoreal, never illustrated, never an abstract gradient.',
    'Composition leaves clean negative space for overlaid text. Magazine-cover quality; the kind of image someone would proudly share.',
    'Absolutely no words, letters, numbers, logos, UI, watermarks, or borders anywhere in the frame.',
  ].filter(Boolean).join('\n');

  // The shots to attempt, in priority order. Hero first — if even the hero hits
  // a limit, we return all-null and the page uses its built-in fallback art.
  const shots = [
    { file: 'hero.webp', gated: false, prompt: `Hero image for "${name}". ${tagline}\n${base}` },
    { file: 'scene-1.webp', gated: true, prompt: `A candid real-life moment showing the core experience of "${name}" in use by a person. ${thesis || tagline}\n${base}` },
    { file: 'scene-2.webp', gated: true, prompt: `A close, tangible detail shot of the key object or surface central to "${name}", for ${audience || 'its users'}. ${proofPoints[0] || ''}\n${base}` },
  ];

  let heroImage = null;
  const galleryImages = [];
  const repoFiles = [];

  for (const shot of shots) {
    const r = generateOne({ slug, file: shot.file, prompt: shot.prompt, gated: shot.gated });
    if (r.ok) {
      repoFiles.push(r.repoFile);
      if (shot.file === 'hero.webp') heroImage = r.publicPath;
      else galleryImages.push(r.publicPath);
    } else if (r.stop) {
      // A hard-cap/quota/rate error: trip the breaker so the NEXT idea skips
      // image gen until cooldown, then fall back to non-hero for this one too.
      tripBreaker(r.reason || 'image limit reached');
      log('[visual] limit/err hit — falling back to non-hero', slug);
      break;
    }
  }

  // Any success means generation is healthy again → clear a previously-tripped breaker.
  if (heroImage || galleryImages.length) resetBreaker();

  return { heroImage, galleryImages, repoFiles };
}

// Back-compat: keep the single-hero export some callers may still use.
export function generateVisual(args) {
  return generateVisuals(args).heroImage;
}

import slugify from 'slugify';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const STOPWORDS = new Set([
  'a','an','the','and','or','but','for','of','to','in','on','at','by',
  'with','from','that','this','it','is','are','was','were','be','i','my',
  'we','our','you','your','they','them'
]);

const RESERVED = new Set([
  '', 'api', 'webhook', 'health', 'admin', 'sites', 'static',
  'favicon.ico', 'robots.txt', 'sitemap.xml'
]);

/**
 * Turn raw SMS text into a short, URL-safe slug.
 *  - lowercase, hyphenated
 *  - strips stopwords when the result is still meaningful
 *  - capped at 60 chars
 *  - de-duped against existing slugs in sitesDir by appending -2, -3, ...
 */
export function ideaToSlug(text, sitesDir) {
  const raw = slugify(text || '', { lower: true, strict: true, trim: true });
  if (!raw) return uniquify('idea', sitesDir);

  const words = raw.split('-').filter(Boolean);
  const filtered = words.filter(w => !STOPWORDS.has(w));
  let candidate = (filtered.length >= 2 ? filtered : words).join('-').slice(0, 60);

  // Don't end on a dangling hyphen after slicing
  candidate = candidate.replace(/-+$/, '');

  if (!candidate || RESERVED.has(candidate)) candidate = 'idea';
  return uniquify(candidate, sitesDir);
}

function uniquify(base, sitesDir) {
  if (!sitesDir) return base;
  let slug = base;
  let n = 2;
  while (existsSync(join(sitesDir, slug))) {
    slug = `${base}-${n++}`;
    if (n > 9999) { slug = `${base}-${Date.now()}`; break; }
  }
  return slug;
}

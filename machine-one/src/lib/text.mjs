// text.mjs — pure string helpers. No I/O, trivially testable.

// iMessage embeds control chars and the U+FFFC attachment placeholder; these
// break the claude CLI and pollute slugs, so scrub them first.
export function cleanText(s) {
  return (s || '')
    .replace(/[\u0000-\u001f\u007f\ufffc\ufffd]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// "Pool day at the Promenade!" -> "pool-day-at-the-promenade"
export function toSlug(input) {
  const slug = cleanText(input)
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return slug || 'untitled-idea';
}

// "pool-day-at-the-promenade" -> "Pool Day At The Promenade"
export function toTitle(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map(p => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}

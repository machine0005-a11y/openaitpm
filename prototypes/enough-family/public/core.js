// All calculations run locally. Potential time recovered is a scenario, not a result.
export function numberIn(value, name, max) {
  if (!['number', 'string'].includes(typeof value) ||
      (typeof value === 'string' && !value.trim())) {
    throw new Error(name + ' is required.');
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > max) {
    throw new Error(name + ' must be between 0 and ' + max + '.');
  }
  return n;
}
export function calculate(input) {
  if (!['day', 'daily-average', 'week-total'].includes(input.period)) {
    throw new Error('Confirm whether this is daily use or a full seven-day total.');
  }
  if (input.confirmed !== true) throw new Error('Please confirm the values and period.');
  if (!['self', 'family'].includes(input.who)) throw new Error('Choose who the plan is for.');
  if (input.who === 'family' && input.agreed !== true) {
    throw new Error('Use this prototype with your teenager, not for secret monitoring.');
  }
  const total = numberIn(input.usage, 'Usage minutes', input.period === 'week-total' ? 10080 : 1440);
  const baseline = input.period === 'week-total' ? total / 7 : total;
  const available = numberIn(input.available, 'Available leisure minutes/day', 1440);
  const target = numberIn(input.target, 'Target minutes/day', 1440);
  if (target > available) throw new Error('The target exceeds available daily leisure time.');
  const gap = Math.max(0, baseline - target);
  return {
    baseline, target, gap, weeklyPotential: 7 * gap,
    targetReductionPercent: baseline > 0 ? 100 * gap / baseline : 0,
    remainingLeisureAtTarget: available - target,
    actualSavings: null
  };
}
export function cleanInstagramLink(raw) {
  let u;
  try { u = new URL(String(raw).trim()); } catch { throw new Error('Paste a complete HTTPS Instagram link.'); }
  if (u.protocol !== 'https:' || !['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(u.hostname) || u.username || u.password || u.port) {
    throw new Error('Use an HTTPS instagram.com link, not a password or another website.');
  }
  u.hostname = 'www.instagram.com';
  u.search = ''; u.hash = '';
  return u.href;
}
export function durationCandidates(text) {
  const found = [];
  for (const line of String(text).split(/\r?\n/)) {
    const pattern = /(?<![\d.,\-])\b(?:(\d{1,3})\s*(?:hours?|hrs?|h)\b\s*(?:(\d{1,2})\s*(?:minutes?|mins?|m)\b)?|(\d{1,5})\s*(?:minutes?|mins?|m)\b)/gi;
    for (const match of line.matchAll(pattern)) {
      if (match[1] !== undefined && Number(match[2] || 0) >= 60) continue;
      const minutes = match[1] !== undefined ? Number(match[1]) * 60 + Number(match[2] || 0) : Number(match[3]);
      if (minutes <= 10080) found.push({ minutes, context: line.trim().slice(0, 160) });
      if (found.length >= 12) return found;
    }
  }
  return found;
}
export function makePlan(input, result) {
  const feed = input.why === 'friends'
    ? ['Keep the people. Skip the detour.', 'Use Following or Favorites when your goal is catching up with people you chose. This guides a setting; it does not change it for you.']
    : ['Give clear feedback.', 'Use Not Interested for unwanted recommendations. Like, save or share only when you genuinely want to. No invented watch-time thresholds or automated engagement.'];
  const stop = result.gap > 0
    ? ['Set your stopping point.', 'Your chosen target is ' + result.target + ' minutes/day. Configure an iPhone App Limit and agree an extension policy before opening Instagram. This website cannot enable device restrictions.']
    : ['Keep a plan that already fits.', 'Your reported usage is within your target. Check whether it feels worthwhile instead of automatically tightening the limit.'];
  const boundary = input.when === 'bedtime' || input.where === 'bedroom'
    ? ['Give bedtime a clear ending.', 'Choose a final check-in and a place to leave your phone. Preserve essential communication; this is an optional routine, not medical treatment.']
    : input.when === 'work' || input.where === 'desk'
      ? ['Protect one focus period.', 'Choose a defined work or homework block, then a deliberate social check-in. Notice whether use simply moves into another feed.']
      : ['Make leaving easy.', 'Choose one purpose before opening the app. When it is done, close the app before deciding whether another session is worthwhile.'];
  return [feed, stop, boundary];
}
export function formatMinutes(n) {
  const m = Math.round(n);
  return m >= 60 ? Math.floor(m / 60) + 'h ' + m % 60 + 'm' : m + 'm';
}

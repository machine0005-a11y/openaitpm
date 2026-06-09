import crypto from "node:crypto";

// ---------------------------------------------------------------------------
// Paywall: every idea page is locked until the visitor pays $0.99.
// Unlock state is a per-slug, HMAC-signed cookie — no database required.
// ---------------------------------------------------------------------------

export const PRICE_CENTS = 99;
export const PRICE_LABEL = "$0.99";
export const CURRENCY = "usd";

// Cookie name for a given idea slug.
export function unlockCookieName(slug: string): string {
  return `idea_unlock_${slug}`;
}

function secret(): string {
  return (
    process.env.PAYWALL_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "ideamuses-dev-paywall-secret-change-me"
  );
}

// A signed token proves "this slug was paid for". Format: <exp>.<hmac>
export function signUnlock(slug: string, ttlDays = 365): string {
  const exp = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  const payload = `${slug}.${exp}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex").slice(0, 32);
  return `${exp}.${sig}`;
}

export function verifyUnlock(slug: string, token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = crypto
    .createHmac("sha256", secret())
    .update(`${slug}.${exp}`)
    .digest("hex")
    .slice(0, 32);
  // constant-time compare
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

// True when real Stripe payment is configured. When false, the site runs in
// DEMO mode: the unlock button still works so the full flow is testable, but it
// clearly says "demo" and takes no money.
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_"));
}

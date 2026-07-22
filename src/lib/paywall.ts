import crypto from "node:crypto";
import { PERSONAL_PAY_URL_DEFAULT, APPLE_CASH_NUMBER_DEFAULT, APPLE_CASH_DISPLAY } from "@/config/pay";

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

const DEV_FALLBACK_SECRET = "ideamuses-dev-paywall-secret-change-me";

function secret(): string {
  const configured =
    process.env.PAYWALL_SECRET || process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (configured) return configured;
  // Fail closed in production: never sign unlock cookies with a publicly-known
  // string, or anyone could forge a free unlock and never pay. In dev we allow
  // the fallback so the flow is testable without secrets.
  if (process.env.NODE_ENV === "production") {
    throw new Error("PAYWALL_SECRET (or NEXTAUTH_SECRET) must be set in production.");
  }
  return DEV_FALLBACK_SECRET;
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

// PROOF-OF-CONCEPT personal payment: a public peer-to-peer link (PayPal.me,
// Venmo, Cash App) that pays the owner directly — no merchant account. Buyers
// pay there (PayPal.me surfaces Apple Pay), then self-confirm to unlock. This is
// honor-system by design: fine for a POC to a personal account, not fraud-proof.
export function personalPayUrl(): string {
  // Env var wins (Vercel), else the committed public default in config/pay.ts.
  const url = process.env.PERSONAL_PAY_URL || PERSONAL_PAY_URL_DEFAULT || "";
  return /^https:\/\/[^\s]+$/i.test(url) ? url : "";
}

// Apple Cash target number (E.164), and the human display string. When set (and
// no Stripe/personal link), buyers pay $0.99 via Apple Cash in Messages.
export function appleCashNumber(): string {
  const n = process.env.APPLE_CASH_NUMBER || APPLE_CASH_NUMBER_DEFAULT || "";
  return /^\+[1-9]\d{6,14}$/.test(n) ? n : "";
}
export function appleCashDisplay(): string {
  return APPLE_CASH_DISPLAY;
}

export type PaymentMode = "stripe" | "personal" | "applecash" | "demo";

// Precedence: a real Stripe key wins; else a personal pay link; else Apple Cash
// to a number; else demo.
export function paymentMode(): PaymentMode {
  if (stripeConfigured()) return "stripe";
  if (personalPayUrl()) return "personal";
  if (appleCashNumber()) return "applecash";
  return "demo";
}

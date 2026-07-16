import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { signUnlock, unlockCookieName, stripeConfigured } from "@/lib/paywall";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/unlock?slug=...&session_id=...   (Stripe success redirect)
// GET /api/unlock?slug=...&demo=1           (demo mode unlock)
// Verifies payment, sets the signed unlock cookie, redirects to the idea page.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const slug = searchParams.get("slug") || "";
  const sessionId = searchParams.get("session_id");
  const demo = searchParams.get("demo");

  if (!/^[a-z0-9-]{1,80}$/i.test(slug)) {
    return NextResponse.redirect(`${origin}/`);
  }

  let paid = false;

  if (stripeConfigured() && sessionId) {
    // A transient Stripe/network error here must NOT strand a paying guest —
    // retry, and if it still fails, keep session_id in the redirect so the
    // client can offer "retry verification" instead of a second charge.
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    for (let attempt = 1; attempt <= 3 && !paid; attempt += 1) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        paid = session.payment_status === "paid" && session.metadata?.slug === slug;
        break; // got a definitive answer (paid or genuinely unpaid/mismatched)
      } catch {
        if (attempt < 3) await new Promise((r) => setTimeout(r, 600 * attempt));
      }
    }
  } else if (!stripeConfigured() && demo === "1") {
    // Demo mode: allow unlock so the flow is testable end-to-end with no charge.
    paid = true;
  }

  if (!paid) {
    const retry = sessionId ? `&session_id=${encodeURIComponent(sessionId)}` : "";
    return NextResponse.redirect(`${origin}/${encodeURIComponent(slug)}?unpaid=1${retry}`);
  }

  const res = NextResponse.redirect(`${origin}/${encodeURIComponent(slug)}`);
  res.cookies.set(unlockCookieName(slug), signUnlock(slug), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60
  });
  return res;
}

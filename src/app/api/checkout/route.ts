import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PRICE_CENTS, CURRENCY, stripeConfigured } from "@/lib/paywall";
import { getSiteUrl } from "@/lib/site";
import { getIdeaPage } from "@/lib/ideas/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/checkout  { slug }
// Creates a Stripe Checkout Session for $0.99. Apple Pay appears automatically
// in Checkout on Safari/iOS when the domain is verified with Stripe.
// Returns { url } to redirect to. In demo mode (no Stripe key) returns
// { demo: true } so the client can run the unlock flow without charging.
export async function POST(req: NextRequest) {
  let slug = "";
  try {
    const body = await req.json();
    slug = String(body.slug || "");
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!/^[a-z0-9-]{1,80}$/i.test(slug)) {
    return NextResponse.json({ error: "bad slug" }, { status: 400 });
  }

  // Confirm the idea exists.
  let ideaName = slug;
  try {
    ideaName = getIdeaPage(slug).name;
  } catch {
    // unknown slugs still render a generated page; allow checkout anyway
  }

  if (!stripeConfigured()) {
    // DEMO mode — no money moves. The client will hit /api/unlock?demo=1.
    return NextResponse.json({ demo: true });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const base = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Apple Pay is delivered via the "card" payment method in Checkout and shows
    // automatically on supported Apple devices/browsers.
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: PRICE_CENTS,
          product_data: {
            name: `Unlock idea: ${ideaName}`,
            description: "One-time access to this ideamuses.com idea page."
          }
        }
      }
    ],
    success_url: `${base}/api/unlock?slug=${encodeURIComponent(slug)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/${encodeURIComponent(slug)}?canceled=1`,
    metadata: { slug }
  });

  return NextResponse.json({ url: session.url });
}

# Stripe Go-Live — John's 15-minute runbook
Everything code-side is deployed and waiting. These steps are yours alone (accounts,
bank details, and keys never pass through Machine One / Claude, per your standing rule).

## 1. Create the Stripe account (~10 min, once)
- dashboard.stripe.com → Sign up → business details + the bank account for payouts.

## 2. Rehearse with the TEST key (no real money)
- Stripe dashboard → Developers → API keys → copy the **test** Secret key (`sk_test_…`).
- vercel.com → project **openaitpm** → Settings → Environment Variables → add:
  - `STRIPE_SECRET_KEY` = `sk_test_…`
  - `PAYWALL_SECRET`   = the value in `New project/.env.local`
    (view it: `grep PAYWALL_SECRET "/Users/machine1/Documents/New project/.env.local"`)
- Redeploy when Vercel prompts.
- Open any idea page → Unlock → pay with Stripe's test card `4242 4242 4242 4242`,
  any future date, any CVC. Full flow runs; nothing is charged.
- Also rehearse the failure path once: cancel mid-checkout → the page should say
  "Payment canceled — nothing was charged."

## 3. Flip to LIVE
- Stripe dashboard → activate the account (Stripe may ask for ID verification).
- Developers → API keys → copy the **live** Secret key (`sk_live_…`).
- Vercel → replace `STRIPE_SECRET_KEY` with the live key → redeploy.
- Make one real $0.99 purchase yourself on your iPhone (Apple Pay sheet should
  appear automatically). Refund it from the Stripe dashboard afterward if you like.

## Notes
- Apple Pay and Google Pay appear automatically in Stripe Checkout — no extra setup.
- Demo mode returns automatically if the key is ever removed; the site never breaks.
- Refund promise (already published at ideamuses.com/terms): text REFUND + link to
  (949) 508-9229 → instant refund, they keep access. Refunds are issued by YOU in the
  Stripe dashboard — Machine One never touches money.

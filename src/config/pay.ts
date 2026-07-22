// POC personal payment link — the public handle people pay to.
// This is a PUBLIC URL (meant to be shared with payers), not a secret, so it
// lives in the repo and deploys on push. The PERSONAL_PAY_URL env var, if set
// in Vercel, overrides this. Leave empty to stay in demo mode.
//
// Fill with ONE of (must be https):
//   PayPal.me:  https://www.paypal.me/<yourhandle>   ← surfaces Apple Pay at checkout
//   Venmo:      https://venmo.com/u/<yourhandle>
//   Cash App:   https://cash.app/$<yourcashtag>
export const PERSONAL_PAY_URL_DEFAULT = "";

// Apple Cash (consumer-to-consumer): buyers send $0.99 in Messages to this
// number, straight to the card in the recipient's Wallet. No processor, no web
// checkout — Apple Cash is peer-to-peer inside Messages only.
// Set the E.164 number (e.g. "+19495089229") once Apple Cash is enabled on the
// IPHONE that owns that iMessage number. Env APPLE_CASH_NUMBER overrides.
// Leave empty to keep this mode off. Display is what buyers see on the page.
export const APPLE_CASH_NUMBER_DEFAULT = "";
export const APPLE_CASH_DISPLAY = "(949) 508-9229";

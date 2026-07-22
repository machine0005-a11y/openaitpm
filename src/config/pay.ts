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

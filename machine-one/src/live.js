#!/usr/bin/env node
// `npm run live` — one command that:
//   1. starts the server
//   2. opens an ngrok tunnel
//   3. auto-updates the Twilio webhook for +19495089229 to the ngrok URL
// So a single command takes you from "cloned repo" to "real SMS works".
//
// Requires (in .env):
//   ANTHROPIC_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
//   NGROK_AUTHTOKEN  (free, from https://dashboard.ngrok.com)
//
// ngrok is loaded dynamically so the dep isn't required for normal use.
import 'dotenv/config';

// We deliberately use a dynamic import here so a missing ngrok package
// produces a clear, actionable error instead of crashing module load.
async function tunnel() {
  let ngrok;
  try {
    ngrok = (await import('@ngrok/ngrok')).default;
  } catch {
    console.error('\n@ngrok/ngrok is not installed. Run:  npm i @ngrok/ngrok\n');
    process.exit(1);
  }
  if (!process.env.NGROK_AUTHTOKEN) {
    console.error('\nNGROK_AUTHTOKEN not set. Get a free one at https://dashboard.ngrok.com\n');
    process.exit(1);
  }
  const port = Number(process.env.PORT) || 3000;
  const listener = await ngrok.forward({ addr: port, authtoken_from_env: true });
  return listener.url();
}

async function updateTwilioWebhook(url) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('[live] Twilio creds missing — skipping webhook update. Manually point your number to:', url + '/webhook/sms');
    return;
  }
  const twilio = (await import('twilio')).default;
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  const nums = await client.incomingPhoneNumbers.list({ phoneNumber: TWILIO_PHONE_NUMBER, limit: 1 });
  if (!nums.length) {
    console.error(`[live] No Twilio number matching ${TWILIO_PHONE_NUMBER} found in this account.`);
    return;
  }
  await client.incomingPhoneNumbers(nums[0].sid).update({
    smsUrl: url + '/webhook/sms',
    smsMethod: 'POST',
  });
  console.log(`[live] Twilio webhook for ${TWILIO_PHONE_NUMBER} -> ${url}/webhook/sms`);
}

(async () => {
  // 1) boot the HTTP server
  await import('./server.js');

  // 2) open the ngrok tunnel
  const url = await tunnel();
  console.log('\n──────────────────────────────────────────────');
  console.log(`  PUBLIC URL: ${url}`);
  console.log('──────────────────────────────────────────────\n');

  // 3) point Twilio at it
  await updateTwilioWebhook(url);
  console.log('\n✔ Ready. Text +1 (949) 508-9229 with an idea.\n');

  // hold the process open
  process.stdin.resume();
})().catch(err => {
  console.error('[live] fatal:', err);
  process.exit(1);
});

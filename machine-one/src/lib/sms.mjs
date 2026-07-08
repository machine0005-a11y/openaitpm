// sms.mjs — outbound iMessage. `imsg send` works without Full Disk Access.
import { spawnSync } from 'node:child_process';
import { config, log } from './config.mjs';

// Send `text` to `to`. Returns true on success. Never throws.
export function sendSms(to, text) {
  if (!to) return false;
  const r = spawnSync(
    config.imsg,
    ['send', '--to', to, '--text', text, '--service', 'imessage', '--json'],
    { encoding: 'utf8' }
  );
  const out = (r.stdout || r.stderr || '').trim();
  const ok = r.status === 0 && /"status"\s*:\s*"sent"/.test(out);
  log('[sms]', ok ? 'sent' : 'FAILED', '->', to, out.slice(0, 80));
  return ok;
}

export function sendUrl(to, url) {
  if (!/^https:\/\/www\.ideamuses\.com\/[a-z0-9-]+$/.test(url)) {
    log('[sms] BLOCKED non-URL guest reply');
    return false;
  }
  return sendSms(to, url);
}

// Guests receive exactly TWO message shapes: this fixed build ack the moment
// their idea is accepted, and the bare URL once the page is verified live.
// Fixed copy (not model-generated) so nothing unexpected can reach a guest.
const BUILDING_ACK =
  "Got it — I'm building your idea into its own page right now. " +
  "I'll text you the link the moment it's done. Only when it's truly done.";

export function sendBuildingAck(to) {
  return sendSms(to, BUILDING_ACK);
}

export function alertOwner(component, detail) {
  return sendSms(config.ownerNumber, `Machine One blocker — ${component}: ${String(detail).slice(0, 240)}`);
}

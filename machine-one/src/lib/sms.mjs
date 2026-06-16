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

export function alertOwner(component, detail) {
  return sendSms(config.ownerNumber, `Machine One blocker — ${component}: ${String(detail).slice(0, 240)}`);
}

import 'dotenv/config';
import express from 'express';
import twilio from 'twilio';
import { existsSync, readFileSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ideaToSlug } from './slug.js';
import { generateAndSave } from './generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITES_DIR = join(ROOT, 'sites');
const PUBLIC_DIR = join(ROOT, 'public');
const OWNER_NUMBER = process.env.OWNER_NUMBER || '+14843260020';

const app = express();
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Static landing page at /
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(join(PUBLIC_DIR, 'index.html'));
});

app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// ---------------------------------------------------------------------------
// Twilio SMS webhook
// POST /webhook/sms
// Body: From, To, Body (Twilio form-encoded)
// Returns empty TwiML immediately, then sends exactly one bare URL after generation.
// ---------------------------------------------------------------------------
const twilioWebhook = process.env.TWILIO_AUTH_TOKEN
  ? twilio.webhook({ validate: true })
  : (req, res, next) => {
      console.warn('[webhook] TWILIO_AUTH_TOKEN unset — skipping signature validation. DO NOT run like this in production.');
      next();
    };

app.post('/webhook/sms', twilioWebhook, async (req, res) => {
  const from = (req.body.From || '').toString();
  const body = (req.body.Body || '').toString().trim();

  const twiml = new twilio.twiml.MessagingResponse();

  if (!body) {
    res.type('text/xml').send(twiml.toString());
    return;
  }

  if (body.length > 500) {
    res.type('text/xml').send(twiml.toString());
    return;
  }

  const slug = ideaToSlug(body, SITES_DIR);
  const publicUrl = `${(process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '')}/${slug}`;

  res.type('text/xml').send(twiml.toString());

  // Fire and forget the heavy work. Errors are logged; texters never receive debug text.
  buildAndDeliver({ idea: body, slug, from, publicUrl }).catch(err => {
    console.error('[generate] failed:', err);
    sendSms(OWNER_NUMBER, `Machine One blocker — inbound webhook/page generator: ${err.message.slice(0, 180)}`).catch(() => {});
  });
});

async function buildAndDeliver({ idea, slug, from, publicUrl }) {
  console.log(`[generate] start  slug=${slug}  from=${from}  idea="${idea}"`);
  const t0 = Date.now();
  const result = await generateAndSave({ idea, slug, sitesDir: SITES_DIR, from });
  const ms = Date.now() - t0;
  console.log(`[generate] done   slug=${slug}  bytes=${result.bytes}  in ${ms}ms`);

  await sendSms(from, publicUrl);
}

async function sendSms(to, body) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn('[sms] Twilio not configured — would have sent:', { to, body });
    return;
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({ to, from: process.env.TWILIO_PHONE_NUMBER, body });
}

// ---------------------------------------------------------------------------
// Gallery: /sites lists every generated prototype
// ---------------------------------------------------------------------------
app.get('/sites', async (req, res) => {
  let entries = [];
  try {
    const dirs = await readdir(SITES_DIR, { withFileTypes: true });
    for (const d of dirs) {
      if (!d.isDirectory()) continue;
      const metaPath = join(SITES_DIR, d.name, 'meta.json');
      let meta = { slug: d.name, idea: d.name, createdAt: null };
      if (existsSync(metaPath)) {
        try { meta = { ...meta, ...JSON.parse(readFileSync(metaPath, 'utf8')) }; } catch {}
      }
      entries.push(meta);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  entries.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const rows = entries.map(e => `
    <li>
      <a href="/${e.slug}">${escapeHtml(e.slug)}</a>
      <span class="idea">${escapeHtml(e.idea)}</span>
      <span class="date">${e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}</span>
    </li>`).join('');

  res.type('html').send(`<!doctype html>
<html><head><meta charset="utf-8"><title>openaitpm — gallery</title>
<style>
  body{font:16px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:780px;margin:48px auto;padding:0 20px;color:#111}
  h1{font-size:24px;margin-bottom:4px}
  p.sub{color:#666;margin-top:0}
  ul{list-style:none;padding:0}
  li{padding:14px 0;border-bottom:1px solid #eee}
  a{color:#0a58ff;text-decoration:none;font-weight:600}
  .idea{display:block;color:#444;margin-top:2px}
  .date{display:block;color:#999;font-size:12px;margin-top:2px}
</style></head>
<body>
  <h1>openaitpm — gallery</h1>
  <p class="sub">${entries.length} prototype${entries.length === 1 ? '' : 's'} generated from text messages.</p>
  <ul>${rows || '<li>No prototypes yet. Text an idea to +1 (949) 508-9229.</li>'}</ul>
</body></html>`);
});

// ---------------------------------------------------------------------------
// Dynamic site route: /<slug>
// Serves sites/<slug>/index.html — must come AFTER the named routes above.
// ---------------------------------------------------------------------------
app.get('/:slug', async (req, res, next) => {
  const slug = req.params.slug;
  if (!/^[a-z0-9-]{1,80}$/i.test(slug)) return next();

  const file = join(SITES_DIR, slug, 'index.html');
  if (!existsSync(file)) {
    res.status(404).type('html').send(notFoundPage(slug));
    return;
  }
  try {
    const html = await readFile(file, 'utf8');
    res.type('html').send(html);
  } catch (err) {
    next(err);
  }
});

function notFoundPage(slug) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Not built yet</title>
<style>body{font:16px/1.5 -apple-system,sans-serif;max-width:520px;margin:80px auto;padding:0 20px;color:#111;text-align:center}
h1{font-size:28px}p{color:#555}a{color:#0a58ff}</style></head><body>
<h1>"${escapeHtml(slug)}" doesn't exist yet</h1>
<p>Text your idea to <strong>+1 (949) 508-9229</strong> and a prototype will appear here.</p>
<p><a href="/sites">Browse the gallery →</a></p>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// ---------------------------------------------------------------------------
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`openaitpm-sms listening on http://localhost:${PORT}`);
  console.log(`  webhook:   POST /webhook/sms`);
  console.log(`  gallery:   GET  /sites`);
  console.log(`  site:      GET  /<slug>`);
  if (!process.env.ANTHROPIC_API_KEY) console.warn('  ⚠ ANTHROPIC_API_KEY not set');
  if (!process.env.TWILIO_AUTH_TOKEN) console.warn('  ⚠ TWILIO_AUTH_TOKEN not set — webhook signatures will NOT be validated');
});

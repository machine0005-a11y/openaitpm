// extract.mjs — turn a piece of MEDIA into an idea string, so voicemail, voice
// messages, images, and videos flow through the exact same idea→page→URL
// workflow as text.
//
//   image  -> vision model describes the concept it implies      -> idea text
//   video  -> grab a representative frame, then vision            -> idea text
//   audio  -> Whisper transcript (voice message / voicemail)      -> idea text
//   text   -> passthrough (handled by the caller, not here)
//
// Everything degrades gracefully: if a format can't be normalized or the API
// key is missing, we return a clear, usable fallback idea string so the
// pipeline still produces a page rather than dropping the message.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config, log } from './config.mjs';

export function mediaKind(mime = '', uti = '') {
  const m = (mime || '').toLowerCase();
  const u = (uti || '').toLowerCase();
  if (m.startsWith('image/') || u.includes('image') || u.includes('heic')) return 'image';
  if (m.startsWith('video/') || u.includes('movie') || u.includes('mpeg-4') || u.includes('video')) return 'video';
  if (m.startsWith('audio/') || u.includes('audio') || u.includes('m4a') || u.includes('caf') || u.includes('amr')) return 'audio';
  return 'other';
}

// --- format normalization (all local, no network) ---

// HEIC / odd image -> a JPEG the vision API accepts.
function toJpeg(srcPath) {
  if (/\.(jpe?g|png|webp|gif)$/i.test(srcPath)) return srcPath;
  const dir = mkdtempSync(join(tmpdir(), 'ext-img-'));
  const out = join(dir, 'frame.jpg');
  const r = spawnSync(config.sips, ['-s', 'format', 'jpeg', srcPath, '--out', out], { encoding: 'utf8' });
  return r.status === 0 && existsSync(out) ? out : srcPath;
}

// video -> a single representative JPEG frame (~1s in).
function videoFrame(srcPath) {
  const dir = mkdtempSync(join(tmpdir(), 'ext-vid-'));
  const out = join(dir, 'frame.jpg');
  const r = spawnSync(config.ffmpeg, ['-y', '-ss', '00:00:01', '-i', srcPath, '-frames:v', '1', '-q:v', '3', out], { encoding: 'utf8' });
  return r.status === 0 && existsSync(out) ? out : null;
}

// any audio (CAF/AMR/M4A) -> mp3 for Whisper.
function toMp3(srcPath) {
  if (/\.mp3$/i.test(srcPath)) return srcPath;
  const dir = mkdtempSync(join(tmpdir(), 'ext-aud-'));
  const out = join(dir, 'audio.mp3');
  const r = spawnSync(config.ffmpeg, ['-y', '-i', srcPath, '-ac', '1', '-ar', '16000', out], { encoding: 'utf8' });
  return r.status === 0 && existsSync(out) ? out : null;
}

// --- OpenAI calls (curl, like visual.mjs) ---

function visionDescribe(jpegPath) {
  if (!process.env.OPENAI_API_KEY) return null;
  let b64;
  try { b64 = readFileSync(jpegPath).toString('base64'); } catch { return null; }
  const payload = JSON.stringify({
    model: config.openaiVisionModel,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'A person texted this image to a service that turns ideas into product concept pages. In ONE concise sentence (<160 chars), state the product or app idea this image most plausibly represents. Output only the idea sentence, no preamble.' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
      ],
    }],
    max_tokens: 80,
  });
  const r = spawnSync('curl', [
    '-fsS', '--max-time', '60',
    'https://api.openai.com/v1/chat/completions',
    '-H', `Authorization: Bearer ${process.env.OPENAI_API_KEY}`,
    '-H', 'Content-Type: application/json',
    '-d', payload,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0) { log('[extract] vision failed', String(r.stderr || '').slice(-160)); return null; }
  try {
    const body = JSON.parse(r.stdout);
    return (body.choices?.[0]?.message?.content || '').trim() || null;
  } catch { return null; }
}

function transcribe(mp3Path) {
  if (!process.env.OPENAI_API_KEY) return null;
  const r = spawnSync('curl', [
    '-fsS', '--max-time', '120',
    'https://api.openai.com/v1/audio/transcriptions',
    '-H', `Authorization: Bearer ${process.env.OPENAI_API_KEY}`,
    '-F', `file=@${mp3Path}`,
    '-F', `model=${config.openaiTranscribeModel}`,
    '-F', 'response_format=text',
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0) { log('[extract] transcribe failed', String(r.stderr || '').slice(-160)); return null; }
  return (r.stdout || '').trim() || null;
}

// --- public: media item -> idea string (or null if unusable) ---
// item = { path, mime, uti, name }
export function extractIdea(item) {
  const kind = mediaKind(item.mime, item.uti);
  if (!item.path || !existsSync(item.path)) {
    log('[extract] file missing', item.path);
    return null;
  }

  if (kind === 'image') {
    const jpeg = toJpeg(item.path);
    const idea = visionDescribe(jpeg);
    if (idea) { log('[extract] image ->', idea.slice(0, 60)); return idea; }
    return `An app inspired by an image a user shared (${item.name || 'photo'})`;
  }

  if (kind === 'video') {
    const frame = videoFrame(item.path);
    const idea = frame ? visionDescribe(frame) : null;
    if (idea) { log('[extract] video ->', idea.slice(0, 60)); return idea; }
    return `An app inspired by a short video a user shared (${item.name || 'clip'})`;
  }

  if (kind === 'audio') {
    const mp3 = toMp3(item.path);
    const text = mp3 ? transcribe(mp3) : null;
    if (text) { log('[extract] audio ->', text.slice(0, 60)); return text; }
    return null; // no usable transcript and no safe fallback for audio
  }

  return null;
}

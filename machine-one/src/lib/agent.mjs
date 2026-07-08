// agent.mjs — the orchestrator. One job: on each tick, find NEW inbound texts
// and turn each into a built page. Guest contract: an immediate fixed
// "I'm building" ack, then ONE more text — the bare URL — sent only after the
// page is verified live (publishIdea throws until it's reachable).
import { config, log } from './config.mjs';
import { loadInbox, loadChatMap, loadAttachments, isInbound, isValidIdea, rowIdOf, bodyOf, handleOf } from './messages.mjs';
import { loadState, saveState } from './state.mjs';
import { publishIdea } from './publish.mjs';
import { alertOwner, sendUrl, sendBuildingAck } from './sms.mjs';
import { recordRun } from './records.mjs';
import { extractIdea, mediaKind } from './extract.mjs';

// Resolve the idea for one message: prefer real text; otherwise extract from
// the first usable attachment (image / video / voice message / voicemail).
// Returns { idea, source } or null when nothing usable is present.
function resolveIdea(body, attachments) {
  // The U+FFFC placeholder glyph means "an attachment lives here" — not real text.
  const meaningfulText = body && body.replace(/[^\p{L}\p{N}]/gu, '').length >= 4;
  if (meaningfulText) return { idea: body, source: 'text' };

  for (const item of attachments || []) {
    const kind = mediaKind(item.mime, item.uti);
    if (kind === 'other') continue; // skip link previews / plugin payloads
    const idea = extractIdea(item);
    if (idea) return { idea, source: kind };
  }
  return null;
}

const allowed = (from) =>
  config.allowFrom.length === 0 || (from && config.allowFrom.includes(from));

// Process exactly one idea: ack immediately, build the page, then reply with
// the bare URL — only once the page is verified live. On failure we alert the
// owner and stay silent toward the guest (no half-built links, ever).
export function handleIdea(idea, replyTo) {
  const startedAt = Date.now();
  log('[idea]', replyTo || '(no-reply)', JSON.stringify(idea));
  // Immediate ack so the sender knows the silence that follows is the build.
  // Sent once, before any attempt; the URL comes only after verifyLive passes.
  if (replyTo) sendBuildingAck(replyTo);
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const { url, source, slug, council } = publishIdea(idea);
      if (replyTo && !sendUrl(replyTo, url)) throw new Error('URL-only SMS delivery failed');
      recordRun({ status: 'complete', rawIdea: idea, slug, pageStatus: 'reachable', urlSent: Boolean(replyTo), durationMs: Date.now() - startedAt, source, assumptions: council.assumptions, riskFlags: council.riskFlags, councilOutputs: council.summary });
      log('[done]', url, `(${source})`, `${Date.now() - startedAt}ms`);
      return url;
    } catch (e) {
      log('[fail]', `attempt=${attempt}`, e.message);
      if (attempt === 2) {
        recordRun({ status: 'failed', rawIdea: idea, failure: e.message, durationMs: Date.now() - startedAt });
        alertOwner('idea-to-page pipeline', e.message);
      }
    }
  }
  return null;
}

// One poll: scan the inbox, act on anything new from an allowed sender.
export function tick(state) {
  const msgs = loadInbox(config.inboxFile);
  if (msgs === null) { log('[wait] reader not up yet'); return; }
  const chatMap = loadChatMap(config.chatsFile);
  const attMap = loadAttachments(config.attachmentsFile);

  msgs.sort((a, b) => rowIdOf(a) - rowIdOf(b));
  for (const m of msgs) {
    const rid = rowIdOf(m);
    // Advance the cursor past every message we look at, inbound or not.
    if (rid) state.lastRowId = Math.max(state.lastRowId, rid);

    if (!isInbound(m)) continue;
    if (rid && rid <= (state._cursorAtTickStart ?? 0)) continue; // already past
    if (state.seen[rid]) continue;

    const from = handleOf(m, chatMap);
    if (!allowed(from)) { log('[skip] not allowed:', from); continue; }

    const body = bodyOf(m);
    const attachments = attMap[String(rid)] || [];

    // Idea can come from text OR from media (image / video / voice / voicemail).
    const resolved = resolveIdea(body, attachments);
    if (!resolved) continue; // nothing usable (e.g. a bare link preview)

    // Guard rails (length / owner control words) apply to the resolved idea,
    // but media-derived ideas skip them — they're never control commands.
    if (resolved.source === 'text' && !isValidIdea(resolved.idea, from, config.ownerNumber)) {
      log('[skip] not a valid idea:', from);
      continue;
    }

    state.seen[rid] = true;
    log('[media]', resolved.source, 'rowid=' + rid);
    handleIdea(resolved.idea, from);
    saveState(state);
  }
  saveState(state);
}

// On first run, baseline so we ignore the existing backlog and only act on
// texts that arrive AFTER startup.
export function baseline(state) {
  if (state.baselined) return state;
  const msgs = loadInbox(config.inboxFile) || [];
  for (const m of msgs) state.lastRowId = Math.max(state.lastRowId, rowIdOf(m));
  state.baselined = true;
  saveState(state);
  log('[baseline] lastRowId=' + state.lastRowId);
  return state;
}

export function run() {
  log(`[start] base=${config.baseUrl} number=${config.machineOneNumber} allow=${config.allowFrom.join(',') || 'anyone'}`);
  const state = baseline(loadState());
  const loop = () => {
    state._cursorAtTickStart = state.lastRowId;
    tick(state);
  };
  loop();
  setInterval(loop, config.pollMs);
}

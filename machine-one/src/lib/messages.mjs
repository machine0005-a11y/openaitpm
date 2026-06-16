// messages.mjs — read the inbox/chat-map files the Terminal reader writes.
// (Reads need Full Disk Access, which only Terminal-launched `imsg` has; this
// module just parses the JSONL files it dumps — no FDA needed here.)
import { readFileSync } from 'node:fs';
import { cleanText } from './text.mjs';

// Returns array of message objects, or null if the reader hasn't written yet.
export function loadInbox(inboxFile) {
  let raw;
  try { raw = readFileSync(inboxFile, 'utf8'); } catch { return null; }
  const out = [];
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    let obj;
    try { obj = JSON.parse(t); } catch { continue; }
    for (const m of (Array.isArray(obj) ? obj : [obj])) out.push(m);
  }
  return out;
}

// rowid -> [ {path, mime, uti, name}, ... ] from the reader's attachments dump.
// Lets the agent find media (images/video/voice/voicemail) for any message.
export function loadAttachments(attachmentsFile) {
  const map = {};
  try {
    const arr = JSON.parse(readFileSync(attachmentsFile, 'utf8'));
    for (const a of (Array.isArray(arr) ? arr : [])) {
      const rid = String(a.rowid);
      if (!rid) continue;
      (map[rid] = map[rid] || []).push({ path: a.path, mime: a.mime, uti: a.uti, name: a.name });
    }
  } catch {}
  return map;
}

// chat_id -> participant identifier (so we can resolve who to reply to).
export function loadChatMap(chatsFile) {
  const map = {};
  try {
    for (const line of readFileSync(chatsFile, 'utf8').trim().split('\n')) {
      let arr;
      try { arr = JSON.parse(line); } catch { continue; }
      for (const c of (Array.isArray(arr) ? arr : [arr])) {
        const id = c.id ?? c.chatId ?? c.rowid;
        if (id != null && c.identifier) map[String(id)] = c.identifier;
      }
    }
  } catch {}
  return map;
}

// Normalize the varied field names imsg can emit into one shape.
export const isInbound = (m) => !(m.is_from_me === true || m.isFromMe === true || m.fromMe === true);
export const rowIdOf = (m) => Number(m.rowid ?? m.rowId ?? m.id ?? 0);
export const bodyOf = (m) => cleanText(m.text || m.body || m.message || '');
export const handleOf = (m, chatMap) =>
  m.handle || m.sender || m.from || chatMap[String(m.chat_id ?? m.chatId ?? '')] || null;

export function isValidIdea(text, from, ownerNumber) {
  const body = cleanText(text);
  if (body.length < 8 || body.length > 500) return false;
  if (from !== ownerNumber) return true;
  return !/(^approved\b|\byolo\b|don.t need approval|change|update|rewrite|tell me|remember|my new purpose|your (goal|purpose|identity)|what do you need|repo search|definition of done|hard boundar|\bgit\b|\bpipeline\b|\bdaemon\b|\bdeploy\b|fix the code|make it work)/i.test(body);
}

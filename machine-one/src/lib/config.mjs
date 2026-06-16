// config.mjs — single source of truth for paths, numbers, and tunables.
// Everything env-overridable so the same code runs in dev, test, and the daemon.
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  // Where the Next.js project (and its idea JSON content) lives.
  projectDir: process.env.PROJECT_DIR || '/Users/machine1/Documents/New project',
  get ideasDir() { return join(this.projectDir, 'src', 'content', 'ideas'); },

  // Public site the URLs point at.
  baseUrl: (process.env.OPENAITPM_BASE_URL || 'https://www.ideamuses.com').replace(/\/+$/, ''),

  // machine one's iMessage number (the destination_caller_id this Mac uses).
  machineOneNumber: process.env.MACHINE_ONE_NUMBER || '+19495089229',

  // Binaries.
  imsg: process.env.IMSG_BIN || '/opt/homebrew/bin/imsg',
  claude: process.env.CLAUDE_BIN || '/opt/homebrew/bin/claude',
  claudeModel: process.env.CLAUDE_MODEL || 'sonnet',
  openaiImageModel: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
  openaiImageQuality: process.env.OPENAI_IMAGE_QUALITY || 'medium',
  // Image circuit breaker: once a hard-cap/quota error is seen, stop attempting
  // image generation (no wasted doomed calls) until this cooldown elapses, then
  // re-probe so it auto-recovers when credit is added. State file persists the trip.
  imageBreakerFile: process.env.IMAGE_BREAKER_FILE || '/tmp/ideamuses-image-breaker.json',
  imageBreakerCooldownMs: Number(process.env.IMAGE_BREAKER_COOLDOWN_MS || 30 * 60 * 1000),
  // Media → idea extraction. Vision describes images/video frames; Whisper
  // transcribes voice messages / voicemail. Both via the OpenAI API.
  openaiVisionModel: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
  openaiTranscribeModel: process.env.OPENAI_TRANSCRIBE_MODEL || 'whisper-1',
  ffmpeg: process.env.FFMPEG_BIN || '/opt/homebrew/bin/ffmpeg',
  sips: process.env.SIPS_BIN || '/usr/bin/sips',
  attachmentsFile: process.env.ATTACHMENTS_FILE || '/tmp/openaitpm-attachments.json',

  // The reader (in Terminal, with Full Disk Access) writes these; we read them.
  inboxFile: process.env.INBOX_FILE || '/tmp/openaitpm-inbox.json',
  chatsFile: process.env.CHATS_FILE || '/tmp/openaitpm-chats.json',
  stateFile: process.env.STATE_FILE || '/tmp/openaitpm-agent-state.json',
  runLogFile: process.env.RUN_LOG_FILE || '/tmp/ideamuses-runs.jsonl',
  ownerNumber: process.env.OWNER_NUMBER || '+14843260020',

  // Who may trigger a build. Empty = anyone.
  allowFrom: (process.env.ALLOW_FROM || '').split(',').map(s => s.trim()).filter(Boolean),

  // Poll cadence for the inbox file.
  pollMs: Number(process.env.POLL_MS || 3000),

  // The idea-page skill (style + C-suite review panel) lives next to this dir.
  skillPath: join(__dirname, '..', '..', 'skills', 'idea-page', 'SKILL.md'),
  agentsDir: join(__dirname, '..', '..', 'agents'),
  verifyAttempts: Number(process.env.VERIFY_ATTEMPTS || 15),
  verifyDelayMs: Number(process.env.VERIFY_DELAY_MS || 3000),
};

export function log(...a) {
  console.log(new Date().toISOString(), ...a);
}

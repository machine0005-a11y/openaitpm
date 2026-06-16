#!/usr/bin/env node
// agent.mjs — entrypoint for the machine-one SMS→idea→URL daemon.
//
// Architecture (each module = one responsibility):
//   config.mjs    paths, numbers, tunables
//   text.mjs      slug/title/clean — pure, no I/O
//   messages.mjs  parse the reader's inbox/chat files
//   state.mjs     persisted cursor (no double-processing)
//   generate.mjs  idea -> content (claude, with template fallback)
//   publish.mjs   content -> local record -> verified dynamic URL
//   sms.mjs       outbound iMessage
//   agent.mjs     orchestration loop
//
// Daemon:    node src/agent.mjs
// One-shot:  node src/agent.mjs --once "<idea>" [<replyTo>]
import { run, handleIdea } from './lib/agent.mjs';

const [, , flag, idea, replyTo] = process.argv;

if (flag === '--once') {
  if (!idea) { console.error('usage: node src/agent.mjs --once "<idea>" [<replyTo>]'); process.exit(1); }
  const url = handleIdea(idea, replyTo || null);
  if (url) console.log(url);
  process.exit(url ? 0 : 1);
} else {
  run();
}

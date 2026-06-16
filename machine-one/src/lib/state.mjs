// state.mjs — tiny persisted cursor so we never reprocess a message twice.
import { readFileSync, writeFileSync } from 'node:fs';
import { config } from './config.mjs';

export function loadState() {
  try { return JSON.parse(readFileSync(config.stateFile, 'utf8')); }
  catch { return { lastRowId: 0, seen: {}, baselined: false }; }
}

export function saveState(s) {
  try { writeFileSync(config.stateFile, JSON.stringify(s)); } catch {}
}

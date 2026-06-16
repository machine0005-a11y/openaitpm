import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config, log } from './config.mjs';

export function recordRun(event) {
  try {
    mkdirSync(dirname(config.runLogFile), { recursive: true });
    appendFileSync(config.runLogFile, JSON.stringify({ timestamp: new Date().toISOString(), ...event }) + '\n');
  } catch (error) {
    log('[records] failed', error.message);
  }
}

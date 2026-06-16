import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from './config.mjs';

const roles = [
  'product-decider.md',
  'design-reviewer.md',
  'systems-architect.md',
  'growth-marketer.md',
  'finance-reviewer.md',
  'legal-risk-reviewer.md',
  'skeptic-reviewer.md',
  'tpm-integrator.md',
  'page-generator.md',
];

let cached = null;

export function councilPrompt() {
  if (cached !== null) return cached;
  cached = roles.map((file) => readFileSync(join(config.agentsDir, file), 'utf8')).join('\n\n---\n\n');
  return cached;
}

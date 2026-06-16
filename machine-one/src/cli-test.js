#!/usr/bin/env node
// Local generator without Twilio. Lets you smoke-test the Claude pipeline.
//   node src/cli-test.js "a habit tracker that gamifies streaks"
import 'dotenv/config';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ideaToSlug } from './slug.js';
import { generateAndSave } from './generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITES_DIR = resolve(__dirname, '..', 'sites');

const idea = process.argv.slice(2).join(' ').trim();
if (!idea) {
  console.error('Usage: node src/cli-test.js "<your idea>"');
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const slug = ideaToSlug(idea, SITES_DIR);
console.log(`idea: ${idea}`);
console.log(`slug: ${slug}`);
console.log(`generating...`);

const t0 = Date.now();
const { dir, bytes } = await generateAndSave({ idea, slug, sitesDir: SITES_DIR, from: 'cli' });
const ms = Date.now() - t0;
console.log(`done in ${ms}ms — ${bytes} bytes`);
console.log(`open: ${join(dir, 'index.html')}`);
console.log(`url:  http://localhost:${process.env.PORT || 3000}/${slug}`);

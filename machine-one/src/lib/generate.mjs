// generate.mjs — turn an idea string into IdeaPage content.
// Strategy: try the `claude` CLI (applying the idea-page skill + C-suite panel);
// if it's unavailable (logged out / no key), fall back to a deterministic
// template so the pipeline is ALWAYS end-to-end. The caller never has to care
// which path produced the content.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { config, log } from './config.mjs';
import { councilPrompt } from './council.mjs';

const SCHEMA = {
  type: 'object',
  properties: {
    tagline: { type: 'string', maxLength: 110 },
    thesis: { type: 'string' },
    audience: { type: 'string', maxLength: 140 },
    primaryCta: { type: 'string', maxLength: 24 },
    secondaryCta: { type: 'string', maxLength: 24 },
    proofPoints: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
    nextMilestone: { type: 'string', maxLength: 60 },
    futureMilestone: { type: 'string', maxLength: 60 },
    visualPrompt: { type: 'string', maxLength: 700 },
    assumptions: { type: 'array', maxItems: 5, items: { type: 'string' } },
    riskFlags: { type: 'array', maxItems: 5, items: { type: 'string' } },
    councilSummary: { type: 'object' },
  },
  required: ['tagline', 'thesis', 'audience', 'primaryCta', 'secondaryCta', 'proofPoints', 'nextMilestone', 'futureMilestone', 'visualPrompt', 'assumptions', 'riskFlags', 'councilSummary'],
  additionalProperties: false,
};

let skillText = null;
function skill() {
  if (skillText === null) {
    try { skillText = readFileSync(config.skillPath, 'utf8'); }
    catch { skillText = ''; }
  }
  return skillText;
}

function viaClaude(idea, slug, name) {
  const prompt = `${skill() ? skill() + '\n\n---\n\n' : ''}${councilPrompt()}\n\n---\n\nApply the role-based council above internally. Turn this one-line idea into ideamuses.com/${slug} content.

Idea: "${idea}"
Name: ${name}

Be specific and concrete, but never invent statistics, costs, legal claims, timelines, or financial projections. Label inferred items as assumptions.
Write visualPrompt as a concise art direction for one striking, text-free editorial hero image that communicates the product's core experience. Avoid generic abstract gradients.
Keep the internal debate private. Return concise role conclusions in councilSummary.
Return ONLY JSON matching the schema.`;

  const r = spawnSync(config.claude, [
    '--print', '--model', config.claudeModel,
    '--output-format', 'json', '--json-schema', JSON.stringify(SCHEMA),
    '--disable-slash-commands', prompt,
  ], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });

  if (r.status !== 0) throw new Error('claude exited ' + r.status);
  const outer = JSON.parse(r.stdout.trim());
  if (outer.is_error) throw new Error('claude: ' + String(outer.result).slice(0, 80));
  return JSON.parse(outer.result ?? outer.text ?? r.stdout);
}

function template(idea, name) {
  return {
    tagline: `${name} — ${idea}`.slice(0, 108),
    thesis: `${name} turns "${idea}" into a working product. The first user gets a focused tool that nails the core job on day one, with a clear path from prototype to production.`,
    audience: 'Early adopters who feel this pain today and want a tool that already works.',
    primaryCta: 'Try it now',
    secondaryCta: 'See how it works',
    proofPoints: [
      'A working prototype exists the moment you text the idea.',
      'Every page ships with a concrete next milestone, not a maybe.',
      'Built and served automatically, end to end, with no manual steps.',
    ],
    nextMilestone: 'Validate with first 10 real users',
    futureMilestone: 'Add the most-requested integration',
    visualPrompt: `A vivid editorial scene that makes the core experience of ${name} immediately tangible, with a distinctive product-world object as the focal point.`,
    assumptions: ['The first user experiences the stated problem often enough to test a prototype.'],
    riskFlags: ['Demand and willingness to pay are unvalidated.'],
    councilSummary: {
      product: 'Keep one clear user and one core job.',
      design: 'Make the first screen explain the promise and action.',
      systems: 'Use a bounded prototype with observable dependencies.',
      growth: 'Lead with the user outcome, not implementation claims.',
      finance: 'Treat monetization as an unvalidated hypothesis.',
      legalRisk: 'Avoid unsupported claims and unnecessary personal data.',
      skeptic: 'Validate the highest-risk assumption first.',
      tpm: 'Ship one testable next step.',
      pageGenerator: 'Synthesize conclusions without exposing internal debate.',
    },
  };
}

// Returns { content, source } where source is 'claude' | 'template'.
export function generateContent(idea, slug, name) {
  try {
    const content = viaClaude(idea, slug, name);
    log('[gen] claude', slug);
    return { content, source: 'claude', council: { assumptions: content.assumptions, riskFlags: content.riskFlags, summary: content.councilSummary } };
  } catch (e) {
    log('[gen] template (' + e.message + ')', slug);
    const content = template(idea, name);
    return { content, source: 'template', council: { assumptions: content.assumptions, riskFlags: content.riskFlags, summary: content.councilSummary } };
  }
}

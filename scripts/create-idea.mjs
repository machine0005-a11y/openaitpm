import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function normalizeIdeaSlug(input) {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "untitled-idea";
}

function formatIdeaNameFromSlug(slugInput) {
  return normalizeIdeaSlug(slugInput)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const rawName = args.filter((arg) => arg !== "--dry-run").join(" ").trim();

if (!rawName) {
  console.error('Usage: npm run idea:new -- "My Idea Name"');
  console.error('Dry run: npm run idea:new -- --dry-run "My Idea Name"');
  process.exit(1);
}

const slug = normalizeIdeaSlug(rawName);
const name = formatIdeaNameFromSlug(slug);
const relativePath = `src/content/ideas/${slug}.json`;
const targetPath = join(process.cwd(), relativePath);

if (!dryRun && existsSync(targetPath)) {
  console.error(`Idea already exists: ${relativePath}`);
  process.exit(1);
}

const ideaFile = {
  slug,
  name,
  status: "draft",
  tagline: `${name} is ready for its first customer-facing page.`,
  thesis:
    "Replace this with the crisp customer promise: the problem, the target user, the decision or workflow it improves, and the proof that makes it worth building.",
  audience: "Define the buyer, user, and first customer segment.",
  sourceBranch: `idea/${slug}`,
  repoPath: relativePath,
  primaryCta: "Open idea page",
  secondaryCta: "Review launch plan",
  proofPoints: [
    "Replace with the strongest evidence or user pain.",
    "Replace with the workflow or outcome improvement.",
    "Replace with why this can become a product customers trust."
  ],
  launchChecks: [
    { label: "Idea page generated", state: "done" },
    { label: "Customer proof added", state: "active" },
    { label: "Production-ready demo", state: "next" }
  ]
};

if (!dryRun) {
  mkdirSync(join(process.cwd(), "src", "content", "ideas"), { recursive: true });
  writeFileSync(targetPath, `${JSON.stringify(ideaFile, null, 2)}\n`);
}

console.log(`${dryRun ? "Would create" : "Created"} ${relativePath}`);
console.log(`Route: /${slug}`);
console.log(`Branch: idea/${slug}`);

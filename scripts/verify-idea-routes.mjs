import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://openaitpm.com").replace(/\/+$/, "");
const ideasDirectory = join(root, "src", "content", "ideas");
const errors = [];

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

function fail(message) {
  errors.push(message);
}

function requireFile(relativePath) {
  if (!existsSync(join(root, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

requireFile("src/app/[ideaName]/page.tsx");
requireFile("src/app/sitemap.ts");
requireFile("src/app/robots.ts");
requireFile(".github/workflows/idea-pr.yml");

if (!existsSync(ideasDirectory)) {
  fail("Missing src/content/ideas directory.");
}

const slugs = new Set();
const routes = [];
const ideaFiles = existsSync(ideasDirectory)
  ? readdirSync(ideasDirectory).filter((fileName) => fileName.endsWith(".json")).sort()
  : [];

if (ideaFiles.length === 0) {
  fail("No checked-in idea JSON files found.");
}

for (const fileName of ideaFiles) {
  const filePath = join(ideasDirectory, fileName);
  const relativePath = `src/content/ideas/${fileName}`;
  let idea;

  try {
    idea = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error instanceof Error ? error.message : "unknown parse error"}`);
    continue;
  }

  const expectedSlug = normalizeIdeaSlug(fileName.replace(/\.json$/, ""));
  const slug = normalizeIdeaSlug(idea.slug || "");
  const route = idea.route || `/${slug}`;
  const sourceBranch = idea.sourceBranch || "";
  const repoPath = idea.repoPath || "";

  if (slug !== expectedSlug) {
    fail(`${relativePath} slug "${slug}" should match file name slug "${expectedSlug}".`);
  }

  if (slugs.has(slug)) {
    fail(`Duplicate idea slug found: ${slug}`);
  }
  slugs.add(slug);

  if (route !== `/${slug}`) {
    fail(`${relativePath} route should be /${slug}, got ${route}.`);
  }

  if (sourceBranch !== `idea/${slug}`) {
    fail(`${relativePath} sourceBranch should be idea/${slug}, got ${sourceBranch || "empty"}.`);
  }

  if (repoPath !== relativePath) {
    fail(`${relativePath} repoPath should be ${relativePath}, got ${repoPath || "empty"}.`);
  }

  for (const field of ["name", "tagline", "thesis", "audience"]) {
    if (!idea[field] || typeof idea[field] !== "string") {
      fail(`${relativePath} is missing string field ${field}.`);
    }
  }

  if (!Array.isArray(idea.proofPoints) || idea.proofPoints.length === 0) {
    fail(`${relativePath} needs at least one proof point.`);
  }

  if (!Array.isArray(idea.launchChecks) || idea.launchChecks.length === 0) {
    fail(`${relativePath} needs at least one launch check.`);
  }

  routes.push(`${siteUrl}/${slug}`);
}

if (errors.length > 0) {
  console.error("Idea route verification failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Verified ${routes.length} idea route(s):`);
for (const route of routes) {
  console.log(`- ${route}`);
}

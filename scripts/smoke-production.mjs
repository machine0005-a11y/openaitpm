import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const json = args.includes("--json");
const baseIndex = args.indexOf("--base-url");
const timeoutIndex = args.indexOf("--timeout-ms");
const baseUrl = (
  baseIndex >= 0 ? args[baseIndex + 1] : process.env.NEXT_PUBLIC_SITE_URL || "https://openaitpm.com"
).replace(/\/+$/, "");
const timeoutMs = Number(timeoutIndex >= 0 ? args[timeoutIndex + 1] : process.env.SMOKE_TIMEOUT_MS || 10000);
const root = process.cwd();
const ideasDirectory = join(root, "src", "content", "ideas");

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

function readIdeas() {
  if (!existsSync(ideasDirectory)) {
    return [];
  }

  return readdirSync(ideasDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort()
    .map((fileName) => {
      const idea = JSON.parse(readFileSync(join(ideasDirectory, fileName), "utf8"));
      const slug = normalizeIdeaSlug(idea.slug || fileName.replace(/\.json$/, ""));

      return {
        name: idea.name || slug,
        slug,
        path: `/${slug}`,
        expectedText: idea.name || slug
      };
    });
}

function buildChecks() {
  const ideas = readIdeas();

  return [
    { label: "home", url: baseUrl, expectedText: "Every checked-in idea gets a customer-ready URL." },
    { label: "sitemap", url: `${baseUrl}/sitemap.xml`, expectedText: `${baseUrl}/enterprise-leadership-context-os` },
    { label: "robots", url: `${baseUrl}/robots.txt`, expectedText: `${baseUrl}/sitemap.xml` },
    ...ideas.map((idea) => ({
      label: `idea:${idea.slug}`,
      url: `${baseUrl}${idea.path}`,
      expectedText: idea.expectedText
    }))
  ];
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

const checks = buildChecks();

if (dryRun) {
  const report = {
    live: false,
    baseUrl,
    timeoutMs,
    checks: checks.map((check) => ({ ...check, status: "planned" }))
  };

  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Production smoke dry run for ${baseUrl}:`);
    for (const check of report.checks) {
      console.log(`- ${check.label}: ${check.url}`);
    }
  }

  process.exit(0);
}

const results = [];

for (const check of checks) {
  try {
    const response = await fetchWithTimeout(check.url);
    const body = await response.text();
    const textMatched = body.includes(check.expectedText);
    const passed = response.ok && textMatched;

    results.push({
      ...check,
      status: passed ? "pass" : "fail",
      httpStatus: response.status,
      textMatched
    });
  } catch (error) {
    results.push({
      ...check,
      status: "fail",
      error: error instanceof Error ? error.message : "unknown smoke check error"
    });
  }
}

const passed = results.every((result) => result.status === "pass");
const report = {
  live: true,
  passed,
  baseUrl,
  timeoutMs,
  checks: results
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Production smoke ${passed ? "passed" : "failed"} for ${baseUrl}:`);
  for (const result of results) {
    const status = result.status.toUpperCase();
    const statusDetail = "httpStatus" in result ? ` HTTP ${result.httpStatus}` : "";
    console.log(`- ${status} ${result.label}: ${result.url}${statusDetail}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  }
}

if (!passed) {
  process.exit(1);
}

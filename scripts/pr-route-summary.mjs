import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const args = process.argv.slice(2);
const json = args.includes("--json");
const all = args.includes("--all");
const branchIndex = args.indexOf("--branch");
const compareIndex = args.indexOf("--compare");
const branchName = branchIndex >= 0 ? args[branchIndex + 1] : "";
const compareRange = compareIndex >= 0 ? args[compareIndex + 1] : "";
const root = process.cwd();
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://openaitpm.com").replace(/\/+$/, "");
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

function runGit(commandArgs) {
  try {
    return execFileSync("git", commandArgs, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "";
  }
}

function readIdeas() {
  if (!existsSync(ideasDirectory)) {
    return [];
  }

  return readdirSync(ideasDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort()
    .map((fileName) => {
      const repoPath = `src/content/ideas/${fileName}`;
      const idea = JSON.parse(readFileSync(join(ideasDirectory, fileName), "utf8"));
      const slug = normalizeIdeaSlug(idea.slug || fileName.replace(/\.json$/, ""));

      return {
        fileName,
        name: idea.name || slug,
        route: idea.route || `/${slug}`,
        status: idea.status || "draft",
        repoPath,
        url: `${siteUrl}/${slug}`
      };
    });
}

function getChangedPaths() {
  if (!compareRange) {
    return [];
  }

  return runGit(["diff", "--name-only", compareRange])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const ideas = readIdeas();
const changedPaths = new Set(getChangedPaths());
const changedIdeas = all || changedPaths.size === 0
  ? ideas
  : ideas.filter((idea) => changedPaths.has(idea.repoPath));
const listedIdeas = changedIdeas.length > 0 ? changedIdeas : ideas;
const currentBranch = branchName || runGit(["branch", "--show-current"]) || "unknown";

const report = {
  branch: currentBranch,
  siteUrl,
  compareRange: compareRange || null,
  changedPathCount: changedPaths.size,
  ideaCount: ideas.length,
  listedIdeaCount: listedIdeas.length,
  ideas: listedIdeas
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const titleSlug = currentBranch.split("/").slice(1).join("-") || currentBranch;
const titleName = titleSlug
  .replace(/[-_]+/g, " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const lines = [
  "Automated OpenAITPM idea-page PR.",
  "",
  `- Branch: \`${currentBranch}\``,
  `- Build: this workflow runs \`npm run verify\` after opening or refreshing the PR.`,
  "- Preview: Vercel will attach a deployment when the repository is connected.",
  "",
  "## Public routes"
];

for (const idea of listedIdeas) {
  lines.push(`- ${idea.name}: ${idea.url} (${idea.status}, \`${idea.repoPath}\`)`);
}

if (listedIdeas.length === 0) {
  lines.push("- No checked-in idea routes were found.");
}

lines.push("", `Suggested title: Launch idea page: ${titleName}`);

console.log(lines.join("\n"));

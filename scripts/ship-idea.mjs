import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const push = args.includes("--push");
const noVerify = args.includes("--no-verify");
const baseIndex = args.indexOf("--base");
const baseBranch = baseIndex >= 0 ? args[baseIndex + 1] : "main";
const rawName = args
  .filter((arg, index) => {
    if (arg === "--dry-run" || arg === "--push" || arg === "--no-verify" || arg === "--base") {
      return false;
    }
    return index !== baseIndex + 1;
  })
  .join(" ")
  .trim();

function usage() {
  console.error('Usage: npm run idea:ship -- "My Idea Name"');
  console.error('Dry run: npm run idea:ship -- --dry-run "My Idea Name"');
  console.error('Push too: npm run idea:ship -- --push "My Idea Name"');
}

function normalizeIdeaSlug(input) {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/^-+|-+$/g, "");

  return slug || "untitled-idea";
}

function formatIdeaNameFromSlug(slugInput) {
  return normalizeIdeaSlug(slugInput)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function git(commandArgs) {
  return execFileSync("git", commandArgs, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function safeGit(commandArgs) {
  try {
    return git(commandArgs);
  } catch {
    return "";
  }
}

function runOrPrint(commandArgs) {
  const command = `git ${commandArgs.join(" ")}`;
  if (dryRun) {
    console.log(`Would run: ${command}`);
    return "";
  }

  return git(commandArgs);
}

function ensureCleanTrackedChanges() {
  if (safeGit(["diff", "--name-only"])) {
    console.error("Tracked file changes exist. Commit or stash them before shipping a new idea.");
    process.exit(1);
  }

  if (safeGit(["diff", "--cached", "--name-only"])) {
    console.error("Staged changes exist. Commit or unstage them before shipping a new idea.");
    process.exit(1);
  }
}

if (!rawName || (baseIndex >= 0 && !baseBranch)) {
  usage();
  process.exit(1);
}

const slug = normalizeIdeaSlug(rawName);
const name = formatIdeaNameFromSlug(slug);
const branch = `idea/${slug}`;
const relativePath = `src/content/ideas/${slug}.json`;
const targetPath = join(process.cwd(), relativePath);
const originRemote = safeGit(["remote", "get-url", "origin"]);
const currentBranch = safeGit(["branch", "--show-current"]);
const branchExists = Boolean(safeGit(["branch", "--list", branch]));
const remoteBranchExists = originRemote ? Boolean(safeGit(["ls-remote", "--heads", "origin", branch])) : false;

if (!dryRun && existsSync(targetPath)) {
  console.error(`Idea already exists: ${relativePath}`);
  process.exit(1);
}

if (!dryRun && currentBranch !== baseBranch) {
  console.error(`Expected to start from ${baseBranch}, but current branch is ${currentBranch || "unknown"}.`);
  process.exit(1);
}

if (!dryRun && branchExists) {
  console.error(`Local branch already exists: ${branch}`);
  process.exit(1);
}

if (!dryRun && remoteBranchExists) {
  console.error(`Remote branch already exists: ${branch}`);
  process.exit(1);
}

if (!dryRun) {
  ensureCleanTrackedChanges();
}

const ideaFile = {
  slug,
  name,
  status: "draft",
  tagline: `${name} is ready for its first customer-facing page.`,
  thesis:
    "Replace this with the crisp customer promise: the problem, the target user, the decision or workflow it improves, and the proof that makes it worth building.",
  audience: "Define the buyer, user, and first customer segment.",
  sourceBranch: branch,
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

runOrPrint(["checkout", "-b", branch, baseBranch]);

if (dryRun) {
  console.log(`Would create ${relativePath}`);
} else {
  mkdirSync(join(process.cwd(), "src", "content", "ideas"), { recursive: true });
  writeFileSync(targetPath, `${JSON.stringify(ideaFile, null, 2)}\n`);
}

runOrPrint(["add", relativePath]);
runOrPrint(["commit", noVerify ? "--no-verify" : "", "-m", `Add ${name} idea page`].filter(Boolean));

if (push) {
  if (!originRemote && !dryRun) {
    console.error("No origin remote configured. Run npm run github:connect first.");
    process.exit(1);
  }
  runOrPrint(["push", "-u", "origin", branch]);
} else {
  console.log(`Created local idea branch flow for /${slug}.`);
  console.log(`Push when ready: git push -u origin ${branch}`);
}

console.log(`Route: /${slug}`);
console.log(`PR trigger: push ${branch} to GitHub.`);

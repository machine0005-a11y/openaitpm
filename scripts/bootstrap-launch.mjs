import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const push = args.includes("--push");
const replace = args.includes("--replace");
const ideaIndex = args.indexOf("--idea");
const repoUrl = args.find((arg, index) => {
  if (arg.startsWith("--")) {
    return false;
  }
  return index !== ideaIndex + 1;
});
const ideaName = ideaIndex >= 0 ? args[ideaIndex + 1] : "";

function usage() {
  console.error("Usage: npm run launch:bootstrap -- <git-remote-url>");
  console.error(
    'With first idea: npm run launch:bootstrap -- --push --idea "Investor Update Room" git@github.com:owner/openaitpm.git'
  );
  console.error(
    'Dry run: npm run launch:bootstrap -- --dry-run --idea "Investor Update Room" git@github.com:owner/openaitpm.git'
  );
}

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

function requireCleanTrackedChanges() {
  if (safeGit(["diff", "--name-only"]) || safeGit(["diff", "--cached", "--name-only"])) {
    console.error("Tracked or staged file changes exist. Commit or stash them before bootstrapping.");
    process.exit(1);
  }
}

function ensureRepoUrl(value) {
  if (!value || !value.includes("github.com") || !value.endsWith(".git")) {
    usage();
    process.exit(1);
  }
}

function connectOrigin(value) {
  // A dry run demonstrates first-time bootstrap steps regardless of the
  // current checkout's remote configuration.
  const existingOrigin = dryRun ? "" : safeGit(["remote", "get-url", "origin"]);

  if (existingOrigin && existingOrigin !== value && !replace) {
    console.error(`origin is already set to ${existingOrigin}`);
    console.error("Use --replace if you intentionally want to point origin at a different repo.");
    process.exit(1);
  }

  if (!existingOrigin) {
    runOrPrint(["remote", "add", "origin", value]);
    return;
  }

  if (existingOrigin !== value && replace) {
    runOrPrint(["remote", "set-url", "origin", value]);
    return;
  }

  console.log(`origin already points to ${value}`);
}

function createIdeaFile(nameInput) {
  const slug = normalizeIdeaSlug(nameInput);
  const name = formatIdeaNameFromSlug(slug);
  const branch = `idea/${slug}`;
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

  runOrPrint(["checkout", "-b", branch, "main"]);

  if (dryRun) {
    console.log(`Would create ${relativePath}`);
  } else {
    mkdirSync(join(process.cwd(), "src", "content", "ideas"), { recursive: true });
    writeFileSync(targetPath, `${JSON.stringify(ideaFile, null, 2)}\n`);
  }

  runOrPrint(["add", relativePath]);
  runOrPrint(["commit", "-m", `Add ${name} idea page`]);

  if (push) {
    runOrPrint(["push", "-u", "origin", branch]);
  } else {
    console.log(`Push when ready: git push -u origin ${branch}`);
  }

  console.log(`Idea route: /${slug}`);
  console.log(`PR trigger: push ${branch} to GitHub.`);
}

ensureRepoUrl(repoUrl);

const currentBranch = safeGit(["branch", "--show-current"]);
const latestCommit = safeGit(["rev-parse", "--short", "HEAD"]);

if (!latestCommit) {
  console.error("No local commit exists yet. Commit the launchpad before bootstrapping.");
  process.exit(1);
}

if (!dryRun && currentBranch !== "main") {
  console.error(`Expected to start from main, but current branch is ${currentBranch || "unknown"}.`);
  process.exit(1);
}

if (!dryRun) {
  requireCleanTrackedChanges();
}

connectOrigin(repoUrl);

if (push) {
  runOrPrint(["push", "-u", "origin", "main"]);
} else {
  console.log("Main is connected locally. Push when ready: git push -u origin main");
}

if (ideaName) {
  createIdeaFile(ideaName);
} else {
  console.log('First idea branch can be shipped with: npm run idea:ship -- --push "My Idea Name"');
}

console.log(`Bootstrap target: ${repoUrl}${dryRun ? " (dry run)" : ""}.`);

import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const push = args.includes("--push");
const replace = args.includes("--replace");
const repoUrl = args.find((arg) => !arg.startsWith("--"));

function usage() {
  console.error("Usage: npm run github:connect -- <git-remote-url>");
  console.error("Dry run: npm run github:connect -- --dry-run git@github.com:owner/openaitpm.git");
  console.error("Push main too: npm run github:connect -- --push git@github.com:owner/openaitpm.git");
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

if (!repoUrl) {
  usage();
  process.exit(1);
}

if (!repoUrl.includes("github.com") || !repoUrl.endsWith(".git")) {
  console.error("Expected a GitHub remote URL ending in .git.");
  usage();
  process.exit(1);
}

const currentBranch = safeGit(["branch", "--show-current"]);
const latestCommit = safeGit(["rev-parse", "--short", "HEAD"]);
// A dry run demonstrates the first-time connection flow without being coupled
// to the current checkout's already-configured remote.
const existingOrigin = dryRun ? "" : safeGit(["remote", "get-url", "origin"]);

if (!latestCommit) {
  console.error("No local commit exists yet. Commit the launchpad before connecting GitHub.");
  process.exit(1);
}

if (!dryRun && currentBranch !== "main") {
  console.error(`Expected to connect from main, but current branch is ${currentBranch || "unknown"}.`);
  process.exit(1);
}

if (existingOrigin && existingOrigin !== repoUrl && !replace) {
  console.error(`origin is already set to ${existingOrigin}`);
  console.error("Use --replace if you intentionally want to point origin at a different repo.");
  process.exit(1);
}

if (!existingOrigin) {
  runOrPrint(["remote", "add", "origin", repoUrl]);
} else if (existingOrigin !== repoUrl && replace) {
  runOrPrint(["remote", "set-url", "origin", repoUrl]);
} else {
  console.log(`origin already points to ${repoUrl}`);
}

if (push) {
  runOrPrint(["push", "-u", "origin", "main"]);
} else {
  console.log("Origin configured. Push when ready with: git push -u origin main");
}

console.log(`Connected ${latestCommit} on ${currentBranch || "unknown branch"} to ${repoUrl}${dryRun ? " (dry run)" : ""}.`);

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const args = new Set(process.argv.slice(2));
const strict = args.has("--strict");
const json = args.has("--json");
const root = process.cwd();

function readText(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return existsSync(join(root, relativePath));
}

function runGit(argsForGit) {
  try {
    return execFileSync("git", argsForGit, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function check(id, label, passed, detail, fix) {
  return {
    id,
    label,
    status: passed ? "pass" : "fail",
    detail,
    fix
  };
}

function hasPackageScript(packageJson, scriptName) {
  return Boolean(packageJson.scripts?.[scriptName]);
}

const packageJson = JSON.parse(readText("package.json"));
const ideaFiles = exists("src/content/ideas")
  ? readdirSync(join(root, "src", "content", "ideas")).filter((fileName) => fileName.endsWith(".json"))
  : [];
const originRemote = runGit(["remote", "get-url", "origin"]);
const latestCommit = runGit(["rev-parse", "--short", "HEAD"]);
const currentBranch = runGit(["branch", "--show-current"]);
const workflow = exists(".github/workflows/idea-pr.yml")
  ? readText(".github/workflows/idea-pr.yml")
  : "";
const productionSmokeWorkflow = exists(".github/workflows/production-smoke.yml")
  ? readText(".github/workflows/production-smoke.yml")
  : "";
const ciWorkflow = exists(".github/workflows/ci.yml") ? readText(".github/workflows/ci.yml") : "";
const vercelConfig = exists("vercel.json") ? readText("vercel.json") : "";
const deploymentDocs = exists("docs/OPENAITPM_DEPLOYMENT.md")
  ? readText("docs/OPENAITPM_DEPLOYMENT.md")
  : "";

const checks = [
  check(
    "git-commit",
    "Local repo has an initial commit",
    Boolean(latestCommit),
    latestCommit ? `Current commit ${latestCommit} on ${currentBranch || "unknown branch"}.` : "No commit found.",
    "Commit the OpenAITPM launchpad before pushing."
  ),
  check(
    "git-origin",
    "Git remote origin is configured",
    Boolean(originRemote),
    originRemote || "No origin remote configured.",
    "Create the OpenAITPM GitHub repo, then run npm run github:connect -- <repo-url>."
  ),
  check(
    "idea-content",
    "Checked-in idea content exists",
    ideaFiles.length > 0,
    `${ideaFiles.length} idea file(s): ${ideaFiles.join(", ") || "none"}.`,
    'Run npm run idea:new -- "My Idea Name".'
  ),
  check(
    "dynamic-route",
    "Dynamic /<idea-name> route exists",
    exists("src/app/[ideaName]/page.tsx"),
    "Route file src/app/[ideaName]/page.tsx is present.",
    "Restore the dynamic route."
  ),
  check(
    "generator",
    "Idea generator script exists",
    hasPackageScript(packageJson, "idea:new") && exists("scripts/create-idea.mjs"),
    `idea:new script is ${hasPackageScript(packageJson, "idea:new") ? "configured" : "missing"}.`,
    "Add npm script idea:new and scripts/create-idea.mjs."
  ),
  check(
    "idea-ship-helper",
    "Idea branch ship helper exists",
    hasPackageScript(packageJson, "idea:ship") && exists("scripts/ship-idea.mjs"),
    `idea:ship script is ${hasPackageScript(packageJson, "idea:ship") ? "configured" : "missing"}.`,
    "Add npm script idea:ship and scripts/ship-idea.mjs."
  ),
  check(
    "idea-route-verifier",
    "Idea route verifier exists",
    hasPackageScript(packageJson, "idea:verify:routes") && exists("scripts/verify-idea-routes.mjs"),
    `idea:verify:routes script is ${hasPackageScript(packageJson, "idea:verify:routes") ? "configured" : "missing"}.`,
    "Add npm script idea:verify:routes and scripts/verify-idea-routes.mjs."
  ),
  check(
    "route-aware-pr-body",
    "Route-aware PR body generator exists",
    hasPackageScript(packageJson, "idea:pr-body") && exists("scripts/pr-route-summary.mjs"),
    `idea:pr-body script is ${hasPackageScript(packageJson, "idea:pr-body") ? "configured" : "missing"}.`,
    "Add npm script idea:pr-body and scripts/pr-route-summary.mjs."
  ),
  check(
    "github-connect-helper",
    "GitHub remote connect helper exists",
    hasPackageScript(packageJson, "github:connect") && exists("scripts/connect-github.mjs"),
    `github:connect script is ${hasPackageScript(packageJson, "github:connect") ? "configured" : "missing"}.`,
    "Add npm script github:connect and scripts/connect-github.mjs."
  ),
  check(
    "launch-bootstrap-helper",
    "First-time launch bootstrap helper exists",
    hasPackageScript(packageJson, "launch:bootstrap") && exists("scripts/bootstrap-launch.mjs"),
    `launch:bootstrap script is ${hasPackageScript(packageJson, "launch:bootstrap") ? "configured" : "missing"}.`,
    "Add npm script launch:bootstrap and scripts/bootstrap-launch.mjs."
  ),
  check(
    "verify-script",
    "Full verification script exists",
    hasPackageScript(packageJson, "verify"),
    `verify script is ${hasPackageScript(packageJson, "verify") ? "configured" : "missing"}.`,
    "Add npm run verify with lint, typecheck, test, and build."
  ),
  check(
    "production-smoke",
    "Production smoke checker exists",
    hasPackageScript(packageJson, "smoke:production") &&
      exists("scripts/smoke-production.mjs") &&
      productionSmokeWorkflow.includes("npm run smoke:production"),
    `smoke:production script is ${hasPackageScript(packageJson, "smoke:production") ? "configured" : "missing"}.`,
    "Add npm script smoke:production, scripts/smoke-production.mjs, and the production smoke workflow."
  ),
  check(
    "auto-pr-workflow",
    "Branch push opens or updates PR",
    workflow.includes("branches-ignore:") &&
      workflow.includes("pull-requests: write") &&
      workflow.includes("pulls.create") &&
      workflow.includes("pulls.update"),
    ".github/workflows/idea-pr.yml contains the GitHub pull request automation.",
    "Restore the Idea PR Build workflow."
  ),
  check(
    "workflow-build",
    "Branch PR workflow runs the build gate",
    workflow.includes("npm run verify"),
    "Idea PR workflow runs npm run verify.",
    "Run npm run verify in the branch workflow."
  ),
  check(
    "main-ci",
    "Main and pull request CI exists",
    ciWorkflow.includes("pull_request:") && ciWorkflow.includes("branches:") && ciWorkflow.includes("main"),
    ".github/workflows/ci.yml verifies pull requests and main.",
    "Restore the CI workflow."
  ),
  check(
    "vercel-config",
    "Vercel build config exists",
    vercelConfig.includes("npm run build"),
    "vercel.json sets the build command.",
    "Add vercel.json with buildCommand npm run build."
  ),
  check(
    "public-site-metadata",
    "Public sitemap and robots routes exist",
    exists("src/app/sitemap.ts") && exists("src/app/robots.ts") && exists("src/lib/site.ts"),
    "sitemap.ts, robots.ts, and site.ts are present.",
    "Add domain-aware sitemap, robots, and site URL helpers."
  ),
  check(
    "deployment-runbook",
    "Deployment runbook documents domain and remote setup",
    deploymentDocs.includes("openAITpm.com") &&
      deploymentDocs.includes("npm run launch:bootstrap") &&
      deploymentDocs.includes("Vercel"),
    "docs/OPENAITPM_DEPLOYMENT.md covers GitHub, Vercel, and DNS setup.",
    "Update the OpenAITPM deployment runbook."
  )
];

const ready = checks.every((item) => item.status === "pass");
const report = {
  ready,
  checkedAt: new Date().toISOString(),
  checks
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`OpenAITPM launch readiness: ${ready ? "READY" : "NOT READY"}`);
  for (const item of checks) {
    const mark = item.status === "pass" ? "PASS" : "FAIL";
    console.log(`- ${mark} ${item.label}: ${item.detail}`);
    if (item.status === "fail") {
      console.log(`  Fix: ${item.fix}`);
    }
  }
}

if (strict && !ready) {
  process.exit(1);
}

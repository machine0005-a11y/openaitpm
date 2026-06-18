import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { getIdeaHref, getIdeaPage, listIdeaPages, normalizeIdeaSlug } from "@/lib/ideas/catalog";

describe("OpenAITPM idea routing", () => {
  it("normalizes human idea names into stable URL slugs", () => {
    expect(normalizeIdeaSlug(" Enterprise Leadership Context OS ")).toBe(
      "enterprise-leadership-context-os"
    );
    expect(normalizeIdeaSlug("AI TPM: Family & Friends")).toBe("ai-tpm-family-and-friends");
    expect(
      normalizeIdeaSlug(
        "Create a plan for a restaurant that is gonna be based around digital dart games dz0r"
      )
    ).toBe("create-a-plan-for-a-restaurant-that-is-gonna-be-based-around-digital-dart-games-dz0r");
  });

  it("serves known idea pages for checked-in concepts", () => {
    const idea = getIdeaPage("enterprise-leadership-context-os");

    expect(idea.name).toBe("Enterprise Leadership Context OS");
    expect(idea.route).toBe("/enterprise-leadership-context-os");
    expect(idea.sourceBranch).toBe("idea/enterprise-leadership-context-os");
  });

  it("generates a fallback page for any new checked-in idea path", () => {
    const idea = getIdeaPage("new-customer-demo-room");

    expect(idea.name).toBe("New Customer Demo Room");
    expect(idea.route).toBe("/new-customer-demo-room");
    expect(idea.launchChecks[0]).toMatchObject({ label: "Generated route", state: "done" });
  });

  it("lists catalog ideas and creates hrefs", () => {
    expect(listIdeaPages().map((idea) => idea.slug)).toContain("aitpm-family-project-room");
    expect(getIdeaHref("Person Moment Music")).toBe("/person-moment-music");
  });

  it("dry-runs the idea generator without writing files", () => {
    const output = execFileSync("node", [
      "scripts/create-idea.mjs",
      "--dry-run",
      "Investor Update Room"
    ]).toString();

    expect(output).toContain("Would create src/content/ideas/investor-update-room.json");
    expect(output).toContain("Route: /investor-update-room");
    expect(output).toContain("Branch: idea/investor-update-room");
  });

  it("dry-runs the idea shipping flow without changing git state", () => {
    const output = execFileSync("node", [
      "scripts/ship-idea.mjs",
      "--dry-run",
      "Customer Renewal Room"
    ]).toString();

    expect(output).toContain("Would run: git checkout -b idea/customer-renewal-room main");
    expect(output).toContain("Would create src/content/ideas/customer-renewal-room.json");
    expect(output).toContain("Would run: git commit -m Add Customer Renewal Room idea page");
    expect(output).toContain("PR trigger: push idea/customer-renewal-room to GitHub.");
  });

  it("verifies checked-in idea routes", () => {
    const output = execFileSync("node", ["scripts/verify-idea-routes.mjs"]).toString();
    const ideaCount = listIdeaPages().length;

    expect(output).toContain(`Verified ${ideaCount} idea route(s):`);
    expect(output).toContain("https://openaitpm.com/enterprise-leadership-context-os");
    expect(output).toContain("https://openaitpm.com/aitpm-family-project-room");
    expect(output).toContain("https://openaitpm.com/meet-the-dat");
  });

  it("generates a route-aware PR body from checked-in ideas", () => {
    const output = execFileSync("node", [
      "scripts/pr-route-summary.mjs",
      "--all",
      "--branch",
      "idea/customer-renewal-room"
    ]).toString();

    expect(output).toContain("Automated OpenAITPM idea-page PR.");
    expect(output).toContain("- Branch: `idea/customer-renewal-room`");
    expect(output).toContain("## Public routes");
    expect(output).toContain("https://openaitpm.com/enterprise-leadership-context-os");
    expect(output).toContain("https://openaitpm.com/aitpm-family-project-room");
  });

  it("audits launch readiness for the connected repository", () => {
    const output = execFileSync("node", ["scripts/launch-audit.mjs", "--json"]).toString();
    const report = JSON.parse(output) as {
      ready: boolean;
      checks: Array<{ id: string; status: "pass" | "fail"; detail: string }>;
    };
    const byId = new Map(report.checks.map((check) => [check.id, check]));

    expect(byId.get("dynamic-route")).toMatchObject({ status: "pass" });
    expect(byId.get("auto-pr-workflow")).toMatchObject({ status: "pass" });
    expect(byId.get("idea-ship-helper")).toMatchObject({ status: "pass" });
    expect(byId.get("idea-route-verifier")).toMatchObject({ status: "pass" });
    expect(byId.get("route-aware-pr-body")).toMatchObject({ status: "pass" });
    expect(byId.get("public-site-metadata")).toMatchObject({ status: "pass" });
    expect(byId.get("vercel-deploy-workflow")).toMatchObject({ status: "pass" });
    expect(byId.get("launch-checklist")).toMatchObject({ status: "pass" });
    expect(byId.get("github-connect-helper")).toMatchObject({ status: "pass" });
    expect(byId.get("git-origin")).toMatchObject({ status: "pass" });
    expect(report.ready).toBe(true);
  });

  it("dry-runs GitHub remote connection helper", () => {
    const output = execFileSync("node", [
      "scripts/connect-github.mjs",
      "--dry-run",
      "git@github.com:machine0005-a11y/openaitpm.git"
    ]).toString();

    expect(output).toContain("Would run: git remote add origin");
    expect(output).toContain("git@github.com:machine0005-a11y/openaitpm.git");
    expect(output).toContain("dry run");
  });

  it("dry-runs first-time launch bootstrap with a first idea", () => {
    const output = execFileSync("node", [
      "scripts/bootstrap-launch.mjs",
      "--dry-run",
      "--idea",
      "Customer Renewal Room",
      "git@github.com:machine0005-a11y/openaitpm.git"
    ]).toString();

    expect(output).toContain("Would run: git remote add origin");
    expect(output).toContain("Would run: git checkout -b idea/customer-renewal-room main");
    expect(output).toContain("Would create src/content/ideas/customer-renewal-room.json");
    expect(output).toContain("Bootstrap target: git@github.com:machine0005-a11y/openaitpm.git (dry run).");
  });

  it("dry-runs production smoke checks for public routes", () => {
    const output = execFileSync("node", [
      "scripts/smoke-production.mjs",
      "--dry-run",
      "--json"
    ]).toString();
    const report = JSON.parse(output) as {
      live: boolean;
      baseUrl: string;
      checks: Array<{ label: string; url: string; status: string }>;
    };

    expect(report.live).toBe(false);
    expect(report.baseUrl).toBe("https://openaitpm.com");
    expect(report.checks.map((check) => check.label)).toContain(
      "idea:enterprise-leadership-context-os"
    );
    expect(report.checks.map((check) => check.url)).toContain(
      "https://openaitpm.com/enterprise-leadership-context-os"
    );
  });
});

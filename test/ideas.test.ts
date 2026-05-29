import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { getIdeaHref, getIdeaPage, listIdeaPages, normalizeIdeaSlug } from "@/lib/ideas/catalog";

describe("OpenAITPM idea routing", () => {
  it("normalizes human idea names into stable URL slugs", () => {
    expect(normalizeIdeaSlug(" Enterprise Leadership Context OS ")).toBe(
      "enterprise-leadership-context-os"
    );
    expect(normalizeIdeaSlug("AI TPM: Family & Friends")).toBe("ai-tpm-family-and-friends");
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

  it("audits launch readiness and reports missing external setup", () => {
    const output = execFileSync("node", ["scripts/launch-audit.mjs", "--json"]).toString();
    const report = JSON.parse(output) as {
      ready: boolean;
      checks: Array<{ id: string; status: "pass" | "fail"; detail: string }>;
    };
    const byId = new Map(report.checks.map((check) => [check.id, check]));

    expect(byId.get("dynamic-route")).toMatchObject({ status: "pass" });
    expect(byId.get("auto-pr-workflow")).toMatchObject({ status: "pass" });
    expect(byId.get("git-origin")).toMatchObject({ status: "fail" });
    expect(report.ready).toBe(false);
  });
});

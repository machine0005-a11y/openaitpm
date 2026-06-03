import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { gates, invariants } from "@/lib/foundation/gates";

const root = process.cwd();

describe("Gate 0 foundation", () => {
  it("tracks every required repo operating-system document", () => {
    const requiredDocs = [
      "PLAN.md",
      "STATE.md",
      "TODO.md",
      "DECISIONS.md",
      "ARCHITECTURE.md",
      "PRIVACY.md",
      "INTEGRATIONS.md",
      "DEMO.md",
      "ECONOMICS.md",
      "LAUNCH_CHECKLIST.json"
    ];

    for (const doc of requiredDocs) {
      expect(existsSync(join(root, "docs", doc)), doc).toBe(true);
    }
  });

  it("keeps product gates and invariants explicit", () => {
    expect(gates).toHaveLength(6);
    expect(gates[0]).toMatchObject({ id: "gate-0", status: "complete" });
    expect(gates[1]).toMatchObject({ id: "gate-1", status: "next" });
    expect(invariants).toContain("Raw journal text is private by default.");
  });

  it("exposes verification scripts and required environment placeholders", () => {
    const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const envExample = readFileSync(join(root, ".env.example"), "utf8");

    expect(packageJson.scripts).toMatchObject({
      lint: "eslint",
      typecheck: "tsc --noEmit",
      test: "vitest run",
      build: "next build"
    });
    expect(envExample).toContain("DATABASE_URL=");
    expect(envExample).toContain("MUSICGEN_PROVIDER=\"stub\"");
    expect(envExample).toContain("INSTAGRAM_SSO_ENABLED=\"false\"");
  });
});

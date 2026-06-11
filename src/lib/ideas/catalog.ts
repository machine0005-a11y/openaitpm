import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { formatIdeaNameFromSlug, normalizeIdeaSlug } from "@/lib/ideas/slug";

export type IdeaStatus = "draft" | "building" | "preview" | "live";

export type IdeaMilestone = {
  label: string;
  state: "done" | "active" | "next";
};

export type IdeaPage = {
  slug: string;
  name: string;
  status: IdeaStatus;
  tagline: string;
  thesis: string;
  audience: string;
  route: string;
  sourceBranch: string;
  repoPath: string;
  primaryCta: string;
  secondaryCta: string;
  proofPoints: string[];
  launchChecks: IdeaMilestone[];
  heroImage?: string | null;
};

type IdeaFile = Omit<IdeaPage, "route"> & {
  route?: string;
};

const ideasDirectory = join(process.cwd(), "src", "content", "ideas");

function isIdeaStatus(value: unknown): value is IdeaStatus {
  return value === "draft" || value === "building" || value === "preview" || value === "live";
}

function isMilestoneState(value: unknown): value is IdeaMilestone["state"] {
  return value === "done" || value === "active" || value === "next";
}

function readIdeaFiles(): IdeaPage[] {
  if (!existsSync(ideasDirectory)) {
    return [];
  }

  return readdirSync(ideasDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => {
      const filePath = join(ideasDirectory, fileName);
      const parsed = JSON.parse(readFileSync(filePath, "utf8")) as Partial<IdeaFile>;
      const slug = normalizeIdeaSlug(parsed.slug ?? fileName.replace(/\.json$/, ""));

      if (!parsed.name || !parsed.tagline || !parsed.thesis || !parsed.audience) {
        throw new Error(`Idea content ${fileName} is missing required customer-facing copy.`);
      }

      if (!isIdeaStatus(parsed.status)) {
        throw new Error(`Idea content ${fileName} has an invalid status.`);
      }

      if (!Array.isArray(parsed.proofPoints) || parsed.proofPoints.length === 0) {
        throw new Error(`Idea content ${fileName} needs at least one proof point.`);
      }

      if (
        !Array.isArray(parsed.launchChecks) ||
        parsed.launchChecks.some((check) => !check.label || !isMilestoneState(check.state))
      ) {
        throw new Error(`Idea content ${fileName} has invalid launch checks.`);
      }

      return {
        slug,
        name: parsed.name,
        status: parsed.status,
        tagline: parsed.tagline,
        thesis: parsed.thesis,
        audience: parsed.audience,
        route: parsed.route ?? `/${slug}`,
        sourceBranch: parsed.sourceBranch ?? `idea/${slug}`,
        repoPath: parsed.repoPath ?? `src/content/ideas/${slug}.json`,
        primaryCta: parsed.primaryCta ?? "Open idea page",
        secondaryCta: parsed.secondaryCta ?? "Review launch plan",
        proofPoints: parsed.proofPoints,
        launchChecks: parsed.launchChecks,
        heroImage: parsed.heroImage ?? null
      };
    })
    .sort((first, second) => first.name.localeCompare(second.name));
}

function buildGeneratedIdea(slugInput: string): IdeaPage {
  const slug = normalizeIdeaSlug(slugInput);
  const name = formatIdeaNameFromSlug(slug);

  return {
    slug,
    name,
    status: "draft",
    tagline: `${name} is ready for its first product page.`,
    thesis:
      "This page is generated from the URL so every new checked-in idea can have a stable public landing path before bespoke copy exists.",
    audience: "Early testers, collaborators, and customers reviewing the concept.",
    route: `/${slug}`,
    sourceBranch: `idea/${slug}`,
    repoPath: "src/lib/ideas/catalog.ts",
    primaryCta: "Start idea page",
    secondaryCta: "Add catalog entry",
    proofPoints: [
      "The URL is stable and shareable.",
      "The page renders before a custom data entry exists.",
      "A checked-in catalog entry can upgrade this generated page into a polished customer page."
    ],
    launchChecks: [
      { label: "Generated route", state: "done" },
      { label: "Custom catalog content", state: "active" },
      { label: "Customer-ready proof", state: "next" }
    ],
    heroImage: null
  };
}

export function listIdeaPages(): IdeaPage[] {
  return readIdeaFiles();
}

export function getIdeaPage(slugInput: string): IdeaPage {
  const slug = normalizeIdeaSlug(slugInput);
  return readIdeaFiles().find((idea) => idea.slug === slug) ?? buildGeneratedIdea(slug);
}

export function getIdeaHref(slugInput: string): string {
  return `/${normalizeIdeaSlug(slugInput)}`;
}

export { formatIdeaNameFromSlug, normalizeIdeaSlug };

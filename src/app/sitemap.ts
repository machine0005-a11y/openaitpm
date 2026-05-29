import type { MetadataRoute } from "next";
import { listIdeaPages } from "@/lib/ideas/catalog";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const ideaPages = listIdeaPages().map((idea) => ({
    url: getAbsoluteUrl(idea.route),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: idea.status === "live" ? 1 : 0.8
  }));

  return [
    {
      url: getSiteUrl(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: getAbsoluteUrl("/docs/openaitpm-deployment"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5
    },
    ...ideaPages
  ];
}

const fallbackSiteUrl = "https://openaitpm.com";

export function getSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const siteUrl = configuredUrl || fallbackSiteUrl;

  return siteUrl.replace(/\/+$/, "");
}

export function getAbsoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export const displayDomain = "openAITpm.com";

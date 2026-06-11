import type { Metadata } from "next";
import { cookies } from "next/headers";
import { IdeaLaunchPage } from "@/components/ideas/IdeaLaunchPage";
import { Paywall } from "@/components/ideas/Paywall";
import { getIdeaPage, listIdeaPages } from "@/lib/ideas/catalog";
import { themeFor } from "@/lib/ideas/theme";
import { unlockCookieName, verifyUnlock, PRICE_LABEL, stripeConfigured } from "@/lib/paywall";

export const dynamic = "force-dynamic";

type IdeaRouteProps = {
  params: Promise<{
    ideaName: string;
  }>;
};

export async function generateMetadata({ params }: IdeaRouteProps): Promise<Metadata> {
  const { ideaName } = await params;
  const idea = getIdeaPage(ideaName);

  return {
    title: `${idea.name} | ideamuses`,
    description: idea.tagline
  };
}

export default async function IdeaRoute({ params }: IdeaRouteProps) {
  const { ideaName } = await params;
  const idea = getIdeaPage(ideaName);

  // Paywall: the page is locked until the visitor pays $0.99 (Apple Pay).
  const cookieStore = await cookies();
  const token = cookieStore.get(unlockCookieName(idea.slug))?.value;
  const unlocked = verifyUnlock(idea.slug, token);

  if (!unlocked) {
    const theme = themeFor(idea.slug);
    return (
      <Paywall
        slug={idea.slug}
        name={idea.name}
        theme={{ from: theme.from, to: theme.to, ink: theme.ink }}
        priceLabel={PRICE_LABEL}
        demo={!stripeConfigured()}
        heroImage={idea.heroImage}
      />
    );
  }

  const relatedIdeas = listIdeaPages().filter((related) => related.slug !== idea.slug).slice(0, 3);
  return <IdeaLaunchPage idea={idea} relatedIdeas={relatedIdeas} />;
}

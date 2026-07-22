import type { Metadata } from "next";
import { cookies } from "next/headers";
import { IdeaLaunchPage } from "@/components/ideas/IdeaLaunchPage";
import { getIdeaPage, listIdeaPages } from "@/lib/ideas/catalog";
import { unlockCookieName, verifyUnlock, PRICE_LABEL, paymentMode, personalPayUrl } from "@/lib/paywall";

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

  // Locked showcase: visitors see the REAL page down through the hero + thesis
  // (~13%); the remaining 87% unlocks for $0.99 via Apple Pay / Google Pay.
  const cookieStore = await cookies();
  const token = cookieStore.get(unlockCookieName(idea.slug))?.value;
  const unlocked = verifyUnlock(idea.slug, token);

  if (!unlocked) {
    return (
      <IdeaLaunchPage
        idea={idea}
        locked
        unlock={{ priceLabel: PRICE_LABEL, mode: paymentMode(), payUrl: personalPayUrl() }}
      />
    );
  }

  const relatedIdeas = listIdeaPages().filter((related) => related.slug !== idea.slug).slice(0, 3);
  return <IdeaLaunchPage idea={idea} relatedIdeas={relatedIdeas} />;
}

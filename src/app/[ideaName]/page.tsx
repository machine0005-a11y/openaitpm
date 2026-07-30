import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { IdeaLaunchPage } from "@/components/ideas/IdeaLaunchPage";
import { findIdeaPage, listIdeaPages } from "@/lib/ideas/catalog";
import { unlockCookieName, verifyUnlock, PRICE_LABEL, paymentMode, personalPayUrl, appleCashNumber, appleCashDisplay } from "@/lib/paywall";

export const dynamic = "force-dynamic";

type IdeaRouteProps = {
  params: Promise<{
    ideaName: string;
  }>;
};

export async function generateMetadata({ params }: IdeaRouteProps): Promise<Metadata> {
  const { ideaName } = await params;
  const idea = findIdeaPage(ideaName);

  // Never echo an unknown slug back as a title: the slug itself is untrusted text.
  if (!idea) {
    return { title: "Not found | ideamuses", robots: { index: false, follow: false } };
  }

  return {
    title: `${idea.name} | ideamuses`,
    description: idea.tagline
  };
}

export default async function IdeaRoute({ params }: IdeaRouteProps) {
  const { ideaName } = await params;
  const idea = findIdeaPage(ideaName);

  // No checked-in content = 404. Previously this route generated a page from the
  // slug, which meant any URL rendered as a real page and leaked whatever text
  // was in the slug.
  if (!idea) notFound();

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
        unlock={{
          priceLabel: PRICE_LABEL,
          mode: paymentMode(),
          payUrl: personalPayUrl(),
          appleCashNumber: appleCashNumber(),
          appleCashDisplay: appleCashDisplay()
        }}
      />
    );
  }

  const relatedIdeas = listIdeaPages().filter((related) => related.slug !== idea.slug).slice(0, 3);
  return <IdeaLaunchPage idea={idea} relatedIdeas={relatedIdeas} />;
}

import type { Metadata } from "next";
import { IdeaLaunchPage } from "@/components/ideas/IdeaLaunchPage";
import { getIdeaPage, listIdeaPages } from "@/lib/ideas/catalog";

type IdeaRouteProps = {
  params: Promise<{
    ideaName: string;
  }>;
};

export function generateStaticParams() {
  return listIdeaPages().map((idea) => ({ ideaName: idea.slug }));
}

export async function generateMetadata({ params }: IdeaRouteProps): Promise<Metadata> {
  const { ideaName } = await params;
  const idea = getIdeaPage(ideaName);

  return {
    title: `${idea.name} | OpenAITPM`,
    description: idea.tagline
  };
}

export default async function IdeaRoute({ params }: IdeaRouteProps) {
  const { ideaName } = await params;
  const idea = getIdeaPage(ideaName);
  const relatedIdeas = listIdeaPages().filter((related) => related.slug !== idea.slug).slice(0, 3);

  return <IdeaLaunchPage idea={idea} relatedIdeas={relatedIdeas} />;
}

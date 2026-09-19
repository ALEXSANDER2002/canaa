import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/session";
import { ARTICLES, getArticle } from "@/lib/articles";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return { title: article?.title ?? "Artigo" };
}

export default async function ArtigoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireUser();
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href="/painel/biblioteca"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <Icon name="arrow" className="h-4 w-4 rotate-180" />
        Biblioteca
      </Link>

      <div className="mt-5">
        <Badge tone="clay">{article.category}</Badge>
        <h1 className="mt-3 text-3xl text-ink">{article.title}</h1>
        <p className="mt-2 text-sm text-muted">
          {article.readMinutes} min de leitura
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {article.body.map((block, i) => (
          <div key={i}>
            {block.heading && (
              <h2 className="mb-1.5 text-xl text-ink">{block.heading}</h2>
            )}
            <p className="leading-relaxed text-ink/80">{block.text}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 border-l-2 border-clay-300 pl-3 text-xs text-muted">
        Conteúdo educativo e geral. Em caso de dúvidas ou sintomas, procure um
        profissional de saúde.
      </p>
    </article>
  );
}

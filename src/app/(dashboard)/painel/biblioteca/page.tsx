import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/session";
import { ARTICLES } from "@/lib/articles";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Biblioteca de saúde" };

export default async function BibliotecaPage() {
  await requireUser();

  return (
    <div>
      <PageHeader
        title="Biblioteca de saúde"
        description="Conteúdo educativo para você conhecer melhor o seu corpo."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {ARTICLES.map((a) => (
          <Link key={a.slug} href={`/painel/biblioteca/${a.slug}`} className="group">
            <Card className="h-full transition duration-200 group-hover:-translate-y-0.5 group-hover:border-plum-200 group-hover:shadow-[var(--shadow-card-hover)]">
              <Badge tone="clay">{a.category}</Badge>
              <CardTitle className="mt-3">{a.title}</CardTitle>
              <p className="mt-2 text-sm text-muted">{a.excerpt}</p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-plum-700">
                Ler · {a.readMinutes} min
                <Icon name="arrow" className="h-4 w-4" />
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-6 border-l-2 border-clay-300 pl-3 text-xs text-muted">
        Conteúdo educativo e geral. Não substitui avaliação de profissionais de
        saúde.
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Recursos do piloto" };

const RECURSOS: {
  href: string;
  title: string;
  description: string;
  icon: IconName;
}[] = [
  {
    href: "/painel/relatorio",
    title: "Relatório de saúde",
    description: "Organize seus registros para levar à consulta.",
    icon: "book",
  },
  {
    href: "/painel/metas",
    title: "Insights e conquistas",
    description: "Acompanhe constância, hábitos e evolução.",
    icon: "spark",
  },
  {
    href: "/painel/biblioteca",
    title: "Biblioteca de saúde",
    description: "Conteúdo confiável para cada fase.",
    icon: "guide",
  },
];

export default async function PremiumPage() {
  await requireUser();
  return (
    <>
      <PageHeader
        title="Recursos do piloto"
        description="Durante o piloto, todos estes recursos estão liberados sem cobrança."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {RECURSOS.map((recurso) => (
          <Link key={recurso.href} href={recurso.href} className="group">
            <Card className="h-full transition-colors group-hover:border-plum-300">
              <Icon name={recurso.icon} className="h-6 w-6 text-plum-700" />
              <CardTitle className="mt-3">{recurso.title}</CardTitle>
              <p className="mt-1 text-sm text-muted">{recurso.description}</p>
              <p className="mt-4 text-sm font-semibold text-plum-700">
                Abrir recurso
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}

import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { PUBLIC_SERVICES, CAMPAIGNS } from "@/lib/public-services";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Serviços públicos" };

export default async function ServicosPage() {
  await requireUser();

  return (
    <div>
      <PageHeader
        title="Serviços públicos"
        description="Saúde da mulher na rede pública de Canaã dos Carajás."
      />

      <h2 className="mb-4 text-lg text-ink">Serviços disponíveis no SUS</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {PUBLIC_SERVICES.map((s) => (
          <Card key={s.title}>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-plum-50 text-plum-700">
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <div>
                <CardTitle>{s.title}</CardTitle>
                <p className="mt-1 text-sm text-muted">{s.description}</p>
                <p className="mt-2 text-xs font-medium text-plum-700">
                  Onde buscar: {s.where}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-lg text-ink">Campanhas</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {CAMPAIGNS.map((c) => (
          <Card key={c.title} className="bg-plum-50/50">
            <Badge tone="plum">{c.month}</Badge>
            <CardTitle className="mt-2 text-base">{c.title}</CardTitle>
            <p className="mt-1 text-sm text-muted">{c.description}</p>
          </Card>
        ))}
      </div>

      <p className="mt-8 border-l-2 border-clay-300 pl-3 text-xs text-muted">
        Informações orientativas. Os endereços e horários das unidades serão
        integrados a partir de dados oficiais da Secretaria Municipal de Saúde.
      </p>
    </div>
  );
}

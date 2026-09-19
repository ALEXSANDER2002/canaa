import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { podePublicar, ROTULO_PARCERIA } from "@core/parcerias";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Parceiros" };

export default async function ParceirosPage() {
  await requireUser();

  const candidatas = await db.campaign.findMany({
    where: { status: "aprovada" },
    include: { partner: { select: { nome: true, tipo: true } } },
    orderBy: { createdAt: "desc" },
  });
  const campanhas = candidatas.filter((campanha) => podePublicar(campanha));

  return (
    <>
      <PageHeader
        title="Rede de parceiros"
        description="Campanhas locais revisadas pela equipe e sempre identificadas como parceria."
      />

      {campanhas.length === 0 ? (
        <Card>
          <CardTitle>Nenhuma parceria ativa agora</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Esta área só mostra campanhas aprovadas e dentro do período de
            veiculação. Nenhum dado de saúde é usado para escolher anúncios.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {campanhas.map((campanha) => (
            <Card key={campanha.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="clay">{ROTULO_PARCERIA}</Badge>
                {campanha.bairro && (
                  <Badge tone="neutral">{campanha.bairro}</Badge>
                )}
              </div>
              <CardTitle className="mt-3">{campanha.titulo}</CardTitle>
              <p className="mt-1 text-sm text-ink">{campanha.texto}</p>
              <p className="mt-3 text-xs text-muted">
                {campanha.partner.nome}
              </p>
              {campanha.url && (
                <a
                  href={campanha.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-semibold text-plum-700 hover:underline"
                >
                  Ver detalhes
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

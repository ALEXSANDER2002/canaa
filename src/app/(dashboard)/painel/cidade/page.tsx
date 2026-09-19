import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import {
  cityCategoryLabel,
  situacaoDaAcao,
  SITUACAO_LABEL,
  CITY_CATEGORIES,
} from "@core/apoio";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Na cidade" };

export default async function CidadePage() {
  await requireUser();

  const acoes = await db.cityAction.findMany({
    where: { active: true },
    orderBy: [{ pinned: "desc" }, { startsAt: "asc" }, { createdAt: "desc" }],
  });

  // Encerradas descem para o fim em vez de sumir: saber que o mutirão foi
  // semana passada é informação, e some sozinho quando a Prefeitura arquiva.
  const ordenadas = [...acoes].sort((a, b) => {
    const fim = (x: (typeof acoes)[number]) =>
      situacaoDaAcao(x) === "encerrada" ? 1 : 0;
    return fim(a) - fim(b);
  });

  return (
    <>
      <PageHeader
        title="Na cidade"
        description="Mutirões, campanhas e ações da Prefeitura de Canaã dos Carajás."
      />

      {ordenadas.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">
            Nenhuma campanha publicada no momento. Quando a Secretaria de Saúde
            divulgar um mutirão ou uma ação, ele aparece aqui.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordenadas.map((a) => {
            const situacao = situacaoDaAcao(a);
            const encerrada = situacao === "encerrada";
            return (
              <Card key={a.id} className={encerrada ? "opacity-70" : undefined}>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display font-semibold text-ink">
                    {a.title}
                  </h2>
                  <Badge tone={encerrada ? "neutral" : "sage"}>
                    {SITUACAO_LABEL[situacao]}
                  </Badge>
                  <Badge tone="clay">{cityCategoryLabel(a.category)}</Badge>
                  {a.pinned && !encerrada && <Badge tone="plum">Urgente</Badge>}
                </div>

                <p className="mt-2 text-sm text-ink">{a.summary}</p>

                <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                  {a.location && <Linha termo="Onde" valor={a.location} />}
                  {a.startsAt && (
                    <Linha
                      termo="Quando"
                      valor={
                        a.endsAt
                          ? `${a.startsAt.toLocaleDateString("pt-BR")} a ${a.endsAt.toLocaleDateString("pt-BR")}`
                          : a.startsAt.toLocaleDateString("pt-BR")
                      }
                    />
                  )}
                  {a.contact && <Linha termo="Contato" valor={a.contact} />}
                </dl>

                {a.url && (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-semibold text-plum-700 hover:underline"
                  >
                    Mais informações
                  </a>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-muted">
        Categorias publicadas pela Prefeitura:{" "}
        {CITY_CATEGORIES.map((c) => c.label).join(", ")}.
      </p>
    </>
  );
}

function Linha({ termo, valor }: { termo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {termo}
      </dt>
      <dd className="text-ink">{valor}</dd>
    </div>
  );
}

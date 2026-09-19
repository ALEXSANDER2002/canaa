import { requirePermissao } from "@/lib/roles";
import { db } from "@/lib/db";
import { cityCategoryLabel, situacaoDaAcao, SITUACAO_LABEL } from "@core/apoio";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AcaoForm } from "@/components/admin/acao-form";
import { arquivarAcaoAction } from "@/server/actions/admin";

export const metadata = { title: "Campanhas da cidade" };

export default async function AdminAcoes() {
  await requirePermissao("acoes:escrever");

  const acoes = await db.cityAction.findMany({
    orderBy: [{ active: "desc" }, { pinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Campanhas da cidade"
        description="Mutirão, vacinação e ações sociais. Conteúdo público, igual para todas."
      />

      <div className="mb-10 space-y-3">
        {acoes.length === 0 && (
          <Card>
            <p className="text-sm text-muted">
              Nenhuma campanha publicada ainda.
            </p>
          </Card>
        )}

        {acoes.map((a) => {
          const situacao = situacaoDaAcao(a);
          return (
            <Card key={a.id} className={a.active ? undefined : "opacity-60"}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-semibold text-ink">
                      {a.title}
                    </h3>
                    <Badge tone="clay">{cityCategoryLabel(a.category)}</Badge>
                    <Badge tone={situacao === "encerrada" ? "neutral" : "sage"}>
                      {SITUACAO_LABEL[situacao]}
                    </Badge>
                    {a.pinned && <Badge tone="plum">Fixada</Badge>}
                    {!a.active && <Badge tone="neutral">Arquivada</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-ink">{a.summary}</p>
                  <p className="mt-1 text-sm text-muted">
                    {[a.location, a.contact].filter(Boolean).join(" · ")}
                  </p>
                </div>

                <form action={arquivarAcaoAction} className="shrink-0">
                  <input type="hidden" name="id" value={a.id} />
                  <Button type="submit" size="sm" variant="outline">
                    {a.active ? "Arquivar" : "Republicar"}
                  </Button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>

      <AcaoForm />
    </>
  );
}

import { requirePermissao } from "@/lib/roles";
import { db } from "@/lib/db";
import { tipoUnidadeLabel, servicoLabel, servicosDa } from "@core/unidades";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnidadeForm } from "@/components/admin/unidade-form";
import { MapaUnidades } from "@/components/features/mapa-unidades";
import { alternarUnidadeAction } from "@/server/actions/admin";

export const metadata = { title: "Unidades de saúde" };

export default async function AdminUnidades() {
  await requirePermissao("unidades:escrever");

  const unidades = await db.healthUnit.findMany({
    orderBy: [{ ativa: "desc" }, { nome: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Unidades de saúde"
        description="Onde cada exame é feito. É esta lista que a tela de exames por idade consulta."
      />

      <MapaUnidades unidades={unidades} />

      <div className="mb-10 space-y-3">
        {unidades.length === 0 && (
          <Card>
            <p className="text-sm text-muted">
              Nenhuma unidade cadastrada. No app, a tela de exames mostra o
              exame sem dizer onde fazer.
            </p>
          </Card>
        )}

        {unidades.map((u) => (
          <Card key={u.id} className={u.ativa ? undefined : "opacity-60"}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-semibold text-ink">{u.nome}</h3>
                  <Badge tone="clay">{tipoUnidadeLabel(u.tipo)}</Badge>
                  {!u.ativa && <Badge tone="neutral">Desativada</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {[u.bairro, u.endereco, u.telefone, u.horario]
                    .filter(Boolean)
                    .join(" · ") || "Sem endereço cadastrado"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {servicosDa(u).map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-mist px-2.5 py-0.5 text-xs text-ink"
                    >
                      {servicoLabel(s)}
                    </span>
                  ))}
                  {servicosDa(u).length === 0 && (
                    <span className="text-xs text-muted">
                      Nenhum serviço marcado — não aparece em busca por exame.
                    </span>
                  )}
                </div>
                {u.observacao && (
                  <p className="mt-2 text-sm text-ink">{u.observacao}</p>
                )}
              </div>

              <form action={alternarUnidadeAction} className="shrink-0">
                <input type="hidden" name="id" value={u.id} />
                <Button type="submit" size="sm" variant="outline">
                  {u.ativa ? "Desativar" : "Reativar"}
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      <UnidadeForm outrasUnidades={unidades} />
    </>
  );
}

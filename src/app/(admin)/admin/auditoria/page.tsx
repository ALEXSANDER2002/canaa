import { requirePermissao } from "@/lib/roles";
import { db } from "@/lib/db";
import { papelLabel } from "@core/papeis";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Auditoria" };

const RECURSO_LABEL: Record<string, string> = {
  servico: "Rede de apoio",
  unidade: "Unidade de saúde",
  acao: "Campanha da cidade",
  campanha: "Peça de parceiro",
  moderacao: "Moderação",
  papel: "Papel",
};

const ACAO_LABEL: Record<string, string> = {
  criar: "criou",
  editar: "editou",
  apagar: "apagou",
  aprovar: "aprovou",
  recusar: "recusou",
  decidir: "decidiu",
};

export default async function AdminAuditoria() {
  await requirePermissao("auditoria:ler");

  const entradas = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      recurso: true,
      acao: true,
      detalhe: true,
      createdAt: true,
      actor: { select: { name: true, role: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Auditoria"
        description="Toda escrita administrativa, na ordem em que aconteceu."
      />

      <Card className="mb-8 border-plum-200 bg-plum-50">
        <CardTitle className="text-plum-900">O que não está aqui</CardTitle>
        <CardDescription className="text-plum-800">
          Nada vindo da usuária no pilar Proteção. Não existe registro de quem
          abriu a rede de apoio, quem consultou um telefone ou quem usou o
          cofre — porque a tela dela promete, por escrito, que esse rastro não
          existe. O que se audita aqui é o outro lado do balcão.
        </CardDescription>
      </Card>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
        {entradas.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            Nenhuma escrita administrativa registrada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {entradas.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-5 py-3">
                <time
                  dateTime={e.createdAt.toISOString()}
                  className="w-36 shrink-0 font-mono text-xs tabular-nums text-muted"
                >
                  {e.createdAt.toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
                <span className="text-sm font-semibold text-ink">
                  {e.actor.name}
                </span>
                <Badge tone="neutral">{papelLabel(e.actor.role)}</Badge>
                <span className="text-sm text-muted">
                  {ACAO_LABEL[e.acao] ?? e.acao}
                </span>
                <Badge tone="clay">
                  {RECURSO_LABEL[e.recurso] ?? e.recurso}
                </Badge>
                {e.detalhe && (
                  <span className="min-w-0 text-sm text-ink">{e.detalhe}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

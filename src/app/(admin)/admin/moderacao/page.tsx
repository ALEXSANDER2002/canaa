import { requirePermissao } from "@/lib/roles";
import { db } from "@/lib/db";
import { apelidoDe, categoryLabel } from "@core/community";
import { DENUNCIAS_PARA_OCULTAR } from "@core/moderacao";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Selo } from "@/components/ui/selo";
import { ModeracaoForm } from "@/components/admin/moderacao-form";

export const metadata = { title: "Moderação" };

export default async function AdminModeracao() {
  await requirePermissao("moderacao:ler");

  /**
   * `userId` é selecionado, `user` não.
   *
   * O apelido é derivado do id (irreversível), e é ele que aparece na tela. O
   * nome real nunca é consultado — a fila de moderação é justamente onde a
   * tentação de "só conferir quem é" aparece, e a consulta não oferece a opção.
   */
  const fila = await db.communityPost.findMany({
    where: { hidden: true },
    orderBy: [{ reports: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      userId: true,
      category: true,
      body: true,
      reports: true,
      createdAt: true,
      _count: { select: { replies: true } },
    },
  });

  const decisoes = await db.moderationAction.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      decisao: true,
      nota: true,
      createdAt: true,
      moderator: { select: { name: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Moderação"
        description={`Relatos ocultos automaticamente a partir de ${DENUNCIAS_PARA_OCULTAR} denúncias, aguardando decisão humana.`}
      />

      <Card className="mb-8 border-clay-200 bg-clay-50">
        <CardTitle className="text-clay-700">Você vê o apelido, não o nome</CardTitle>
        <CardDescription className="text-clay-700">
          O apelido é derivado do id da autora e não tem volta. A consulta desta
          tela nem seleciona o nome real — não existe um jeito de descobrir quem
          escreveu a partir daqui, e isso é proposital.
        </CardDescription>
      </Card>

      <div className="space-y-4">
        {fila.length === 0 && (
          <Card>
            <p className="text-sm text-muted">
              Fila vazia. Nenhum relato aguardando revisão.
            </p>
          </Card>
        )}

        {fila.map((p) => (
          <Card key={p.id}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Selo userId={p.userId} size={32} />
              <span className="font-display font-semibold text-ink">
                {apelidoDe(p.userId)}
              </span>
              <Badge tone="neutral">{categoryLabel(p.category)}</Badge>
              <Badge tone="warning">
                {p.reports} denúncia{p.reports > 1 ? "s" : ""}
              </Badge>
              <span className="text-xs text-muted">
                {p.createdAt.toLocaleDateString("pt-BR")} ·{" "}
                {p._count.replies} resposta{p._count.replies === 1 ? "" : "s"}
              </span>
            </div>

            <p className="mb-5 whitespace-pre-wrap rounded-xl bg-mist p-4 text-sm text-ink">
              {p.body}
            </p>

            <ModeracaoForm postId={p.id} />
          </Card>
        ))}
      </div>

      {decisoes.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">
            Últimas decisões
          </h2>
          <Card>
            <ul className="divide-y divide-line text-sm">
              {decisoes.map((d) => (
                <li key={d.id} className="flex flex-wrap gap-x-3 py-2 first:pt-0 last:pb-0">
                  <span className="font-semibold text-ink">{d.decisao}</span>
                  <span className="text-muted">{d.moderator.name}</span>
                  <span className="text-muted">
                    {d.createdAt.toLocaleDateString("pt-BR")}
                  </span>
                  {d.nota && <span className="text-muted">— {d.nota}</span>}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </>
  );
}

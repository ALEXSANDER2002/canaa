import { requirePermissao } from "@/lib/roles";
import { db } from "@/lib/db";
import {
  verificacaoVencida,
  diasParaVencer,
  tipoServicoLabel,
  VALIDADE_VERIFICACAO_DIAS,
} from "@core/protecao";
import { CANAIS_NACIONAIS } from "@core/apoio";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServicoForm } from "@/components/admin/servico-form";
import { reverificarServicoAction, apagarServicoAction } from "@/server/actions/admin";

export const metadata = { title: "Rede de apoio" };

export default async function AdminServicos() {
  const operadora = await requirePermissao("servicos:escrever");

  const servicos = await db.supportService.findMany({
    orderBy: [{ kind: "asc" }, { ordem: "asc" }, { name: "asc" }],
  });

  const vencidos = servicos.filter((s) => verificacaoVencida(s.verifiedAt));

  return (
    <>
      <PageHeader
        title="Rede de apoio"
        description="Os contatos locais que aparecem no pilar Proteção do app."
      />

      <Card className="mb-8 border-plum-200 bg-plum-50">
        <CardTitle className="text-plum-900">
          Por que este cadastro é diferente dos outros
        </CardTitle>
        <CardDescription className="text-plum-800">
          Um telefone errado numa tela de violência é pior do que tela vazia. Se
          não houver nenhum contato verificado aqui, o app mostra apenas os{" "}
          {CANAIS_NACIONAIS.length} canais nacionais —{" "}
          {CANAIS_NACIONAIS.map((c) => c.numero).join(", ")} — que valem em
          qualquer município do país e não ficam desatualizados. Cada contato
          desta lista sai do ar sozinho {VALIDADE_VERIFICACAO_DIAS} dias depois
          da última verificação.
        </CardDescription>
      </Card>

      {vencidos.length > 0 && (
        <div className="mb-8 rounded-[var(--radius-card)] border border-danger-200 bg-danger-50 p-5">
          <p className="font-semibold text-danger-800">
            {vencidos.length} contato{vencidos.length > 1 ? "s" : ""} fora do ar
            por falta de verificação
          </p>
          <p className="mt-1 text-sm text-danger-700">
            Ligue para cada número e clique em &ldquo;Verifiquei agora&rdquo;.
            Enquanto isso, eles não aparecem para ninguém.
          </p>
        </div>
      )}

      <div className="mb-10 space-y-3">
        {servicos.length === 0 && (
          <Card>
            <p className="text-sm text-muted">
              Nenhum contato cadastrado ainda. O app está mostrando só os canais
              nacionais.
            </p>
          </Card>
        )}

        {servicos.map((s) => {
          const vencido = verificacaoVencida(s.verifiedAt);
          const dias = diasParaVencer(s.verifiedAt);
          return (
            <Card key={s.id} className={vencido ? "border-danger-200" : undefined}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-semibold text-ink">
                      {s.name}
                    </h3>
                    <Badge tone="neutral">{tipoServicoLabel(s.kind)}</Badge>
                    {vencido ? (
                      <Badge tone="warning">Fora do ar — verificação vencida</Badge>
                    ) : (
                      <Badge tone="sage">No ar · vence em {dias} dias</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {[s.phone, s.hours, s.address].filter(Boolean).join(" · ") ||
                      "Sem telefone cadastrado"}
                  </p>
                  {s.notes && <p className="mt-1 text-sm text-ink">{s.notes}</p>}
                  <p className="mt-2 text-xs text-muted">
                    {s.verifiedAt
                      ? `Verificado em ${s.verifiedAt.toLocaleDateString("pt-BR")} por ${s.verifiedBy ?? "—"}`
                      : "Nunca verificado"}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <form action={reverificarServicoAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="verifiedBy" value={operadora.name} />
                    <Button type="submit" size="sm" variant="outline">
                      Verifiquei agora
                    </Button>
                  </form>
                  <form action={apagarServicoAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <Button type="submit" size="sm" variant="ghost">
                      Apagar
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ServicoForm />
    </>
  );
}

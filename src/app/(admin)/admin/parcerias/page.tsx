import { requirePermissao, operadoraAtual } from "@/lib/roles";
import { db } from "@/lib/db";
import { pode } from "@core/papeis";
import {
  statusCampanhaLabel,
  motivoParaNaoPublicar,
  ROTULO_PARCERIA,
} from "@core/parcerias";
import { pilar, type PilarValue } from "@core/pilares";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampanhaForm } from "@/components/admin/campanha-form";
import { decidirCampanhaAction } from "@/server/actions/admin";

export const metadata = { title: "Parcerias" };

export default async function AdminParcerias() {
  await requirePermissao("parcerias:enviar");
  const operadora = await operadoraAtual();
  const podeAprovar = pode(operadora?.role ?? "", "parcerias:aprovar");

  // Parceiro vê só as próprias peças; quem aprova vê todas.
  const filtroParceiro =
    !podeAprovar && operadora?.organizationId
      ? { partner: { organizationId: operadora.organizationId } }
      : {};

  const [campanhas, parceiros] = await Promise.all([
    db.campaign.findMany({
      where: filtroParceiro,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { partner: { select: { nome: true } } },
    }),
    db.partner.findMany({
      where: {
        ativo: true,
        ...(podeAprovar || !operadora?.organizationId
          ? {}
          : { organizationId: operadora.organizationId }),
      },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Parcerias"
        description={`Toda peça aprovada aparece rotulada como "${ROTULO_PARCERIA}" no app.`}
      />

      <div className="mb-10 space-y-3">
        {campanhas.length === 0 && (
          <Card>
            <p className="text-sm text-muted">Nenhuma peça enviada ainda.</p>
          </Card>
        )}

        {campanhas.map((c) => {
          const impedimento = motivoParaNaoPublicar(c);
          return (
            <Card key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-semibold text-ink">
                      {c.titulo}
                    </h3>
                    <Badge tone={c.status === "aprovada" ? "sage" : "neutral"}>
                      {statusCampanhaLabel(c.status)}
                    </Badge>
                    <Badge tone="clay">{pilar(c.pilar as PilarValue).label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink">{c.texto}</p>
                  <p className="mt-1 text-xs text-muted">
                    {c.partner.nome}
                    {c.bairro ? ` · ${c.bairro}` : ""}
                    {c.cidade ? ` · ${c.cidade}` : ""}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {impedimento
                      ? `Fora do ar: ${impedimento}`
                      : "No ar agora."}
                  </p>
                  {c.motivoRecusa && (
                    <p className="mt-1 text-xs text-danger-700">
                      Recusada: {c.motivoRecusa}
                    </p>
                  )}
                </div>

                {podeAprovar && c.status === "enviada" && (
                  <div className="flex shrink-0 flex-col gap-2">
                    <form action={decidirCampanhaAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="decisao" value="aprovar" />
                      <Button type="submit" size="sm">
                        Aprovar
                      </Button>
                    </form>
                    <form action={decidirCampanhaAction} className="flex gap-2">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="decisao" value="recusar" />
                      <Input
                        name="motivo"
                        placeholder="Motivo"
                        className="h-9 w-36 text-xs"
                      />
                      <Button type="submit" size="sm" variant="outline">
                        Recusar
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <CampanhaForm parceiros={parceiros} />
    </>
  );
}

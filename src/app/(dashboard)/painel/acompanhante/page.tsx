import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { predictCycle, cyclePhase, pregnancyProgress, formatDate } from "@/lib/utils";
import {
  escoposDe,
  escopoLabel,
  temEscopo,
  dicaDoDia,
  STATUS_VINCULO_LABEL,
  type StatusVinculo,
} from "@core/acompanhante";
import { MOOD_OPTIONS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ConviteForm,
  EscoposForm,
  AceitarForm,
} from "@/components/features/acompanhante-forms";
import { revogarVinculoAction } from "@/server/actions/acompanhante";

export const metadata: Metadata = { title: "Quem me acompanha" };

function diaDoAno(d: Date): number {
  const inicio = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - inicio.getTime()) / 86_400_000);
}

export default async function AcompanhantePage() {
  const user = await requireUser();

  const [meuVinculo, acompanhando] = await Promise.all([
    db.partnerLink.findFirst({
      where: { ownerId: user.id, status: { in: ["pendente", "ativo"] } },
      include: { partner: { select: { name: true } } },
    }),
    db.partnerLink.findFirst({
      where: { partnerId: user.id, status: "ativo" },
      include: { owner: { select: { id: true, name: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Quem me acompanha"
        description="Compartilhe só o que você quiser, com quem você quiser, pelo tempo que quiser."
      />

      {meuVinculo ? (
        <Card className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>
              {meuVinculo.status === "ativo"
                ? meuVinculo.apelido || meuVinculo.partner?.name || "Acompanhante"
                : "Convite gerado"}
            </CardTitle>
            <Badge tone={meuVinculo.status === "ativo" ? "sage" : "warning"}>
              {STATUS_VINCULO_LABEL[meuVinculo.status as StatusVinculo]}
            </Badge>
          </div>

          {meuVinculo.status === "pendente" && (
            <div className="mt-4 rounded-xl border border-line bg-mist p-4">
              <p className="text-sm text-muted">
                Dite este código para a pessoa. Ele não tem vogais nem letras que
                se confundem lidas em voz alta.
              </p>
              <p className="mt-2 font-mono text-3xl font-bold tracking-[0.35em] text-ink">
                {meuVinculo.codigo}
              </p>
            </div>
          )}

          <EscoposForm id={meuVinculo.id} escopos={meuVinculo.escopos} />

          <form action={revogarVinculoAction} className="mt-4 border-t border-line pt-4">
            <input type="hidden" name="id" value={meuVinculo.id} />
            <Button type="submit" variant="ghost" size="sm">
              Encerrar o acesso
            </Button>
            <p className="mt-1 text-xs text-muted">
              A pessoa não é avisada. A tela dela simplesmente para de mostrar.
            </p>
          </form>
        </Card>
      ) : (
        <div className="mb-6">
          <ConviteForm />
        </div>
      )}

      {acompanhando ? (
        <VisaoDoAcompanhante
          ownerId={acompanhando.owner.id}
          nome={acompanhando.owner.name.split(" ")[0]}
          escopos={acompanhando.escopos}
        />
      ) : (
        <AceitarForm />
      )}
    </>
  );
}

/**
 * O que ELE vê.
 *
 * Cada bloco checa o escopo antes de consultar. Não existe "busca tudo e
 * esconde na interface": o que ela não liberou não sai do banco.
 */
async function VisaoDoAcompanhante({
  ownerId,
  nome,
  escopos,
}: {
  ownerId: string;
  nome: string;
  escopos: string;
}) {
  const mostraFase = temEscopo(escopos, "fase");
  const mostraPrevisao = temEscopo(escopos, "previsao");
  const mostraHumor = temEscopo(escopos, "humor");
  const mostraGestacao = temEscopo(escopos, "gestacao");

  const [ciclos, humor, gestacao] = await Promise.all([
    mostraFase || mostraPrevisao
      ? db.cycleEntry.findMany({
          where: { userId: ownerId },
          orderBy: { startDate: "desc" },
          take: 12,
          select: { startDate: true },
        })
      : Promise.resolve([]),
    mostraHumor
      ? db.moodEntry.findFirst({
          where: { userId: ownerId },
          orderBy: { date: "desc" },
          // `note` fora da seleção de propósito: ela liberou "como me sinto",
          // não o que ela escreveu sobre isso.
          select: { mood: true, date: true },
        })
      : Promise.resolve(null),
    mostraGestacao
      ? db.pregnancy.findFirst({
          where: { userId: ownerId, active: true },
          select: { lastPeriodDate: true },
        })
      : Promise.resolve(null),
  ]);

  const previsao = predictCycle(ciclos.map((c) => c.startDate));
  const fase =
    previsao && mostraFase
      ? cyclePhase(
          previsao.currentCycleDay,
          previsao.cycleLength,
          previsao.periodLength,
        )
      : null;
  const dica = fase ? dicaDoDia(fase.key, diaDoAno(new Date())) : null;
  const progresso = gestacao ? pregnancyProgress(gestacao.lastPeriodDate) : null;
  const humorInfo = humor
    ? MOOD_OPTIONS.find((m) => m.value === humor.mood)
    : null;

  return (
    <Card>
      <CardTitle>Acompanhando {nome}</CardTitle>
      <p className="mt-1 text-sm text-muted">
        Você vê: {escoposDe(escopos).map(escopoLabel).join(", ")}. Ela pode
        mudar ou encerrar isso a qualquer momento.
      </p>

      <div className="mt-5 space-y-4">
        {fase && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Fase de hoje
            </p>
            <p className="font-semibold text-ink">{fase.label}</p>
          </div>
        )}

        {mostraPrevisao && previsao && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Próxima menstruação
            </p>
            <p className="font-semibold text-ink">
              {formatDate(previsao.nextPeriodDate)}{" "}
              <span className="font-normal text-muted">(estimativa)</span>
            </p>
          </div>
        )}

        {humorInfo && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Como ela registrou
            </p>
            <p className="flex items-center gap-2 font-semibold text-ink">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: humorInfo.color }}
              />
              {humorInfo.label}
            </p>
          </div>
        )}

        {progresso && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Gestação
            </p>
            <p className="font-semibold text-ink">
              {progresso.weeks} semanas · {progresso.trimester}º trimestre
            </p>
          </div>
        )}

        {!fase && !progresso && !humorInfo && (
          <p className="text-sm text-muted">
            Ela ainda não registrou dados suficientes para mostrar alguma coisa.
          </p>
        )}
      </div>

      {dica && (
        <div className="mt-5 rounded-xl border border-clay-200 bg-clay-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-clay-700">
            O que você pode fazer hoje
          </p>
          <p className="mt-1 text-sm text-ink">{dica}</p>
        </div>
      )}
    </Card>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { SCREENINGS, faixaPara } from "@/lib/screenings";
import { servicoLabel } from "@core/unidades";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { CriarLembreteExame } from "@/components/features/lembrete-exame";

export const metadata: Metadata = { title: "Exames por idade" };

export default async function ExamesPage() {
  const sessao = await requireUser();

  const [usuaria, servicosDisponiveis] = await Promise.all([
    db.user.findUnique({
      where: { id: sessao.id },
      select: { birthDate: true },
    }),
    // Quais serviços EXISTEM em alguma unidade ativa. Sem isso, a tela
    // ofereceria "ver onde fazer" para um exame que nenhuma unidade do
    // município cadastrou — um link para uma lista vazia.
    db.healthUnit
      .findMany({ where: { ativa: true }, select: { servicos: true } })
      .then((us) =>
        new Set(
          us.flatMap((u) =>
            u.servicos
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          ),
        ),
      ),
  ]);

  const minha = faixaPara(usuaria?.birthDate);

  return (
    <div>
      <PageHeader
        title="Exames por idade"
        description="Um guia de cuidados preventivos ao longo da vida."
      />

      {minha && (
        <Card className="mb-6 border-plum-200 bg-plum-50">
          <p className="text-xs font-medium uppercase tracking-wide text-plum-700">
            Na sua faixa — {minha.age}
          </p>
          <ul className="mt-3 space-y-4">
            {minha.items.map((item) => (
              <li key={item.title}>
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="text-sm text-plum-900/80">{item.detail}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {item.sugestaoLembrete && (
                    <CriarLembreteExame titulo={item.sugestaoLembrete} />
                  )}
                  {item.servico && servicosDisponiveis.has(item.servico) && (
                    <Link
                      href={`/painel/unidades?servico=${item.servico}`}
                      className="rounded-xl border border-plum-300 px-3 py-1.5 text-sm font-semibold text-plum-800 hover:bg-plum-100"
                    >
                      Onde fazer {servicoLabel(item.servico).toLowerCase()}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="space-y-5">
        {SCREENINGS.map((group) => (
          <Card key={group.age}>
            <Badge tone={group.age === minha?.age ? "plum" : "neutral"}>
              {group.age}
            </Badge>
            <ul className="mt-4 space-y-3">
              {group.items.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <Icon
                    name="check"
                    className="mt-0.5 h-4 w-4 shrink-0 text-plum-500"
                    strokeWidth={2.5}
                  />
                  <div>
                    <p className="font-medium text-ink">{item.title}</p>
                    <p className="text-sm text-muted">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <p className="mt-6 border-l-2 border-clay-300 pl-3 text-xs text-muted">
        Guia orientativo e geral. A periodicidade e a indicação de cada exame
        devem ser definidas com um profissional de saúde.
      </p>
    </div>
  );
}

import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import {
  SERVICOS_UNIDADE,
  tipoUnidadeLabel,
  servicoLabel,
  servicosDa,
  oferece,
  type ServicoUnidade,
} from "@core/unidades";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComingSoon } from "@/components/ui/coming-soon";
import { MapaUnidades } from "@/components/features/mapa-unidades";

export const metadata: Metadata = { title: "Onde ser atendida" };

export default async function UnidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ servico?: string }>;
}) {
  await requireUser();
  const { servico } = await searchParams;

  const filtro = SERVICOS_UNIDADE.find((s) => s.value === servico)?.value as
    | ServicoUnidade
    | undefined;

  const todas = await db.healthUnit.findMany({
    where: { ativa: true },
    orderBy: [{ bairro: "asc" }, { nome: "asc" }],
  });

  const unidades = filtro ? todas.filter((u) => oferece(u, filtro)) : todas;

  if (todas.length === 0) {
    return (
      <ComingSoon
        icon="home"
        title="Unidades de atendimento"
        description="A lista das UBS, hospitais e policlínicas do município ainda não foi cadastrada pela Secretaria de Saúde."
        bullets={[
          "Quais serviços cada unidade faz — preventivo, pré-natal, mamografia",
          "Horário e telefone de cada uma",
          "O exame da sua idade ligado à unidade que o realiza",
        ]}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Onde ser atendida"
        description="Unidades do município e o que cada uma faz. Informação da Secretaria de Saúde."
      />

      <nav className="mb-6 flex flex-wrap gap-2">
        <FiltroLink ativo={!filtro} href="/painel/unidades" rotulo="Todas" />
        {SERVICOS_UNIDADE.map((s) => (
          <FiltroLink
            key={s.value}
            ativo={filtro === s.value}
            href={`/painel/unidades?servico=${s.value}`}
            rotulo={s.label}
          />
        ))}
      </nav>

      {unidades.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">
            Nenhuma unidade cadastrada faz {servicoLabel(filtro ?? "")} hoje.
            Ligue para a Secretaria de Saúde para confirmar antes de ir.
          </p>
        </Card>
      ) : (
        <>
          <MapaUnidades unidades={unidades} />
          <div className="space-y-3">
          {unidades.map((u) => (
            <Card key={u.id}>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display font-semibold text-ink">{u.nome}</h2>
                <Badge tone="clay">{tipoUnidadeLabel(u.tipo)}</Badge>
                {u.bairro && <Badge tone="neutral">{u.bairro}</Badge>}
              </div>

              {u.endereco && (
                <p className="mt-1 text-sm text-muted">{u.endereco}</p>
              )}
              {u.horario && (
                <p className="mt-0.5 text-sm text-muted">{u.horario}</p>
              )}
              {u.telefone && (
                <p className="mt-1 text-sm">
                  <a
                    href={`tel:${u.telefone.replace(/\D/g, "")}`}
                    className="font-semibold text-plum-700 hover:underline"
                  >
                    {u.telefone}
                  </a>
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {servicosDa(u).map((s) => (
                  <span
                    key={s}
                    className={
                      s === filtro
                        ? "rounded-full bg-plum-100 px-2.5 py-0.5 text-xs font-semibold text-plum-800"
                        : "rounded-full bg-mist px-2.5 py-0.5 text-xs text-ink"
                    }
                  >
                    {servicoLabel(s)}
                  </span>
                ))}
              </div>

              {u.observacao && (
                <p className="mt-3 rounded-xl bg-mist p-3 text-sm text-ink">
                  {u.observacao}
                </p>
              )}
            </Card>
          ))}
          </div>
        </>
      )}
    </>
  );
}

function FiltroLink({
  href,
  rotulo,
  ativo,
}: {
  href: string;
  rotulo: string;
  ativo: boolean;
}) {
  return (
    <a
      href={href}
      className={
        ativo
          ? "rounded-full bg-plum-700 px-3.5 py-1.5 text-sm font-semibold text-white"
          : "rounded-full border border-line px-3.5 py-1.5 text-sm text-muted hover:border-plum-300 hover:text-ink"
      }
    >
      {rotulo}
    </a>
  );
}

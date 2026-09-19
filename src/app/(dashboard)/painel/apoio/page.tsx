import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import {
  tipoServicoLabel,
  VALIDADE_VERIFICACAO_DIAS,
} from "@core/protecao";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Apoio" };

const HOTLINES = [
  { number: "180", label: "Central de Atendimento à Mulher", note: "Denúncia e orientação, 24h, gratuito e sigiloso." },
  { number: "190", label: "Polícia Militar", note: "Emergências e situações de risco imediato." },
  { number: "192", label: "SAMU", note: "Emergências de saúde." },
  { number: "100", label: "Direitos Humanos", note: "Denúncia de violações de direitos." },
];

export default async function ApoioPage() {
  await requireUser();

  // A mesma regra da API: contato local só aparece enquanto a verificação
  // humana tiver menos de 90 dias. Se vencer, permanecem os canais nacionais.
  const limite = new Date(
    Date.now() - VALIDADE_VERIFICACAO_DIAS * 24 * 60 * 60 * 1000,
  );
  const servicosLocais = await db.supportService.findMany({
    where: { active: true, verifiedAt: { gte: limite } },
    orderBy: [{ ordem: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Apoio"
        description="Rede de apoio, direitos e oportunidades para as mulheres de Canaã."
      />

      {/* Rede de apoio à violência */}
      <Card className="border-plum-200 bg-plum-50/60">
        <div className="flex items-start gap-3">
          <Icon name="shield" className="mt-0.5 h-5 w-5 text-plum-700" />
          <div className="w-full">
            <CardTitle>Você não está sozinha</CardTitle>
            <p className="mt-1 text-sm text-muted">
              Em caso de violência ou risco, procure ajuda. O atendimento é
              gratuito e sigiloso.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {HOTLINES.map((h) => (
                <a
                  key={h.number}
                  href={`tel:${h.number}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition-colors hover:border-plum-300"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-plum-700 font-display text-lg font-semibold text-white">
                    {h.number}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-ink">
                      {h.label}
                    </span>
                    <span className="block text-xs text-muted">{h.note}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <section className="mt-6">
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">
          Atendimento local verificado
        </h2>
        {servicosLocais.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">
              Nenhum contato municipal está com a verificação em dia. Use os
              canais nacionais acima enquanto a equipe atualiza a rede local.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {servicosLocais.map((servico) => (
              <Card key={servico.id}>
                <Badge tone="sage">{tipoServicoLabel(servico.kind)}</Badge>
                <CardTitle className="mt-2">{servico.name}</CardTitle>
                {servico.hours && (
                  <p className="mt-1 text-sm text-muted">{servico.hours}</p>
                )}
                {servico.address && (
                  <p className="mt-1 text-sm text-ink">{servico.address}</p>
                )}
                {servico.phone && (
                  <a
                    href={`tel:${servico.phone.replace(/\D/g, "")}`}
                    className="mt-3 inline-flex rounded-full bg-plum-700 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-800"
                  >
                    Ligar: {servico.phone}
                  </a>
                )}
                {servico.notes && (
                  <p className="mt-3 text-xs text-muted">{servico.notes}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Pobreza menstrual */}
      <Card className="mt-6">
        <Badge tone="clay">Dignidade menstrual</Badge>
        <CardTitle className="mt-2">Acesso a absorventes</CardTitle>
        <p className="mt-1 text-sm text-muted">
          A falta de acesso a itens de higiene menstrual afeta a saúde e a
          permanência na escola e no trabalho. Programas públicos distribuem
          absorventes gratuitamente em unidades de saúde, escolas e CRAS.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-ink">
          {[
            "Procure a UBS ou o CRAS mais próximo para saber sobre a distribuição.",
            "Escolas da rede pública também podem ser pontos de retirada.",
            "Os pontos oficiais de Canaã dos Carajás serão listados aqui em breve.",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2.5">
              <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-plum-500" strokeWidth={2.5} />
              {t}
            </li>
          ))}
        </ul>
      </Card>

      {/* Empreendedorismo */}
      <Card className="mt-6">
        <Badge tone="sage">Autonomia</Badge>
        <CardTitle className="mt-2">Capacitação e empreendedorismo</CardTitle>
        <p className="mt-1 text-sm text-muted">
          Oportunidades para gerar renda e crescer profissionalmente.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { t: "Cursos gratuitos", d: "SENAI, SEBRAE e programas municipais." },
            { t: "Microcrédito", d: "Linhas de crédito para pequenos negócios." },
            { t: "Vagas de emprego", d: "Parcerias locais para inclusão produtiva." },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-line p-3">
              <p className="text-sm font-medium text-ink">{c.t}</p>
              <p className="mt-0.5 text-xs text-muted">{c.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">
          Em breve com vagas e cursos integrados de parceiros locais.
        </p>
      </Card>
    </div>
  );
}
